# 🎂 Birthday Ledger

A private birthday tracker with one-click Google Calendar integration.
No accounts, no passwords — just a unique private link per user.

---

## How It Works

1. Visit the app → click **Create My Vault**
2. You get a unique private URL — **bookmark it**
3. Add birthdays with name, date, relationship, note
4. Click **+ G·Cal** on any entry → Google Calendar opens pre-filled
5. Hit Save in Google Calendar — it repeats every year automatically ✅

---

## Deploy on Railway (Recommended — Free)

1. Go to [railway.app](https://railway.app) and sign up
2. Click **New Project → Deploy from GitHub**
3. Push this folder to a GitHub repo, connect it
4. Railway auto-detects Node.js and runs `npm start`
5. Click **Generate Domain** → you get a free `.railway.app` URL

That's it. Railway handles everything.

---

## Deploy on Replit (Easiest)

1. Go to [replit.com](https://replit.com) and sign up
2. Click **Create Repl → Import from GitHub** (or upload files)
3. Replit auto-installs dependencies and runs `npm start`
4. Click the link Replit gives you — your app is live

---

## Run Locally

```bash
npm install
npm start
# Open http://localhost:3000
```

---

## File Structure

```
birthday-ledger/
├── birthday-api.js          ← Express backend + SQLite database
├── package.json       ← Dependencies
├── birthdays.db       ← Auto-created on first run (SQLite file)
└── public/
    └── index.html     ← Full frontend (one file)
```

---

## Tech Stack

- **Backend:** Node.js + Express
- **Database:** SQLite (via better-sqlite3) — zero config, single file
- **Frontend:** Vanilla HTML/CSS/JS — no frameworks
- **Auth:** None — UUID-based private vault links
- **Calendar:** Google Calendar URL template (no API key needed)
