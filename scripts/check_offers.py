#!/usr/bin/env python3
"""Check that every price, limit, and promise on the site agrees with assets/offers.json.

Run from the repository root: python3 scripts/check_offers.py
Exit code 1 on any failure. Stdlib only.

What it checks:
1. The arithmetic in offers.json: month-to-month is annual x (1 + monthly_uplift),
   first-year totals are Knowledge Map + 12 months at each rate.
2. Every dollar figure printed on any page is one the config derives, or a cited
   third-party figure listed under external_figures.
3. Phrases the site must not print (retired promises, wrong percentages).
4. Every internal link resolves to a file in this repository.
5. Every page that carries the pilot offer prints the same terms.
"""
from __future__ import annotations

import json
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
OFFERS = ROOT / "assets" / "offers.json"

FORBIDDEN = [
    ("20% less", "annual billing is about 16.7% less than month to month, not 20%"),
    ("Most dealers land here", "implies customers; use 'For multi-brand support teams'"),
    ("about two minutes", "retired trial promise"),
    ("Open the sample workspace", "retired button label; access is assisted"),
    ("five business days", "turnaround commitment not confirmed by the founder"),
    ("Try it on a real manual", "retired call to action; use 'Request a guided trial'"),
    ("A general model can't refuse", "categorical claim about other products"),
]


def money(n: int) -> str:
    return f"{n:,}"


def main() -> int:
    failures: list[str] = []
    cfg = json.loads(OFFERS.read_text())
    uplift = cfg["monthly_uplift"]
    allowed: set[str] = set()

    # 1. arithmetic
    for key, tier in cfg["tiers"].items():
        annual, mtm, kmap = tier["annual_per_month"], tier["month_to_month"], tier["knowledge_map"]
        if round(annual * (1 + uplift)) != mtm:
            failures.append(f"{key}: month_to_month {mtm} != {annual} x {1 + uplift}")
        fy_annual = kmap + 12 * annual
        fy_mtm = kmap + 12 * mtm
        if cfg["first_year"]["annual"][key] != fy_annual:
            failures.append(f"{key}: first_year.annual should be {fy_annual}")
        if cfg["first_year"]["month_to_month"][key] != fy_mtm:
            failures.append(f"{key}: first_year.month_to_month should be {fy_mtm}")
        for n in (annual, mtm, kmap, 12 * annual, 12 * mtm, fy_annual, fy_mtm):
            allowed.add(money(n))
    pilot = cfg["pilot"]
    allowed.add(money(pilot["price"]))
    allowed.add(money(pilot["credit"]["amount"]))
    allowed.update(k for k in cfg["external_figures"] if not k.startswith("_"))
    discount = 1 - 1 / (1 + uplift)
    print(f"annual discount vs month to month: {discount:.1%}")

    pages = sorted(p for p in ROOT.glob("*.html"))
    # Only committed pages are checked. An untracked draft is somebody's work in
    # progress, not the site; it is named so nobody mistakes the skip for a pass.
    try:
        tracked = set(subprocess.run(["git", "ls-files", "*.html"], cwd=ROOT, check=True,
                                     capture_output=True, text=True).stdout.split())
        for p in pages:
            if p.name not in tracked:
                print(f"skipped {p.name}: not tracked by git")
        pages = [p for p in pages if p.name in tracked]
    except (OSError, subprocess.CalledProcessError):
        pass
    href_re = re.compile(r'href="(/[^"#?]*)')
    dollar_re = re.compile(r"\$(\d[\d,]*\d|\d)")

    for page in pages:
        text = page.read_text()
        # 2. dollar figures (guides with cited worked figures are exempt)
        if page.name not in cfg.get("editorial_pages", {}).get("pages", []):
            for fig in dollar_re.findall(text):
                if fig not in allowed:
                    failures.append(f"{page.name}: ${fig} is not derived from offers.json")
        # 3. forbidden phrases
        for phrase, why in FORBIDDEN:
            if phrase in text:
                failures.append(f"{page.name}: prints '{phrase}' ({why})")
        # 4. internal links
        for href in set(href_re.findall(text)):
            target = "index.html" if href == "/" else href.lstrip("/")
            candidates = [ROOT / target, ROOT / f"{target}.html", ROOT / target / "index.html"]
            if not any(c.exists() for c in candidates):
                failures.append(f"{page.name}: link {href} has no file in this repository")
        # 5. pilot terms
        if 'data-offer="pilot"' in text:
            for needle in (f"${money(pilot['price'])}", f"{pilot['days']}-day",
                           f"{pilot['manuals']} manuals", f"{pilot['users']} ",
                           f"{pilot['evaluation_questions']} "):
                if needle not in text:
                    failures.append(f"{page.name}: pilot block is missing '{needle}'")

    print(f"checked {len(pages)} pages, {len(allowed)} allowed figures")
    for f in failures:
        print("FAIL", f)
    print("ok" if not failures else f"{len(failures)} failure(s)")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
