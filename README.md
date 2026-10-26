# Your Counselling Matters — clickable prototype

A front-end-only prototype for a relationship and marriage counselling app. There's no backend:
all data lives in the browser's `localStorage`, so each person testing it starts with a clean slate.

## What's in it

A dark **prototype bar** at the top switches between three views:

| View | What it shows |
| --- | --- |
| **Client website** | Landing page and the intake (registration) form: couple or individual, optional anonymous mode, partner details, a private safety check, preferences, and consent for one or both partners. |
| **User accounts** | Every intake submitted becomes a test user. Open one to see their dashboard: book or change a session with the counsellor, message her, check partner consent and review their intake. |
| **Consultant mode** | The counsellor's dashboard. It starts empty and fills only from test users: intakes, booking requests to confirm, sessions, partner consent and safety flags, plus messaging. |

Couples whose partner chose "sign later" get a partner consent page at `#/consent/<id>`, which you can open from the user's dashboard.

## Run locally

Needs Node.js (no `npm install` required).

```bash
npm start
```

Then open http://localhost:5173. ES modules don't load from `file://`, so use the server rather than double-clicking `index.html`.

## Deploy to Netlify

`netlify.toml` already sets the publish folder to `public/`, with no build command.

- **From GitHub (recommended):** push this repo, then in Netlify choose *Add new site → Import an existing project* and pick the repo. Leave the settings as detected. Every push redeploys.
- **Quick drag-and-drop:** go to https://app.netlify.com/drop and drop the `public` folder.

The site sends `noindex` headers so the prototype stays out of search engines.

## Project structure

```
public/
  index.html            page shell
  favicon.svg
  css/styles.css        mobile-first styles (breakpoints 640 / 900 / 1180px)
  js/main.js            router, actions, event handling
  js/store.js           state, localStorage, booking slots, counsellor details
  js/ui.js              icons, logo, formatting, form controls
  js/views/site.js      prototype bar, header, landing page, footer
  js/views/intake.js    multi-step intake form + validation
  js/views/account.js   user accounts list, user dashboard, partner consent page
  js/views/consultant.js consultant dashboard + client drawer
netlify.toml            Netlify settings
serve.js                tiny local server (npm start)
```

## Before showing the client

- **Logo:** `mark()` in `public/js/ui.js` is a hand-drawn stand-in. Swap in the real SVG.
- **Counsellor:** name, bio and hours are placeholders in `COUNSELLOR` in `public/js/store.js`.
- **Consent wording:** placeholder text in `consentDoc()` in `public/js/views/intake.js`.
- **Test data:** "Delete all test data" appears on the User accounts page and in the consultant sidebar.
