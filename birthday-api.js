const express = require('express');
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Database setup ──────────────────────────────────────────────
const db = new Database('birthdays.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    relationship TEXT,
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

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
  db.prepare('INSERT INTO users (id) VALUES (?)').run(id);
  res.json({ userId: id });
});

// Verify a user exists
app.get('/api/users/:userId', (req, res) => {
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.userId);
  if (!user) return res.status(404).json({ error: 'Vault not found' });
  res.json({ exists: true });
});

// Get all entries for a user
app.get('/api/entries/:userId', (req, res) => {
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.userId);
  if (!user) return res.status(404).json({ error: 'Vault not found' });

  const entries = db.prepare(
    'SELECT * FROM entries WHERE user_id = ? ORDER BY created_at DESC'
  ).all(req.params.userId);

  res.json({ entries });
});

// Add a new entry
app.post('/api/entries/:userId', (req, res) => {
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.userId);
  if (!user) return res.status(404).json({ error: 'Vault not found' });

  const name         = sanitize(req.body.name, 100);
  const date         = sanitize(req.body.date, 10);
  const relationship = sanitize(req.body.relationship, 50);
  const note         = sanitize(req.body.note, 300);

  if (!name)            return res.status(400).json({ error: 'Name is required' });
  if (!isValidDate(date)) return res.status(400).json({ error: 'Invalid date format' });

  const result = db.prepare(
    'INSERT INTO entries (user_id, name, date, relationship, note) VALUES (?, ?, ?, ?, ?)'
  ).run(req.params.userId, name, date, relationship || null, note || null);

  res.json({ id: result.lastInsertRowid, name, date, relationship, note });
});

// Delete an entry
app.delete('/api/entries/:userId/:entryId', (req, res) => {
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.userId);
  if (!user) return res.status(404).json({ error: 'Vault not found' });

  const entry = db.prepare(
    'SELECT id FROM entries WHERE id = ? AND user_id = ?'
  ).get(req.params.entryId, req.params.userId);

  if (!entry) return res.status(404).json({ error: 'Entry not found' });

  db.prepare('DELETE FROM entries WHERE id = ?').run(req.params.entryId);
  res.json({ deleted: true });
});

// Catch-all — serve index.html for any unknown route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Birthday app running on http://localhost:${PORT}`);
});
