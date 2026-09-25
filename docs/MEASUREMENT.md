# Measuring the journey without tracking anyone

Status: local event interface shipped; no transport, by design. 2026-09-21.

## What exists today

The site has no analytics. The footer promises "No cookies beyond sign-in. No tracking
pixels," and that promise is kept: `assets/measure.js` records events in memory in the
visitor's own browser and sends nothing anywhere. It exists so the pages agree on event
names and payloads now, and so a first-party transport can be added later as one change
that is disclosed before it ships.

Two things were found during the audit that bear on this:

- Cloudflare was injecting its Web Analytics beacon (`static.cloudflareinsights.com/beacon.min.js`)
  into every page at the edge. The site's Content-Security-Policy blocked it, so it never ran,
  but every page load logged a CSP violation. Automatic setup was switched off in the Cloudflare
  dashboard on 2026-09-23 and the live pages were checked afterwards: no beacon script. If it
  reappears, that is the Web Analytics "automatic setup" toggle for answerlore.com, nothing in
  this repository.
- The forms' delivery service (Web3Forms) is the only third party the pages talk to, and only
  when a visitor submits a form.

## Events

| Event | Fires when | Payload |
|---|---|---|
| `demo_visit` | the home-page walkthrough scrolls into view, once | page |
| `demo_start` | first click on a walkthrough chip | page, panel |
| `demo_panel` | any walkthrough chip click | page, panel |
| `citation_open` | the source panel in the walkthrough is opened | page, panel |
| `trial_request_submitted` | the form service answered `success: true` for a sample or manuals request | page, kind |
| `pilot_request_submitted` | same, for the pilot choice | page, kind |
| `walkthrough_request_submitted` | same, on `/walkthrough` | page, kind |
| `guides_signup_submitted` | same, on `/resources` | page, kind |
| `request_email_opened` | the email fallback opened the visitor's mail app | page, kind |
| `request_failed` | the form service rejected or did not answer | page, kind |

`request_email_opened` is not a lead submission and must never be counted as one: nothing
left the page. A demonstration event (`demo_*`, `citation_open`) is never a lead either.

Payload keys are an allowlist (`page`, `panel`, `kind`, `reason`). Free text is dropped
before the event is stored, so a question body, a name, an email address, or a company name
cannot enter the event stream even by mistake.

## Reading events locally

In the browser console on any page:

```js
window.answerlore.events            // everything recorded on this page view
document.addEventListener('answerlore:event', e => console.log(e.detail))
```

## Adding a transport, if and when

The right shape is first-party and cookieless: a `POST /events` on a host we control (the
app at app.answerlore.com already has the security posture for it), receiving only the
allowlisted payload above plus a coarse timestamp, with no IP address stored and no
cross-page identifier. Before it ships:

1. Update the footer line, because "no tracking pixels" would then need a qualifier.
2. Add a sentence to `/your-data` saying what is collected and what is not.
3. Add the endpoint's origin to `connect-src` in every page's CSP.

None of that is done. Do not add a third-party analytics script as a shortcut.
