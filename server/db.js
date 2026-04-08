const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'collanote.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Users table — 6 fixed accounts
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    display_name TEXT NOT NULL,
    color TEXT NOT NULL
  );
`);

// Notes table
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL DEFAULT 'Sans titre',
    content TEXT DEFAULT '',
    author_id INTEGER NOT NULL,
    expires_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
  );
`);

// Reactions table
db.exec(`
  CREATE TABLE IF NOT EXISTS reactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    note_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    emoji TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(note_id, user_id, emoji)
  );
`);

// Seed 6 users
const users = [
  { username: 'antoine', password: 'antoine123', display_name: 'Antoine', color: '#60A5FA' },
  { username: 'efraim',  password: 'efraim123',  display_name: 'Efraim',  color: '#F87171' },
  { username: 'ana',     password: 'ana123',     display_name: 'Ana',     color: '#34D399' },
  { username: 'marie',   password: 'marie123',   display_name: 'Marie',   color: '#FBBF24' },
  { username: 'lucas',   password: 'lucas123',   display_name: 'Lucas',   color: '#A78BFA' },
  { username: 'sarah',   password: 'sarah123',   display_name: 'Sarah',   color: '#F472B6' },
];

const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (username, password, display_name, color)
  VALUES (@username, @password, @display_name, @color)
`);

for (const user of users) {
  insertUser.run(user);
}

module.exports = db;
