# National Sales Registry: Recruiting Funnel

A one-page video funnel built for paid ads. It books recruiting audits with home service company owners (HVAC, roofing, solar, plumbing, remodeling) who need to hire sales reps.

```
Ad  ──►  index.html  ──►  iClosed booking  ──►  thank-you.html
         (headline + video + calendar)
```

- **`index.html`**: logo, headline, a video that autoplays muted with a "Click To Unmute" overlay, a call-to-action button, three proof points, and the iClosed calendar.
- **`thank-you.html`**: booking confirmation and call prep. It fires a `Schedule` conversion event when the pixel is set.

## Setup

Edit **`assets/config.js`**:

| Setting | What to put there |
|---|---|
| `brand.name` | Firm name shown in the wordmark and footer |
| `brand.email` | Contact email in the footer |
| `videoUrl` | A YouTube, Vimeo, Wistia, or `.mp4` link to your video |
| `metaPixelId` / `googleAnalyticsId` | Optional ad tracking: `PageView`, `ClickCTA`, `VideoUnmute`, `Schedule` |

**Calendar:** the iClosed embed code sits in `index.html` inside `<div id="calendar">`. To change calendars, replace that block. If the widget doesn't render within 8 seconds, the page shows an "Open The Calendar" button instead.

**In iClosed:** set the event's post-booking redirect to `https://YOUR-DOMAIN/thank-you.html`.

**Copy and colors:** edit the text in `index.html`. Colors (navy, brass, cream) are CSS variables at the top of `assets/styles.css`. The seal is an inline SVG in each page.

## Run locally

```bash
python3 -m http.server 8000
```

## Deploy

The site is connected to Vercel, which redeploys on every push.
