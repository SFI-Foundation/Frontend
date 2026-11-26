"""Run the selected Git worktree on the user's normal local preview port."""
import argparse
import json
import os
from pathlib import Path
import re
import signal
import subprocess
import sys
import time
from urllib.request import ProxyHandler, build_opener


def git(path, *arguments):
    return subprocess.check_output(['git', '-C', str(path), *arguments], text=True).strip()


def common_directory(path):
    return Path(git(path, 'rev-parse', '--path-format=absolute', '--git-common-dir')).resolve()


def listener(port):
    output = subprocess.check_output(['ss', '-H', '-ltnp', f'sport = :{port}'], text=True)
    pids = set(re.findall(r'pid=(\d+)', output))
    if output.strip() and len(pids) != 1:
        raise RuntimeError(f'Port {port} has an unidentified or ambiguous listener; no process was stopped.')
    if not pids:
        return None
    pid = int(pids.pop())
    cwd = Path(f'/proc/{pid}/cwd').resolve()
    command = Path(f'/proc/{pid}/cmdline').read_bytes().rstrip(b'\0').split(b'\0')
    return {'pid': pid, 'cwd': cwd, 'command': [part.decode() for part in command]}


def owned_jekyll(process, source):
    if not any('jekyll' in part for part in process['command']):
        raise RuntimeError(f"Port is owned by PID {process['pid']}, not Jekyll; no process was stopped.")
    if common_directory(process['cwd']) != common_directory(source):
        raise RuntimeError('The listening Jekyll belongs to another repository; no process was stopped.')


def stop(process, source, port):
    owned_jekyll(process, source)
    print(f"Stopping only Jekyll PID {process['pid']} from {process['cwd']} on port {port}.", flush=True)
    os.kill(process['pid'], signal.SIGTERM)
    deadline = time.monotonic() + 15
    while time.monotonic() < deadline:
        current = listener(port)
        if current is None:
            return
        if current['pid'] != process['pid']:
            raise RuntimeError('Another process claimed the port during restart; it was left untouched.')
        time.sleep(.2)
    raise RuntimeError('Jekyll did not release the port after SIGTERM. No force-kill was used.')


def configure(source, checkout):
    if common_directory(source) != common_directory(checkout):
        raise RuntimeError('The preview source must be a worktree of the same frontend repository.')
    adapter = checkout / 'GNUmakefile'
    marker = '# SFI managed local preview adapter'
    if adapter.exists() and not adapter.read_text().startswith(marker):
        raise RuntimeError('An existing GNUmakefile is present; it was preserved. Configure it manually.')
    adapter.write_text(marker + '\n'
        'SFI_PREVIEW_SOURCE ?= $(shell git config --local --path --get sfi.previewWorktree)\n'
        'ifneq ($(strip $(SFI_PREVIEW_SOURCE)),)\n'
        'include $(SFI_PREVIEW_SOURCE)/scripts/sfi-local-preview.mk\n'
        'else\ninclude Makefile\nendif\n')
    subprocess.run(['git', '-C', str(checkout), 'config', '--local', 'sfi.previewWorktree', str(source)], check=True)
    exclude = Path(git(checkout, 'rev-parse', '--path-format=absolute', '--git-path', 'info/exclude'))
    text = exclude.read_text() if exclude.exists() else ''
    if '/GNUmakefile' not in text.splitlines():
        exclude.parent.mkdir(parents=True, exist_ok=True)
        with exclude.open('a') as stream:
            stream.write('\n# Local worktree preview routing\n/GNUmakefile\n')
    print(f'Normal make commands in {checkout} now use {source}.')
    print('Selection is stored in local Git config; no branch was changed or merged.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['configure', 'start', 'restart', 'stop', 'status'])
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--checkout', type=Path)
    parser.add_argument('--host', default='localhost')
    parser.add_argument('--port', type=int, default=4500)
    parser.add_argument('--baseurl', default='')
    parser.add_argument('--destination', default='_site_preview/4500')
    parser.add_argument('--config', help='Comma-separated Jekyll configuration files')
    parser.add_argument('--force-polling', action='store_true', help='Reliable WSL file watching')
    args = parser.parse_args()
    source = args.source.resolve()
    if not (source / 'Gemfile').is_file() or not (source / '_config.yml').is_file():
        raise RuntimeError('Supply the actual frontend worktree containing Gemfile and _config.yml.')
    branch = git(source, 'branch', '--show-current')
    print(f'Preview source: {source}\nGit branch: {branch}', flush=True)
    if args.action == 'configure':
        configure(source, (args.checkout or Path.cwd()).resolve())
        return
    url = f'http://{args.host}:{args.port}{args.baseurl}/'
    process = listener(args.port)
    if args.action == 'status':
        print(json.dumps({'url': url, 'source': str(source), 'branch': branch,
                          'listener': {**process, 'cwd': str(process['cwd'])} if process else None}, indent=2))
        return
    if process:
        owned_jekyll(process, source)
        configured = not args.config or ('--config' in process['command'] and
                     process['command'][process['command'].index('--config') + 1] == args.config)
        watching = not args.force_polling or ('--watch' in process['command'] and '--force_polling' in process['command'])
        if args.action == 'start' and process['cwd'] == source and configured and watching:
            print(f"Already serving {url} with Jekyll PID {process['pid']}.")
            return
        stop(process, source, args.port)
    if args.action == 'stop':
        print('Selected frontend preview is stopped; backend and other servers are untouched.')
        return
    destination = Path(args.destination)
    if not destination.is_absolute():
        destination = source / destination
    log = Path(f'/tmp/jekyll{args.port}.log')
    environment = dict(os.environ, BUNDLE_GEMFILE=str(source / 'Gemfile'))
    environment.setdefault('JEKYLL_ENV', 'development')
    command = ['bundle', 'exec', 'jekyll', 'serve', '-H', args.host, '-P', str(args.port),
               '--baseurl', args.baseurl, '--destination', str(destination), '--disable-disk-cache']
    if args.config:
        command.extend(['--config', args.config])
    if args.force_polling:
        command.extend(['--watch', '--force_polling'])
    with log.open('ab') as stream:
        stream.write(f'\nSFI preview starting from {source} [{branch}]\n'.encode())
        child = subprocess.Popen(command, cwd=source, env=environment, stdout=stream,
                                 stderr=subprocess.STDOUT, start_new_session=True)
    state = common_directory(source) / f'sfi-preview-{args.port}.json'
    state.write_text(json.dumps({'pid': child.pid, 'source': str(source), 'branch': branch,
                                'url': url, 'command': command, 'log': str(log)}, indent=2) + '\n')
    print(f'Starting Jekyll PID {child.pid} at {url}\nBuild log: {log}', flush=True)
    opener = build_opener(ProxyHandler({}))
    deadline = time.monotonic() + 600
    while time.monotonic() < deadline:
        if child.poll() is not None:
            raise RuntimeError(f'Jekyll exited with status {child.returncode}; inspect {log}.')
        try:
            with opener.open(url, timeout=2) as response:
                if response.status == 200:
                    active = listener(args.port)
                    if active and active['pid'] == child.pid:
                        print(f'Ready: {url}\nSource: {source}\nBranch: {branch}', flush=True)
                        return
        except OSError:
            pass
        time.sleep(1)
    raise RuntimeError(f'Jekyll startup timed out; inspect {log}.')


if __name__ == '__main__':
    try:
        main()
    except (RuntimeError, subprocess.CalledProcessError) as error:
        print(f'Preview error: {error}', file=sys.stderr)
        sys.exit(1)
