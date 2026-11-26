"""Manage the paired, opt-in local board preview without taking other ports."""
import argparse
import fcntl
import json
import os
from pathlib import Path
import re
import signal
import sqlite3
import subprocess
import sys
import time
from urllib.request import ProxyHandler, build_opener

from importlib.util import module_from_spec, spec_from_file_location

spec = spec_from_file_location('local_preview', Path(__file__).with_name('sfi-local-preview.py'))
preview = module_from_spec(spec)
spec.loader.exec_module(preview)
opener = build_opener(ProxyHandler({}))


def request(path):
    with opener.open(path, timeout=3) as response:
        return response.read().decode()


def owned(process, source, marker):
    if process and (process['cwd'] != source or not any(marker in arg for arg in process['command'])):
        raise RuntimeError(f"Port belongs to another service: PID {process['pid']} at {process['cwd']}. Nothing was stopped.")


def backend_listener(source):
    output = subprocess.check_output(['ss', '-H', '-ltnp', 'sport = :8606'], text=True)
    if not output.strip():
        return None
    pids = set(map(int, re.findall(r'pid=(\d+)', output)))
    if not pids:
        raise RuntimeError('Backend listener has no identifiable owner.')
    processes = []
    for pid in pids:
        process = {'pid': pid, 'cwd': Path(f'/proc/{pid}/cwd').resolve(),
                   'command': Path(f'/proc/{pid}/cmdline').read_bytes().rstrip(b'\0').decode().split('\0')}
        owned(process, source, 'phase1_local.py')
        processes.append(process)
    # Werkzeug shares the listening socket between its stat supervisor and child.
    if len({os.getpgid(pid) for pid in pids}) != 1:
        raise RuntimeError('Unrelated processes share the backend port; none stopped.')
    return max(processes, key=lambda process: process['pid'])


def stop_backend(process, source, state_file):
    if not process:
        return
    owned(process, source, 'phase1_local.py')
    state = json.loads(state_file.read_text()) if state_file.exists() else {}
    leader = state.get('pid')
    # Stop the reloader parent and child together only when both are our session.
    if leader and os.getpgid(process['pid']) == leader:
        parent = Path(f'/proc/{leader}')
        if parent.joinpath('cwd').resolve() != source or b'phase1_local.py' not in parent.joinpath('cmdline').read_bytes():
            raise RuntimeError('Backend supervisor identity changed; refusing to stop it.')
        os.killpg(leader, signal.SIGTERM)
    elif '--reload' not in process['command']:
        os.kill(process['pid'], signal.SIGTERM)  # Adopt the previous single-process board server.
    else:
        raise RuntimeError('Unmanaged reload server found; preserve it and inspect its supervisor.')
    deadline = time.monotonic() + 20
    while True:
        try:
            active = backend_listener(source)
        except (RuntimeError, FileNotFoundError):
            active = True  # Socket teardown may briefly have no owning PID.
        if not active:
            break
        if time.monotonic() > deadline:
            raise RuntimeError('Backend did not stop; no force-kill was used.')
        time.sleep(.2)


