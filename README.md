# Sales Recruiting Funnel for Home Service Companies

A lightweight, no-build-step funnel that books strategy calls with **home service business owners** (HVAC, roofing, solar, plumbing, remodeling, and others) who need to **hire sales reps**.

## Funnel flow

```
index.html  ──►  apply.html  ──►  book.html  ──►  thank-you.html
 (landing)      (7-step qualifier)   (calendar)       (confirmation)
                      │
                      └──► not-a-fit.html   (disqualified leads)
```

1. **Landing page** (`index.html`): pain points, how it works, offer, fit check, FAQ, and CTAs.
2. **Application** (`apply.html`): a one-question-per-screen qualifier covering trade, revenue, roles, headcount, timeline, biggest challenge, and contact details. Radio answers auto-advance.
3. **Qualification**: leads that match `disqualify` rules in config go to a polite "not a fit yet" page. Everyone else goes to the calendar.
4. **Booking** (`book.html`): embeds your iClosed, Calendly, or Cal.com calendar, passing the lead's name, email, and phone along. If the iClosed widget fails to load, it shows a "Pick Your Time" button that opens your iClosed booking page instead. Set iClosed's post-booking redirect to `/thank-you.html`.
5. **Thank-you** (`thank-you.html`): call prep to improve show rates.

Every submission, qualified or not, is POSTed as JSON to your webhook. The payload includes UTM parameters, `fbclid` and `gclid`, the landing page, and the referrer.

## Setup (about 5 minutes)

All settings live in **`assets/config.js`**:

| Setting | What to put there |
|---|---|
| `brand.name`, `brand.email`, `brand.phone` | Your agency details |
| `calendarUrl` | Your iClosed, Calendly, or Cal.com event link, e.g. `https://app.iclosed.io/e/you/audit` |
| `leadWebhookUrl` | A Zapier, Make, n8n, or GoHighLevel inbound webhook, or any endpoint that accepts a POST. Leads are sent as a JSON body with content type `text/plain`, so no CORS setup is needed. |
| `metaPixelId` / `googleAnalyticsId` | Optional. Fires `PageView`, `StartApplication`, `Lead`, and `Schedule` events. |
| `disqualify` | Answers that send leads to the not-a-fit page. By default: revenue under $500K, or "just researching". |
| `stats` / `testimonials` | **Real** results only. Each section stays hidden while its list is empty. |

**Calendly tip:** in your event settings, also set *Confirmation page → Redirect to an external site* to `https://yourdomain.com/thank-you.html` as a backup redirect.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

These are static files, so any host works. You can drag the folder into Netlify, import the repo in Vercel, turn on GitHub Pages for the branch, or upload to any web host.

## Customizing

- Copy lives directly in the HTML files.
- Brand colors are CSS variables at the top of `assets/styles.css` (`--brand`, `--navy`).
- To add or change application questions, edit the `.step` blocks in `apply.html`. Any `name="..."` field is included in the webhook payload automatically.
