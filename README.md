# answerlore.com

The public Answerlore marketing site. Twelve static pages, one stylesheet, no build step,
no framework.

## Pages

| File | Live URL | What it is |
|---|---|---|
| `index.html` | `/` | Home. Carries the interactive demo. |
| `how-it-works.html` | `/how-it-works` | The four-step loop, and the "what it doesn't do" table. |
| `why-it-refuses.html` | `/why-it-refuses` | The design argument for refusing to guess. |
| `service.html` | `/service` | For service companies. Lead vertical. |
| `dealers.html` | `/dealers` | For equipment dealers. |
| `pricing.html` | `/pricing` | Three tiers, the Knowledge Map, first-year cost, nine FAQ items. |
| `knowledge-map-example.html` | `/knowledge-map-example` | A worked Knowledge Map for a fictional dealer. |
| `your-data.html` | `/your-data` | Plain-language data and security answers. |
| `resources.html` | `/resources` | Guides hub. |
| `start.html` | `/start` | Trial signup form. Primary call-to-action target. |
| `walkthrough.html` | `/walkthrough` | Walkthrough booking form. Secondary call-to-action target. |
| `owners.html` | `/owners` | Printable one-pager of dealer math. |

`assets/site.css` holds every style. `assets/demo.js` runs the homepage demo only.
`CNAME` binds the site to answerlore.com. Do not delete it.

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
   and `resources.html`. Until then the submit buttons open the visitor's email app instead,
   pre-filled, and say so on the page.
2. **Create the hello@answerlore.com forward** in Porkbun, pointing at your inbox. The footer
   and the form fallback both use that address.
3. **Check the founder note** on the home page. It is signed "Colby Richard, founder,
   Answerlore. August 2026."

## Known gaps, deliberate

- The three guides on `/resources` are listed as in progress. None are written.
- `/service` states the callback argument without a number. The source brief marks the
  first-time-fix figure `NEEDS SOURCE` and forbids shipping one without it.
- The five-business-day ingestion turnaround on `/start` is a commitment awaiting founder
  confirmation.
