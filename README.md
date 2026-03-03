# 🎂 Birthday Ledger
Never forget a birthday again.


A private birthday tracker with one-click Google Calendar integration.
No accounts, no passwords — just a unique private link per user.




**Visit the app here → https://birthday-ledger.onrender.com**


---

## How It Works

1. Visit the app → click **Create My Vault**
2. You get a unique private URL — **bookmark it**
3. Add birthdays with name, date, relationship, note
4. Click **+ G·Cal** on any entry → Google Calendar opens pre-filled
5. Hit Save in Google Calendar — it repeats every year automatically ✅

---



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
