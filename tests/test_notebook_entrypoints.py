"""Exercise the Pages module entry point and the retained direct-script command."""
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

import nbformat


class NotebookEntrypointTests(unittest.TestCase):
    def test_module_and_script_convert_without_touching_repository_content(self):
        source = Path(__file__).resolve().parents[1]
        for invocation in [('module', ['-m', 'scripts.convert_notebooks']),
                           ('script', ['scripts/convert_notebooks.py'])]:
            with self.subTest(entrypoint=invocation[0]), tempfile.TemporaryDirectory(prefix='sfi-pages-entrypoint-') as directory:
                root = Path(directory)
                (root / 'scripts').mkdir()
                (root / 'scripts/__init__.py').touch()
                for name in ['convert_notebooks.py', 'progress_bar.py']:
                    shutil.copyfile(source / 'scripts' / name, root / 'scripts' / name)
                (root / '_notebooks').mkdir()
                notebook = nbformat.v4.new_notebook(cells=[
                    nbformat.v4.new_markdown_cell('---\nlayout: sfi\ntitle: Isolated deployment check\n---'),
                    nbformat.v4.new_markdown_cell('Synthetic notebook body for the Pages entry point.'),
                ])
                nbformat.write(notebook, root / '_notebooks/2026-11-18-deployment-check.ipynb')
                environment = {key: value for key, value in os.environ.items() if key not in ('PYTHONPATH', 'PYTHONHOME')}
                result = subprocess.run([sys.executable, *invocation[1], '_notebooks/2026-11-18-deployment-check.ipynb'],
                                        cwd=root, env=environment, capture_output=True, text=True, timeout=30)
                self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
                output = root / '_posts/2026-11-18-deployment-check_IPYNB_2_.md'
                self.assertTrue(output.is_file(), result.stdout + result.stderr)
                self.assertIn('Synthetic notebook body', output.read_text())
                self.assertIn('title: Isolated deployment check', output.read_text())


if __name__ == '__main__':
    unittest.main(verbosity=2)
