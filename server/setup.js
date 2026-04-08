const db = require('./db');
const bcrypt = require('bcrypt');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS note (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    title TEXT NOT NULL DEFAULT 'Note partagée',
    content TEXT DEFAULT '',
    last_edited_by INTEGER,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (last_edited_by) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS reactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    emoji TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, emoji)
  );
`);

const users = [
  { username: 'antoine', password: 'antoine123', display_name: 'Antoine', color: '#60A5FA' },
  { username: 'efraim',  password: 'efraim123',  display_name: 'Efraim',  color: '#F87171' },
  { username: 'ana',     password: 'ana123',      display_name: 'Ana',     color: '#34D399' },
  { username: 'marie',   password: 'marie123',    display_name: 'Marie',   color: '#FBBF24' },
  { username: 'lucas',   password: 'lucas123',    display_name: 'Lucas',   color: '#A78BFA' },
  { username: 'sarah',   password: 'sarah123',    display_name: 'Sarah',   color: '#F472B6' },
];

const insert = db.prepare('INSERT OR IGNORE INTO users (username, password_hash, display_name, color) VALUES (?, ?, ?, ?)');
for (const u of users) {
  const hash = bcrypt.hashSync(u.password, 10);
  insert.run(u.username, hash, u.display_name, u.color);
}

const initialContent = `<h1>JB, l'IA &amp; le Viagra 💊</h1><p style="color: #525252"><em>Galion — 8 avril 2026 — Paris</em></p><p></p><p>JB nous a fait une prez de <span style="color: #F87171"><strong>malade</strong></span>. À un moment il parle de Rocabella, puis de Viagra. <span style="color: #A78BFA">Personne a compris la connexion.</span> Mais c'était brillant quand même.</p><p></p><blockquote><p>On a tous hoché la tête comme si on avait compris. <span style="color: #FBBF24">Classique Galion.</span></p></blockquote><p></p><h2><span style="color: #34D399">🧠</span> Ce qu'on retient</h2><ul><li>On a appris plein de trucs</li><li>On est tous passés de <span style="color: #60A5FA">l'autre côté de la matrice</span></li><li>Plus personne ne code pareil depuis cet après-midi</li><li>Le <span style="color: #F87171">prompt</span> &gt; le <span style="color: #A78BFA">produit</span> (fight me)</li></ul><p></p><h2><span style="color: #FBBF24">🙏</span> Merci le Galion</h2><p>Merci JB. Merci la team. On revient <span style="color: #34D399">quand vous voulez</span>.</p><p></p><h2><span style="color: #F87171">⚡</span> Next</h2><ul data-type="taskList"><li data-type="taskItem" data-checked="true">Passer de l'autre côté de la matrice</li><li data-type="taskItem" data-checked="true">Se dire que c'était une journée de ouf</li><li data-type="taskItem" data-checked="false">Comprendre le lien entre Rocabella et le Viagra</li><li data-type="taskItem" data-checked="false">Dîner AI Founders chez <span style="color: #60A5FA">Klam</span></li><li data-type="taskItem" data-checked="false">Prochaine session : <span style="color: #A78BFA">"Agents autonomes — bullshit ou révolution ?"</span></li></ul><p></p><hr><p></p><p style="color: #525252"><em>Cette note est à nous. Tapez <strong style="color: #60A5FA">/</strong> il y a des surprises 👇</em></p><p></p><p></p>`;

db.prepare('INSERT OR IGNORE INTO note (id, title, content) VALUES (1, ?, ?)').run('JB, l\'IA & le Viagra 💊', initialContent);

console.log('✓ Base de données initialisée avec 6 utilisateurs et la note pré-remplie');