def prepare_database(database, workspace, backend, python, environment):
    if database.exists():
        return
    database.parent.mkdir(parents=True, exist_ok=True)
    previous = Path('/tmp/sfi-board-review.db')
    if previous.exists():
        # SQLite backup preserves the current prepared fixture, including PDF evidence.
        # Never rename, overwrite or remove the original database.
        with sqlite3.connect(f'file:{previous}?mode=ro', uri=True) as source:
            with sqlite3.connect(database) as destination:
                source.backup(destination)
        print(f'Preserved prepared fixture at {database}', flush=True)
    else:
        subprocess.run([
            str(python), 'scripts/prepare_board_review.py', '--database', f'sqlite:///{database}',
            '--source-dir', str(workspace / 'sfi-private-data'),
            '--report', str(database.parent / 'preparation-report.json'),
        ], cwd=backend, env=environment, check=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['start', 'restart', 'refresh', 'status', 'stop'])
    parser.add_argument('--workspace', required=True, type=Path)
    args = parser.parse_args()
    workspace = args.workspace.resolve()
    frontend = workspace / 'worktrees/board-review/Frontend'
    backend = workspace / 'worktrees/board-review/Backend'
    python = workspace / 'SFI-Backend/venv/bin/python'
    database = workspace / 'sfi-private-data/board-review/preview.db'
    config = '_config.yml,_config.development.yml,_config.board-review.yml'
    state_dir = workspace / 'reports/board-preview-live'
    state_dir.mkdir(parents=True, exist_ok=True)
    # Serialize relaunches; repeated start commands cannot race for the same ports.
    with (state_dir / 'launcher.lock').open('w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        front_process, back_process = preview.listener(4600), backend_listener(backend)
        if args.action == 'status':
            for name, process in [('frontend', front_process), ('backend', back_process)]:
                print(json.dumps({'service': name, **process, 'cwd': str(process['cwd'])} if process else {'service': name, 'running': False}, indent=2))
            print(f'Home: http://localhost:4600/\nAPI: http://localhost:8606/api/sfi/health\nDatabase: {database}')
            return
        # Validate both ports before stopping either service.
        owned(front_process, frontend, 'jekyll')
        owned(back_process, backend, 'phase1_local.py')
        frontend_command = [sys.executable, str(frontend / 'scripts/sfi-local-preview.py'),
                            '--source', str(frontend), '--host', '127.0.0.1', '--port', '4600',
                            '--destination', '/tmp/sfi-board-demo-site', '--config', config, '--force-polling']
        state_file = state_dir / 'backend.json'
        if args.action == 'stop':
            subprocess.run([*frontend_command, 'stop'], check=True)
            stop_backend(back_process, backend, state_file)
            print('Board preview stopped. Other services and all databases preserved.')
            return
        environment = dict(os.environ, PYTHON_DOTENV_DISABLED='1', SFI_DATABASE_URI='sqlite://',
                           JEKYLL_ENV='development', PYTHONUNBUFFERED='1')
        prepare_database(database, workspace, backend, python, environment)
        back_command = [str(python), 'scripts/phase1_local.py', '--database', f'sqlite:///{database}',
                        '--port', '8606', '--reload']
        restart = args.action in ('restart', 'refresh')
        if back_process and (restart or back_process['command'][1:] != back_command[1:]):
            stop_backend(back_process, backend, state_file)
            back_process = None
        if not back_process:
            log = state_dir / 'backend.log'
            with log.open('ab') as output:
                child = subprocess.Popen(back_command, cwd=backend, env=environment,
                                         stdin=subprocess.DEVNULL, stdout=output, stderr=subprocess.STDOUT,
                                         start_new_session=True)
            state_file.write_text(json.dumps({'pid': child.pid, 'command': back_command,
                                              'source': str(backend), 'database': str(database)}, indent=2) + '\n')
            deadline = time.monotonic() + 30
            while True:
                if child.poll() is not None:
                    raise RuntimeError(f'Backend failed; inspect {log}')
                try:
                    if json.loads(request('http://localhost:8606/api/sfi/health'))['status'] == 'ok':
                        break
                except (OSError, ValueError):
                    pass
                if time.monotonic() > deadline:
                    raise RuntimeError(f'Backend startup timeout; inspect {log}')
                time.sleep(.3)
        expected = [config, '--watch', '--force_polling']
        front_action = 'restart' if restart or (front_process and not all(value in front_process['command'] for value in expected)) else 'start'
        subprocess.run([*frontend_command, front_action], env=environment, check=True)
        if 'http://localhost:8606' not in request('http://localhost:4600/assets/js/sfi/api-base.js'):
            raise RuntimeError('Served frontend does not point at the board API.')
        if 'demoBoardMessages' not in request('http://localhost:4600/sfi-manufacturer-demo/'):
            raise RuntimeError('Served dashboard is missing; inspect the demo configuration.')
        print('Ready: http://localhost:4600/\nSearch: http://localhost:4600/sfi-specs/\nDashboard: http://localhost:4600/sfi-manufacturer-demo/', flush=True)
        print('Watch: polling, including opt-in _internal sources. Backend: stat reload, debugger off.\nRefresh the browser after rebuild. Config/plugins/dependencies/database URI: rerun with restart.', flush=True)


if __name__ == '__main__':
    try:
        main()
    except (RuntimeError, subprocess.CalledProcessError, OSError) as error:
        print(f'Board preview error: {error}', file=sys.stderr)
        sys.exit(1)
