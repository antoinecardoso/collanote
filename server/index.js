const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('./db');

const JWT_SECRET = 'collanote-demo-secret-2026';
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

// ─── AUTH ───
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Identifiants incorrects' });
  }
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, username: user.username, display_name: user.display_name, color: user.color } });
});

app.get('/api/users', (req, res) => {
  res.json(db.prepare('SELECT id, username, display_name, color FROM users').all());
});

// ─── NOTE (single note) ───
app.get('/api/note', (req, res) => {
  res.json(db.prepare('SELECT * FROM note WHERE id = 1').get());
});

app.put('/api/note', (req, res) => {
  const { title, content, userId } = req.body;
  db.prepare('UPDATE note SET title = COALESCE(?, title), content = COALESCE(?, content), last_edited_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1')
    .run(title, content, userId);
  res.json({ ok: true });
});

// ─── REACTIONS ───
app.get('/api/reactions', (req, res) => {
  res.json(db.prepare('SELECT reactions.*, users.display_name, users.color FROM reactions JOIN users ON reactions.user_id = users.id').all());
});

app.post('/api/reactions', (req, res) => {
  const { user_id, emoji } = req.body;
  const existing = db.prepare('SELECT id FROM reactions WHERE user_id = ? AND emoji = ?').get(user_id, emoji);
  if (existing) {
    db.prepare('DELETE FROM reactions WHERE id = ?').run(existing.id);
  } else {
    db.prepare('INSERT INTO reactions (user_id, emoji) VALUES (?, ?)').run(user_id, emoji);
  }
  const reactions = db.prepare('SELECT reactions.*, users.display_name, users.color FROM reactions JOIN users ON reactions.user_id = users.id').all();
  io.emit('reactions-updated', reactions);

  // Combo check: all 6 users have ❤️
  const heartCount = db.prepare("SELECT COUNT(DISTINCT user_id) as c FROM reactions WHERE emoji = '❤️'").get().c;
  if (heartCount >= 6) {
    io.emit('effect-triggered', { effect: 'fireworks', userName: 'Tout le monde', userColor: '#F472B6', isCombo: true });
  }

  res.json(reactions);
});

// ─── SOCKET.IO ───
const activeUsers = new Map();
const typingUsers = new Map();

io.on('connection', (socket) => {
  socket.on('user-join', (user) => {
    activeUsers.set(socket.id, { ...user, isTyping: false });
    io.emit('active-users', Array.from(activeUsers.values()));
    socket.broadcast.emit('user-joined', user);
  });

  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);
    activeUsers.delete(socket.id);
    typingUsers.delete(socket.id);
    io.emit('active-users', Array.from(activeUsers.values()));
    if (user) socket.broadcast.emit('user-left', user);
  });

  socket.on('note-update', (data) => {
    db.prepare('UPDATE note SET content = ?, last_edited_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1').run(data.content, data.userId);
    socket.broadcast.emit('note-updated', { content: data.content, editedBy: data.userId });
  });

  socket.on('typing', ({ userId }) => {
    const user = activeUsers.get(socket.id);
    if (user) {
      user.isTyping = true;
      typingUsers.set(socket.id, Date.now());
      socket.broadcast.emit('user-typing', { userId, displayName: user.display_name, color: user.color });
    }
  });

  socket.on('stop-typing', ({ userId }) => {
    const user = activeUsers.get(socket.id);
    if (user) {
      user.isTyping = false;
      typingUsers.delete(socket.id);
      socket.broadcast.emit('user-stop-typing', { userId });
    }
  });

  socket.on('trigger-effect', (data) => {
    const user = activeUsers.get(socket.id);
    io.emit('effect-triggered', {
      effect: data.effect,
      userId: data.userId,
      userName: user?.display_name || 'Quelqu\'un',
      userColor: user?.color || '#60A5FA',
      isCombo: data.isCombo || false,
    });
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`✓ CollaNote sur http://localhost:${PORT}`));
