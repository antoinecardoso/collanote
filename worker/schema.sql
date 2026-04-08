PRAGMA foreign_keys = OFF;
DROP TABLE IF EXISTS reactions;
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS note;
DROP TABLE IF EXISTS users;
PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  display_name TEXT NOT NULL,
  color TEXT NOT NULL
);

CREATE TABLE note (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  title TEXT NOT NULL DEFAULT 'Note partagée',
  content TEXT DEFAULT '',
  last_edited_by INTEGER,
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (last_edited_by) REFERENCES users(id)
);

CREATE TABLE reactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  emoji TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, emoji)
);

INSERT INTO users (username, password, display_name, color) VALUES ('antoine', 'antoine123', 'Antoine', '#60A5FA');
INSERT INTO users (username, password, display_name, color) VALUES ('efraim', 'efraim123', 'Efraim', '#F87171');
INSERT INTO users (username, password, display_name, color) VALUES ('ana', 'ana123', 'Ana', '#34D399');
INSERT INTO users (username, password, display_name, color) VALUES ('marie', 'marie123', 'Marie', '#FBBF24');
INSERT INTO users (username, password, display_name, color) VALUES ('lucas', 'lucas123', 'Lucas', '#A78BFA');
INSERT INTO users (username, password, display_name, color) VALUES ('sarah', 'sarah123', 'Sarah', '#F472B6');

INSERT INTO note (id, title, content) VALUES (1, 'JB, l''IA & le Viagra', '<h1>JB, l''IA &amp; le Viagra 💊</h1><p style="color: #525252"><em>Galion — 8 avril 2026 — Paris</em></p><p></p><p>JB nous a fait une prez de <span style="color: #F87171"><strong>malade</strong></span>. À un moment il parle de Rocabella, puis de Viagra. <span style="color: #A78BFA">Personne a compris la connexion.</span> Mais c''était brillant quand même.</p><p></p><blockquote><p>On a tous hoché la tête comme si on avait compris. <span style="color: #FBBF24">Classique Galion.</span></p></blockquote><p></p><h2><span style="color: #34D399">🧠</span> Ce qu''on retient</h2><ul><li>On a appris plein de trucs</li><li>On est tous passés de <span style="color: #60A5FA">l''autre côté de la matrice</span></li><li>Plus personne ne code pareil depuis cet après-midi</li><li>Le <span style="color: #F87171">prompt</span> &gt; le <span style="color: #A78BFA">produit</span> (fight me)</li></ul><p></p><h2><span style="color: #FBBF24">🙏</span> Merci le Galion</h2><p>Merci JB. Merci la team. On revient <span style="color: #34D399">quand vous voulez</span>.</p><p></p><h2><span style="color: #F87171">⚡</span> Next</h2><ul data-type="taskList"><li data-type="taskItem" data-checked="true">Passer de l''autre côté de la matrice</li><li data-type="taskItem" data-checked="true">Se dire que c''était une journée de ouf</li><li data-type="taskItem" data-checked="false">Comprendre le lien entre Rocabella et le Viagra</li><li data-type="taskItem" data-checked="false">Dîner AI Founders chez <span style="color: #60A5FA">Klam</span></li><li data-type="taskItem" data-checked="false">Prochaine session : <span style="color: #A78BFA">"Agents autonomes — bullshit ou révolution ?"</span></li></ul><p></p><hr><p></p><p style="color: #525252"><em>Cette note est à nous. Tapez <strong style="color: #60A5FA">/</strong> il y a des surprises 👇</em></p><p></p>');
