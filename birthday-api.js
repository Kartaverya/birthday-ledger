const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Database setup ──────────────────────────────────────────────
const db = new sqlite3.Database('birthdays.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      relationship TEXT,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
});

// ── Middleware ──────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Helper: validate date format YYYY-MM-DD ─────────────────────
function isValidDate(str) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const d = new Date(str);
  return d instanceof Date && !isNaN(d);
}

// ── Helper: sanitize string ─────────────────────────────────────
function sanitize(str, maxLen = 200) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
}

// ── Routes ──────────────────────────────────────────────────────

// Create a new user vault — returns unique ID
app.post('/api/users', (req, res) => {
  const id = uuidv4();
  db.run('INSERT INTO users (id) VALUES (?)', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Could not create vault' });
    res.json({ userId: id });
  });
});

// Verify a user exists
app.get('/api/users/:userId', (req, res) => {
  db.get('SELECT id FROM users WHERE id = ?', [req.params.userId], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Vault not found' });
    res.json({ exists: true });
  });
});

// Get all entries for a user
app.get('/api/entries/:userId', (req, res) => {
  db.get('SELECT id FROM users WHERE id = ?', [req.params.userId], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'Vault not found' });

    db.all(
      'SELECT * FROM entries WHERE user_id = ? ORDER BY created_at DESC',
      [req.params.userId],
      (err2, rows) => {
        if (err2) return res.status(500).json({ error: 'Could not fetch entries' });
        res.json({ entries: rows });
      }
    );
  });
});

// Add a new entry
app.post('/api/entries/:userId', (req, res) => {
  db.get('SELECT id FROM users WHERE id = ?', [req.params.userId], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'Vault not found' });

    const name         = sanitize(req.body.name, 100);
    const date         = sanitize(req.body.date, 10);
    const relationship = sanitize(req.body.relationship, 50);
    const note         = sanitize(req.body.note, 300);

    if (!name)              return res.status(400).json({ error: 'Name is required' });
    if (!isValidDate(date)) return res.status(400).json({ error: 'Invalid date format' });

    db.run(
      'INSERT INTO entries (user_id, name, date, relationship, note) VALUES (?, ?, ?, ?, ?)',
      [req.params.userId, name, date, relationship || null, note || null],
      function (err2) {
        if (err2) return res.status(500).json({ error: 'Could not save entry' });
        res.json({ id: this.lastID, name, date, relationship, note });
      }
    );
  });
});

// Delete an entry
app.delete('/api/entries/:userId/:entryId', (req, res) => {
  db.get('SELECT id FROM users WHERE id = ?', [req.params.userId], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'Vault not found' });

    db.get(
      'SELECT id FROM entries WHERE id = ? AND user_id = ?',
      [req.params.entryId, req.params.userId],
      (err2, entry) => {
        if (err2 || !entry) return res.status(404).json({ error: 'Entry not found' });

        db.run('DELETE FROM entries WHERE id = ?', [req.params.entryId], (err3) => {
          if (err3) return res.status(500).json({ error: 'Could not delete entry' });
          res.json({ deleted: true });
        });
      }
    );
  });
});

// Catch-all — serve index.html for any unknown route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Birthday app running on http://localhost:${PORT}`);
});
