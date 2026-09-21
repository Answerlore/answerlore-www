#!/usr/bin/env python3
"""Generate the machine-readable files from their one source.

Run from the repository root:
    python3 scripts/build_machine_files.py          # write the files
    python3 scripts/build_machine_files.py --check  # exit 1 if any file has drifted

What it produces:
1. pricing.md        every price and limit, from assets/offers.json
2. sitemap.xml       every tracked page except 404.html, lastmod from git
3. pricing.html      the JSON-LD block between <!-- ld:pricing --> markers:
                     SoftwareApplication offers from offers.json, and FAQPage
                     built from the page's own visible .faq-item text, so the
                     schema can never say something the page does not.

Prices change in offers.json first, then this script runs. Stdlib only.
"""
from __future__ import annotations

import datetime as dt
import html
import json
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
OFFERS = ROOT / "assets" / "offers.json"
SITE = "https://answerlore.com"
LD_START, LD_END = "<!-- ld:pricing -->", "<!-- /ld:pricing -->"


def money(n: int) -> str:
    return f"${n:,}"


def limit(v, unit: str) -> str:
    if v is None:
        return "unlimited"
    if v == 1:
        return f"1 {unit.rstrip('s')}"
    return f"up to {v:,} {unit}"


def git_date(path: pathlib.Path) -> str:
    try:
        out = subprocess.run(["git", "log", "-1", "--format=%cs", "--", path.name],
                             cwd=ROOT, check=True, capture_output=True, text=True).stdout.strip()
        if out:
            return out
    except (OSError, subprocess.CalledProcessError):
        pass
    return dt.date.today().isoformat()


def tracked_pages() -> list[pathlib.Path]:
    out = subprocess.run(["git", "ls-files", "*.html"], cwd=ROOT, check=True,
                         capture_output=True, text=True).stdout.split()
    pages = sorted(ROOT / p for p in out if p != "404.html")
    return sorted(pages, key=lambda p: (p.name != "index.html", p.name))


def page_url(p: pathlib.Path) -> str:
    return SITE + "/" if p.name == "index.html" else f"{SITE}/{p.stem}"


# ---------------------------------------------------------------- pricing.md
def build_pricing_md(cfg: dict) -> str:
    t = cfg["tiers"]
    fy = cfg["first_year"]
    pilot = cfg["pilot"]
    lines = [
        "# Pricing: Answerlore",
        "",
        "Flat monthly price per company. Not per seat. The number of people sets the tier; it does",
        f"not meter the bill. Prices as of {cfg['prices_as_of']}. Every figure here is generated from",
        "the same file that prints the prices on https://answerlore.com/pricing.",
        "",
        "Month to month costs 20% more than the annual rate. The one-time Knowledge Map fee is",
        "charged once, before the subscription starts, and is refunded if the map shows Answerlore",
        "will not help.",
        "",
    ]
    adds = {
        "starter": "Cited answers down to the manual page; customer-safe drafts a technician reviews and sends; a ranked gap log; a private instance; export everything any time",
        "standard": "Everything in Starter, plus auto upload (an agent finds the manufacturers' official manuals and ingests them); a quarterly knowledge audit; a monthly gap report. Planned, not built: whitelabel logo, colors, and subdomain",
        "scale": "Everything in Standard. Planned, not built: Notion and Confluence sync",
    }
    support = {"starter": "email", "standard": "email plus a quarterly call", "scale": "named contact, monthly call"}
    for key, tier in t.items():
        lines += [
            f"## {tier['label']}",
            f"- Price: {money(tier['annual_per_month'])}/month billed annually, {money(tier['month_to_month'])}/month month to month",
            f"- One-time Knowledge Map and ingestion: {money(tier['knowledge_map'])}",
            f"- People: {limit(tier['people'], 'people')}",
            f"- Product lines or brands: {limit(tier['product_lines'], 'product lines')}",
            f"- Knowledge documents: {limit(tier['knowledge_docs'], 'documents')}",
            f"- Manual ingestion: {'unlimited' if tier['ingests_per_year'] is None else str(tier['ingests_per_year']) + ' manuals a year'}",
            f"- Includes: {adds[key]}",
            f"- Support: {support[key]}",
            f"- First year, annual: {money(fy['annual'][key])} (Knowledge Map plus twelve months)",
            f"- First year, month to month: {money(fy['month_to_month'][key])}",
            "",
        ]
    lines += [
        f"## {pilot['name']}",
        f"- Price: {money(pilot['price'])}, {pilot['billing']}",
        f"- Length: {pilot['days']} days",
        f"- Scope: {pilot['product_families']} product family, {pilot['manuals']} manuals ({pilot['manuals_note']}), {pilot['users']} users, {pilot['evaluation_questions']} evaluation questions",
        f"- Includes: {'; '.join(pilot['includes'])}",
        f"- Measures: {', '.join(pilot['measures'])}",
        f"- Credit: {money(pilot['credit']['amount'])} toward {pilot['credit']['toward']} {pilot['credit']['condition']}",
        "- No automatic subscription and no automatic charge at the end of the pilot",
        "",
        "## Terms",
        "- Annual price needs a twelve-month term. Month to month cancels any time.",
        "- Outgrowing a tier triggers a notification and a move up at renewal. No overage billing.",
        "- No free tier. No self-serve signup. Access starts with a guided trial: https://answerlore.com/start",
        "- Documents are never used to train models. Full detail: https://answerlore.com/your-data",
        "",
        "## Enterprise",
        "Multi-site, SSO, VPC or on-premise deployment, and unusual integrations are quoted",
        "individually. Contact: https://answerlore.com/start or hello@answerlore.com",
        "",
    ]
    return "\n".join(lines)


