const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Serve built React frontend in production
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

// ─── AUTH ───
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT id, username, display_name, color FROM users WHERE username = ? AND password = ?').get(username, password);
  if (!user) return res.status(401).json({ error: 'Identifiants incorrects' });
  res.json(user);
});

app.get('/api/users', (req, res) => {
  const users = db.prepare('SELECT id, username, display_name, color FROM users').all();
  res.json(users);
});

// ─── NOTES CRUD ───
app.get('/api/notes', (req, res) => {
  // Auto-archive expired notes (don't return them)
  const notes = db.prepare(`
    SELECT notes.*, users.display_name as author_name, users.color as author_color
    FROM notes
    JOIN users ON notes.author_id = users.id
    WHERE notes.expires_at IS NULL OR notes.expires_at > datetime('now')
    ORDER BY notes.updated_at DESC
  `).all();
  res.json(notes);
});

app.get('/api/notes/:id', (req, res) => {
  const note = db.prepare(`
    SELECT notes.*, users.display_name as author_name, users.color as author_color
    FROM notes
    JOIN users ON notes.author_id = users.id
    WHERE notes.id = ?
  `).get(req.params.id);
  if (!note) return res.status(404).json({ error: 'Note introuvable' });
  res.json(note);
});

app.post('/api/notes', (req, res) => {
  const { title, content, author_id, expires_at } = req.body;
  const result = db.prepare(
    'INSERT INTO notes (title, content, author_id, expires_at) VALUES (?, ?, ?, ?)'
  ).run(title || 'Sans titre', content || '', author_id, expires_at || null);
  const note = db.prepare(`
    SELECT notes.*, users.display_name as author_name, users.color as author_color
    FROM notes JOIN users ON notes.author_id = users.id
    WHERE notes.id = ?
  `).get(result.lastInsertRowid);
  io.emit('note-created', note);
  res.json(note);
});

app.put('/api/notes/:id', (req, res) => {
  const { title, content, expires_at } = req.body;
  db.prepare(
    'UPDATE notes SET title = COALESCE(?, title), content = COALESCE(?, content), expires_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(title, content, expires_at !== undefined ? expires_at : null, req.params.id);
  const note = db.prepare(`
    SELECT notes.*, users.display_name as author_name, users.color as author_color
    FROM notes JOIN users ON notes.author_id = users.id
    WHERE notes.id = ?
  `).get(req.params.id);
  io.emit('note-updated', note);
  res.json(note);
});

app.delete('/api/notes/:id', (req, res) => {
  db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
  io.emit('note-deleted', { id: parseInt(req.params.id) });
  res.json({ ok: true });
});

// ─── REACTIONS ───
app.get('/api/notes/:id/reactions', (req, res) => {
  const reactions = db.prepare(`
    SELECT reactions.*, users.display_name, users.color
    FROM reactions
    JOIN users ON reactions.user_id = users.id
    WHERE note_id = ?
  `).all(req.params.id);
  res.json(reactions);
});

app.post('/api/notes/:id/reactions', (req, res) => {
  const { user_id, emoji } = req.body;
  const noteId = parseInt(req.params.id);
  const existing = db.prepare(
    'SELECT id FROM reactions WHERE note_id = ? AND user_id = ? AND emoji = ?'
  ).get(noteId, user_id, emoji);

  if (existing) {
    db.prepare('DELETE FROM reactions WHERE id = ?').run(existing.id);
  } else {
    db.prepare('INSERT INTO reactions (note_id, user_id, emoji) VALUES (?, ?, ?)').run(noteId, user_id, emoji);
  }

  const reactions = db.prepare(`
    SELECT reactions.*, users.display_name, users.color
    FROM reactions JOIN users ON reactions.user_id = users.id
    WHERE note_id = ?
  `).all(noteId);
  io.emit('reactions-updated', { noteId, reactions });
  res.json(reactions);
});

// ─── STATS ───
app.get('/api/stats', (req, res) => {
  const totalNotes = db.prepare('SELECT COUNT(*) as count FROM notes WHERE expires_at IS NULL OR expires_at > datetime(\'now\')').get().count;
  const todayModified = db.prepare('SELECT COUNT(*) as count FROM notes WHERE date(updated_at) = date(\'now\')').get().count;
  res.json({ totalNotes, todayModified });
});

// ─── SOCKET.IO ───
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('Client connecté:', socket.id);

  socket.on('user-online', (user) => {
    onlineUsers.set(socket.id, user);
    io.emit('online-users', Array.from(onlineUsers.values()));
    emitStats();
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(socket.id);
    io.emit('online-users', Array.from(onlineUsers.values()));
    console.log('Client déconnecté:', socket.id);
  });

  // Real-time note editing
  socket.on('note-editing', (data) => {
    socket.broadcast.emit('note-editing', data);
  });

  socket.on('note-content-update', (data) => {
    socket.broadcast.emit('note-content-update', data);
  });

  // Visual effects
  socket.on('trigger-effect', (data) => {
    const user = onlineUsers.get(socket.id);
    io.emit('effect-triggered', {
      ...data,
      userName: user?.display_name,
      userColor: user?.color,
    });
  });

  function emitStats() {
    const totalNotes = db.prepare('SELECT COUNT(*) as count FROM notes WHERE expires_at IS NULL OR expires_at > datetime(\'now\')').get().count;
    const todayModified = db.prepare('SELECT COUNT(*) as count FROM notes WHERE date(updated_at) = date(\'now\')').get().count;
    io.emit('activity-stats', {
      online: onlineUsers.size,
      totalNotes,
      todayModified,
    });
  }
});

// Catch-all: serve React app for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✓ Serveur CollaNote sur http://localhost:${PORT}`);
});
