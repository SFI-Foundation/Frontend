"""Disposable extension of the existing Flask profile bridge for settings QA.

The extra canonical catalog table is prepared ONLY in a temporary source copy.
Usage: <backend-python> scripts/sfi-settings-fixture.py <backend-checkout>
"""
import os
from pathlib import Path
import runpy
import shutil
import subprocess
import sys
import tempfile

if '--isolated-settings' in sys.argv:
    target = Path(os.environ['SFI_PROFILE_TEST_ROOT']).resolve()
    assert target == Path.cwd().resolve() == Path(__file__).resolve().parents[1]
    assert target.parent == Path(tempfile.gettempdir()) and target.name.startswith('sfi-profile-tests-')
    context = runpy.run_path(str(target / 'testing/test_sfi_profile.py'), run_name='settings_fixture')
    from scripts.migrate_sfi_catalog import upgrade
    with context['app'].app_context():
        upgrade(context['db'].engine)
    context['wsgi_bridge']()
else:
    source = Path(sys.argv[1]).resolve()
    assert (source / 'testing/test_sfi_profile.py').is_file(), 'Supply the backend checkout'
    with tempfile.TemporaryDirectory(prefix='sfi-profile-tests-') as directory:
        target = Path(directory)
        files = subprocess.check_output(['git', 'ls-files', '-co', '--exclude-standard', '-z'], cwd=source).decode().split('\0')
        for name in set(files):
            path = Path(name)
            if not name or path.parts[0] in ('instance', 'venv', '.git'):
                continue
            if path.suffix != '.py' and path.parts[0] not in ('datasets', 'templates'):
                continue
            original = (source / path).resolve()
            if not original.is_relative_to(source) or not original.is_file():
                continue
            destination = target / path
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(original, destination)
        for name in ('sfi_specs.json', 'sfi_search_terms.json'):
            shutil.copyfile(source / name, target / name)
        (target / 'instance/volumes').mkdir(parents=True)
        runner = target / 'testing/settings_fixture.py'
        shutil.copyfile(__file__, runner)
        env = {'PATH': os.defpath, 'PYTHON_DOTENV_DISABLED': '1',
               'MPLCONFIGDIR': str(target / 'matplotlib'),
               'SFI_PROFILE_TEST_ROOT': str(target),
               'SFI_SPECS_PATH': str(target / 'sfi_specs.json')}
        raise SystemExit(subprocess.run([sys.executable, str(runner), '--isolated-settings'], cwd=target, env=env).returncode)