# --------------------------------------------------------------- sitemap.xml
def build_sitemap() -> str:
    rows = []
    for p in tracked_pages():
        rows.append(f"  <url><loc>{page_url(p)}</loc><lastmod>{git_date(p)}</lastmod></url>")
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
            + "\n".join(rows) + "\n</urlset>\n")


# ---------------------------------------------------------- pricing JSON-LD
def clean(fragment: str) -> str:
    text = re.sub(r"<[^>]+>", "", fragment)
    return re.sub(r"\s+", " ", html.unescape(text)).strip()


def build_pricing_ld(cfg: dict, page: str) -> str:
    offers = []
    for key, tier in cfg["tiers"].items():
        offers.append({
            "@type": "Offer",
            "name": tier["label"],
            "price": str(tier["annual_per_month"]),
            "priceCurrency": cfg["currency"],
            "url": f"{SITE}/pricing",
            "availability": "https://schema.org/InStock",
            "eligibleCustomerType": "https://schema.org/Business",
            "priceSpecification": [
                {"@type": "UnitPriceSpecification", "name": "Billed annually",
                 "price": str(tier["annual_per_month"]), "priceCurrency": cfg["currency"],
                 "unitText": "MONTH", "billingDuration": 12},
                {"@type": "UnitPriceSpecification", "name": "Month to month",
                 "price": str(tier["month_to_month"]), "priceCurrency": cfg["currency"],
                 "unitText": "MONTH"},
                {"@type": "UnitPriceSpecification", "name": "One-time Knowledge Map and ingestion",
                 "price": str(tier["knowledge_map"]), "priceCurrency": cfg["currency"]},
            ],
        })
    app = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "@id": f"{SITE}/#software",
        "name": "Answerlore",
        "applicationCategory": "BusinessApplication",
        "applicationSubCategory": "Knowledge management for field service",
        "operatingSystem": "Web",
        "url": SITE,
        "description": ("Loads the service manuals a company already owns, answers a technician's "
                        "question with the manual, revision, and page number attached, and says "
                        "\"not in the knowledge base\" instead of guessing."),
        "publisher": {"@id": f"{SITE}/#organization"},
        "offers": offers,
    }
    faq_items = re.findall(r'<div class="faq-item"><h3>(.*?)</h3><p>(.*?)</p></div>', page, flags=re.S)
    if not faq_items:
        raise SystemExit("pricing.html: no .faq-item blocks found; FAQPage schema would be empty")
    faq = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": clean(q),
             "acceptedAnswer": {"@type": "Answer", "text": clean(a)}}
            for q, a in faq_items
        ],
    }
    body = json.dumps([app, faq], indent=2, ensure_ascii=False)
    return f'{LD_START}\n<script type="application/ld+json">\n{body}\n</script>\n{LD_END}'


def splice_ld(page: str, block: str) -> str:
    start, end = page.find(LD_START), page.find(LD_END)
    if start < 0 or end < 0:
        raise SystemExit(f"pricing.html: missing {LD_START} / {LD_END} markers")
    return page[:start] + block + page[end + len(LD_END):]


# ----------------------------------------------------------------------- main
def main(argv: list[str]) -> int:
    check = "--check" in argv
    cfg = json.loads(OFFERS.read_text())
    pricing_html = ROOT / "pricing.html"
    page = pricing_html.read_text()
    wanted = {
        ROOT / "pricing.md": build_pricing_md(cfg),
        ROOT / "sitemap.xml": build_sitemap(),
        pricing_html: splice_ld(page, build_pricing_ld(cfg, page)),
    }
    drift = []
    for path, content in wanted.items():
        current = path.read_text() if path.exists() else None
        if current == content:
            continue
        if check:
            drift.append(path.name)
        else:
            path.write_text(content)
            print(f"wrote {path.name}")
    if check:
        for name in drift:
            print(f"FAIL {name} is out of date; run python3 scripts/build_machine_files.py")
        print("ok" if not drift else f"{len(drift)} file(s) drifted")
        return 1 if drift else 0
    print("ok")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
