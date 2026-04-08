// CollaNote v2 — Cloudflare Worker + Durable Object

export class RealtimeHub {
  constructor(state) {
    this.state = state
    this.connections = new Map()
  }

  async fetch(request) {
    const url = new URL(request.url)

    // Internal broadcast from Worker
    if (request.method === 'POST' && url.pathname === '/broadcast') {
      const data = await request.json()
      this.broadcast(data)
      return new Response('ok')
    }

    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair()
      const [client, server] = Object.values(pair)
      server.accept()
      const id = crypto.randomUUID()
      this.connections.set(id, { ws: server, user: null })

      server.addEventListener('message', (event) => {
        try { this.handleMessage(id, JSON.parse(event.data)) } catch {}
      })

      server.addEventListener('close', () => {
        const user = this.connections.get(id)?.user
        this.connections.delete(id)
        this.broadcastUsers()
        if (user) this.broadcast({ type: 'user-left', ...user })
      })

      return new Response(null, { status: 101, webSocket: client })
    }

    return new Response('WebSocket expected', { status: 400 })
  }

  handleMessage(id, data) {
    const conn = this.connections.get(id)
    if (!conn) return

    switch (data.type) {
      case 'user-join':
        conn.user = data.user
        this.broadcastUsers()
        this.broadcast({ type: 'user-joined', ...data.user }, id)
        break
      case 'note-update':
        this.broadcast({ type: 'note-updated', content: data.content, editedBy: data.userId }, id)
        break
      case 'typing':
        if (conn.user) {
          conn.user.isTyping = true
          this.broadcast({ type: 'user-typing', userId: data.userId, displayName: conn.user.display_name, color: conn.user.color }, id)
        }
        break
      case 'stop-typing':
        if (conn.user) {
          conn.user.isTyping = false
          this.broadcast({ type: 'user-stop-typing', userId: data.userId }, id)
        }
        break
      case 'trigger-effect':
        this.broadcast({
          type: 'effect-triggered',
          effect: data.effect,
          userId: data.userId,
          userName: conn.user?.display_name || 'Quelqu\'un',
          userColor: conn.user?.color || '#60A5FA',
          isCombo: data.isCombo || false,
        })
        break
      default:
        this.broadcast(data, id)
    }
  }

  broadcast(data, excludeId) {
    const msg = JSON.stringify(data)
    for (const [id, conn] of this.connections) {
      if (id !== excludeId) { try { conn.ws.send(msg) } catch {} }
    }
  }

  broadcastUsers() {
    const users = Array.from(this.connections.values()).map(c => c.user).filter(Boolean)
    this.broadcast({ type: 'active-users', users })
  }
}

// ─── Main Worker ───
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors })

    // WebSocket
    if (url.pathname === '/ws') {
      const id = env.REALTIME.idFromName('main')
      return env.REALTIME.get(id).fetch(request)
    }

    try {
      const res = await handleAPI(url, request, env)
      const h = new Headers(res.headers)
      Object.entries(cors).forEach(([k, v]) => h.set(k, v))
      return new Response(res.body, { status: res.status, headers: h })
    } catch (err) {
      return json({ error: err.message }, 500, cors)
    }
  },
}

async function handleAPI(url, request, env) {
  const path = url.pathname
  const method = request.method
  const db = env.DB

  // Users
  if (method === 'GET' && path === '/api/users') {
    const { results } = await db.prepare('SELECT id, username, display_name, color FROM users').all()
    return json(results)
  }

  // Login (simple, no JWT needed for demo)
  if (method === 'POST' && path === '/api/login') {
    const { username, password } = await request.json()
    const user = await db.prepare('SELECT id, username, display_name, color FROM users WHERE username = ? AND password = ?').bind(username, password).first()
    if (!user) return json({ error: 'Identifiants incorrects' }, 401)
    return json({ token: null, user })
  }

  // Note (single note, id=1)
  if (method === 'GET' && path === '/api/note') {
    const note = await db.prepare('SELECT * FROM note WHERE id = 1').first()
    return json(note || { id: 1, title: '', content: '' })
  }

  if (method === 'PUT' && path === '/api/note') {
    const { title, content, userId } = await request.json()
    await db.prepare("UPDATE note SET title = COALESCE(?, title), content = COALESCE(?, content), last_edited_by = ?, updated_at = datetime('now') WHERE id = 1")
      .bind(title, content, userId).run()
    return json({ ok: true })
  }

  // Reactions
  if (method === 'GET' && path === '/api/reactions') {
    const { results } = await db.prepare('SELECT reactions.*, users.display_name, users.color FROM reactions JOIN users ON reactions.user_id = users.id').all()
    return json(results)
  }

  if (method === 'POST' && path === '/api/reactions') {
    const { user_id, emoji } = await request.json()
    const existing = await db.prepare('SELECT id FROM reactions WHERE user_id = ? AND emoji = ?').bind(user_id, emoji).first()
    if (existing) {
      await db.prepare('DELETE FROM reactions WHERE id = ?').bind(existing.id).run()
    } else {
      await db.prepare('INSERT INTO reactions (user_id, emoji) VALUES (?, ?)').bind(user_id, emoji).run()
    }
    const { results } = await db.prepare('SELECT reactions.*, users.display_name, users.color FROM reactions JOIN users ON reactions.user_id = users.id').all()

    // Broadcast via Durable Object
    await notifyHub(env, { type: 'reactions-updated', reactions: results })

    // Combo check
    const heart = await db.prepare("SELECT COUNT(DISTINCT user_id) as c FROM reactions WHERE emoji = '❤️'").first()
    if (heart.c >= 6) {
      await notifyHub(env, { type: 'effect-triggered', effect: 'fireworks', userName: 'Tout le monde', userColor: '#F472B6', isCombo: true })
    }

    return json(results)
  }

  return json({ error: 'Not found' }, 404)
}

async function notifyHub(env, data) {
  try {
    const id = env.REALTIME.idFromName('main')
    await env.REALTIME.get(id).fetch('http://internal/broadcast', { method: 'POST', body: JSON.stringify(data) })
  } catch {}
}

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...extra } })
}
