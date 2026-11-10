#!/usr/bin/env python3
"""Refresh the public SFI news/event snapshot without copying article bodies."""
import datetime as dt
import html
import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "_data" / "sfi_updates.json"
FEED = "https://sfifoundation.com/feed/"
SCHEDULE = "https://sfifoundation.com/meeting-schedule/"

class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
    def handle_data(self, data):
        if data.strip():
            self.parts.append(data.strip())

def download(url):
    req = urllib.request.Request(url, headers={"User-Agent": "SFI-Capstone-News-Sync/1.0"})
    with urllib.request.urlopen(req, timeout=25) as response:
        return response.read()

def trusted(url):
    p = urlparse(url)
    return p.scheme == "https" and p.hostname in {"sfifoundation.com", "www.sfifoundation.com"}

def get_news():
    root = ET.fromstring(download(FEED))
    items = []
    for node in root.findall("./channel/item")[:12]:
        title = html.unescape(node.findtext("title", "").strip())
        link = node.findtext("link", "").strip()
        pubdate = node.findtext("pubDate", "").strip()
        if not title or not trusted(link):
            continue
        # RSS pubDates use RFC 2822; keep original label rather than inventing a date.
        items.append({"title": title, "url": link, "published": pubdate})
    return items

def get_events():
    parser = TextExtractor()
    parser.feed(download(SCHEDULE).decode("utf-8", errors="replace"))
    text = " ".join(parser.parts)
    # The official page changes annually; parse dates anew and never show past meetings as upcoming.
    found = re.findall(r"(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+"
                       r"(January|February|March|April|May|June|July|August|September|October|November|December)\s+"
                       r"(\d{1,2}),?\s+(20\d{2})", text)
    days = []
    for month, day, year in found:
        try:
            day_value = dt.datetime.strptime(f"{month} {day} {year}", "%B %d %Y").date()
            if day_value >= dt.datetime.now(dt.timezone.utc).date() and day_value not in days:
                days.append(day_value)
        except ValueError:
            pass
    days.sort()
    return [{"title": "SFI Specification Review Meetings",
             "start": date.isoformat(),
             "date_label": date.strftime("%B %-d, %Y"),
             "location": "See official SFI meeting schedule for location and session times",
             "url": SCHEDULE, "source": "SFI Foundation"} for date in days[:15]]

def main():
    previous = json.loads(OUT.read_text()) if OUT.exists() else {"news": [], "events": []}
    updated = dict(previous)
    errors = []
    for key, getter in [("news", get_news), ("events", get_events)]:
        try:
            result = getter()
            if key == "news" and not result:
                raise ValueError("No valid feed items")
            # If no future events, an empty list is correct; historical meetings should disappear.
            updated[key] = result
        except Exception as exc:
            errors.append(f"{key}: {exc}")
    if len(errors) == 2:
        raise RuntimeError("All SFI sources failed: " + "; ".join(errors))
    rendered = json.dumps(updated, indent=2, ensure_ascii=False) + "\n"
    if not OUT.exists() or OUT.read_text() != rendered:
        OUT.write_text(rendered)
    for error in errors:
        print("WARNING:", error)

if __name__ == "__main__":
    main()
