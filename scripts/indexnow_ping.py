#!/usr/bin/env python3
"""Submit every URL in sitemap.xml to IndexNow (Bing, Yandex, Naver, Seznam).

Run from the repository root after a deploy: python3 scripts/indexnow_ping.py
The key is the name of the one *.txt file at the repository root whose content is
its own name. Google does not use IndexNow. Stdlib only.
"""
from __future__ import annotations

import json
import pathlib
import re
import sys
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
HOST = "answerlore.com"


def key() -> str:
    for p in ROOT.glob("*.txt"):
        if re.fullmatch(r"[0-9a-f]{32}", p.stem) and p.read_text().strip() == p.stem:
            return p.stem
    raise SystemExit("no IndexNow key file at the repository root")


def urls() -> list[str]:
    return re.findall(r"<loc>(.*?)</loc>", (ROOT / "sitemap.xml").read_text())


def main() -> int:
    k = key()
    body = json.dumps({"host": HOST, "key": k, "keyLocation": f"https://{HOST}/{k}.txt",
                       "urlList": urls()}).encode()
    req = urllib.request.Request("https://api.indexnow.org/indexnow", data=body,
                                 headers={"Content-Type": "application/json; charset=utf-8"})
    with urllib.request.urlopen(req, timeout=30) as r:
        print(f"IndexNow: HTTP {r.status} for {len(urls())} URLs")
    return 0


if __name__ == "__main__":
    sys.exit(main())
