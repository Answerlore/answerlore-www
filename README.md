# answerlore.com

The public Answerlore marketing site. Static pages, one stylesheet, no build step, no
framework. Prices and pilot terms have one source, `assets/offers.json`, and
`scripts/check_offers.py` keeps the pages in step with it.

## Pages

| File | Live URL | What it is |
|---|---|---|
| `index.html` | `/` | Home. Leads with a labeled illustrative walkthrough of the answer format (not a live answer), then the assembly-line explanation. |
| `how-it-works.html` | `/how-it-works` | The four-step loop, and the "what it doesn't do" table. |
| `why-it-refuses.html` | `/why-it-refuses` | The design argument for refusing to guess. |
| `service.html` | `/service` | For service companies. Lead vertical. |
| `dealers.html` | `/dealers` | For equipment dealers. |
| `pricing.html` | `/pricing` | Three tiers, the founding-customer pilot (`#pilot`), the Knowledge Map, first-year cost, nine FAQ items. |
| `knowledge-map-example.html` | `/knowledge-map-example` | A worked Knowledge Map for a fictional dealer. |
| `your-data.html` | `/your-data` | Plain-language data and security answers. |
| `resources.html` | `/resources` | Guides hub. |
| `hold-time.html` | `/hold-time` | Guide: what a manufacturer tech-support call costs a service company. First published guide. |
| `start.html` | `/start` | Guided trial request: sample workspace, a workspace from the prospect's manuals, or the pilot (`?request=pilot` preselects). Primary call-to-action target. |
| `walkthrough.html` | `/walkthrough` | Walkthrough booking form. Secondary call-to-action target. |
| `owners.html` | `/owners` | Printable one-pager of dealer math. |

`assets/site.css` holds every style. `assets/site.js` is the shared script (nav, forms).
`assets/demo.js` runs the homepage walkthrough only. `assets/measure.js` is the local-only
event interface described in `docs/MEASUREMENT.md`. `CNAME` binds the site to answerlore.com.
Do not delete it.

## Checks

```
python3 scripts/check_offers.py
```

Verifies the arithmetic in `assets/offers.json` (month to month is 20% above the annual
rate; first-year totals are Knowledge Map plus twelve months), that every dollar figure on
a page is derived from that file or listed as a cited third-party figure, that retired
phrases are gone, that every internal link has a file behind it, and that every page
carrying the pilot prints the same terms. `.github/workflows/checks.yml` runs it on every
push and pull request. Change a price in the JSON first, then in the HTML.

## Where the copy came from

Every word is transcribed from the private `answerlore` repo:

- `answerlore-site/docs/POSITIONING-AND-MESSAGING.md` section 8 (page-by-page final copy)
- `answerlore-site/docs/PRICING-PAGE-SPEC.md` section 5 (pricing layout and copy)
- `docs/examples/phase-0-acme/ranked-categories.md` (the worked Knowledge Map)

The design system came from `answerlore-site/mockups/artifact.html`, the three-page review
board. That board is design history now. **This repo is the source of truth for the live site.**

## To change the site

1. Edit the HTML file, or `assets/site.css` for anything visual.
2. Commit and push to `main`.
3. GitHub Pages redeploys within about a minute.

Navigation and footer markup are repeated in each page. Changing a nav link means changing it
in all twelve files.

## Before this is finished

1. **Switch the forms on.** Get a free access key at web3forms.com, then replace every
   occurrence of `REPLACE_WITH_YOUR_WEB3FORMS_ACCESS_KEY` in `start.html`, `walkthrough.html`
   and `resources.html`. Until then the pages are written for the truth: the button is
   labeled "Email us to …", the note under it says it opens the visitor's email app, and the
   address is printed with a copy control. Once the key is in, `assets/site.js` switches the
   same forms to a real submission with loading, success, retry and failure states, and
   reports nothing as sent until Web3Forms answers `success: true`. Test with a dummy key
   against a local mock before the real one (see the branch's pull request for the recipe).
   The site's CSP already allows `api.web3forms.com`.
2. **Create the hello@answerlore.com forward** in Porkbun, pointing at your inbox. The footer
   and the form fallback both use that address.
3. **Check the founder note** on the home page. It is signed "Colby Richard, founder,
   Answerlore. August 2026."

## Known gaps, deliberate

- The three guides on `/resources` are listed as in progress. None are written.
- `/service` states the callback argument without a number. The source brief marks the
  first-time-fix figure `NEEDS SOURCE` and forbids shipping one without it.
- No turnaround is promised for a workspace built from a prospect's manuals: `/start` says the
  session date is confirmed after the manuals are reviewed. Print a number only once the
  founder's own workflow supports one.
- The founding-customer pilot on `/pricing#pilot` and `/start` is a draft offer. Terms and the
  open questions (refund wording, plan limits, price) are in `docs/PILOT-OFFER.md`.
- The homepage walkthrough is labeled illustrative because there is no approved public manual
  to show and no recording of the application. To replace it: an OEM manual we are licensed to
  display, or a recording of app.answerlore.com against the sample workspace.
- Cloudflare injects a Web Analytics beacon at the edge that the CSP blocks (console error on
  every page). Turn it off in Cloudflare, or allow it and update the footer. `docs/MEASUREMENT.md`.
