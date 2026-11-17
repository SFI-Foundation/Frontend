"""Check generated public SFI links/assets for root or project-path builds.

Usage: python3 scripts/test-sfi-paths.py SITE_DIRECTORY [BASEURL]
"""
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit

site = Path(sys.argv[1])
base = sys.argv[2].rstrip('/') if len(sys.argv) > 2 else ''
routes = ['', 'about/', 'history/', 'services/', 'contact/', 'specs/',
          'sfi-specs/', 'detect/', 'quiz/', 'login/', 'signup/', 'admin/',
          'sfi-profile/', 'sfifoundation/', 'capstone/sfi-repo-setup/']

class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in ('href', 'src') and value:
                self.links.append(value)

checked = 0
errors = []
for route in routes:
    page = site / route / 'index.html'
    if not page.is_file():
        errors.append(f'Missing page: {page}')
        continue
    parser = Links()
    parser.feed(page.read_text())
    for link in parser.links:
        if link.startswith('#'):
            continue
        url = urlsplit(urljoin(f'https://sfi.test{base}/{route}', link))
        if url.netloc != 'sfi.test' or url.scheme != 'https':
            continue
        path = unquote(url.path)
        if base and not (path == base or path.startswith(base + '/')):
            errors.append(f'{route}: escapes {base}: {link}')
            continue
        relative = path[len(base):].lstrip('/')
        target = site / relative
        if target.is_dir():
            target /= 'index.html'
        if not target.is_file():
            errors.append(f'{route}: missing target: {link}')
        checked += 1
if errors:
    raise SystemExit('\n'.join(errors))
print(f'PASS: {len(routes)} pages; {checked} internal navigation/asset targets; baseurl={base!r}')
