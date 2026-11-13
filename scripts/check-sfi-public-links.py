"""Check local assets, destinations and anchors in the built SFI public routes."""
import json
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

if len(sys.argv) != 2:
    raise SystemExit("Usage: python3 scripts/check-sfi-public-links.py BUILT_SITE")
root = Path(sys.argv[1])
routes = ["/", "/about/", "/services/", "/news-events/", "/sfi-specs/",
          "/specs/", "/history/", "/contact/", "/login/"]


class Parser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []
        self.ids = set()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.add(attrs["id"])
        if tag in ("a", "link", "script", "img"):
            url = attrs.get("href", attrs.get("src", ""))
            if url.startswith("/"):
                self.urls.append(url)


cache = {}


def parse(file):
    if file not in cache:
        parser = Parser()
        parser.feed(file.read_text())
        cache[file] = parser
    return cache[file]


def resolve(url):
    target = root / unquote(urlsplit(url).path).lstrip("/")
    return target / "index.html" if target.is_dir() else target


errors = []
total = 0
for route in routes:
    file = root / route.strip("/") / "index.html"
    for url in parse(file).urls:
        total += 1
        target = resolve(url)
        if not target.exists():
            errors.append([route, url, "missing target"])
        elif target.suffix == ".html":
            fragment = urlsplit(url).fragment
            if fragment and fragment not in parse(target).ids:
                errors.append([route, url, "missing fragment"])
print(json.dumps({"checked": total, "errors": errors}, indent=2))
if errors:
    raise SystemExit(1)
