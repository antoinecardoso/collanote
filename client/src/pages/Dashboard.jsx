import { useState, useEffect, useCallback } from 'react'
import Sidebar from '../components/Sidebar'
import NoteEditor from '../components/NoteEditor'
import EffectOverlay from '../components/EffectOverlay'
import EffectToasts from '../components/EffectToasts'
import { getSocket, useSocket } from '../hooks/useSocket'

export default function Dashboard({ user, onLogout }) {
  const [notes, setNotes] = useState([])
  const [activeNoteId, setActiveNoteId] = useState(null)
  const [stats, setStats] = useState({ online: 0, totalNotes: 0, todayModified: 0 })
  const [onlineUsers, setOnlineUsers] = useState([])
  const [allUsers, setAllUsers] = useState([])

  // Fetch notes & users on mount
  useEffect(() => {
    fetch('/api/notes').then(r => r.json()).then(setNotes)
    fetch('/api/users').then(r => r.json()).then(setAllUsers)

    const socket = getSocket()
    socket.emit('user-online', user)

    return () => socket.disconnect()
  }, [])

  // Socket events
  useSocket('note-created', (note) => {
    setNotes(prev => [note, ...prev])
  })

  useSocket('note-updated', (note) => {
    setNotes(prev => prev.map(n => n.id === note.id ? note : n))
  })

  useSocket('note-deleted', ({ id }) => {
    setNotes(prev => prev.filter(n => n.id !== id))
    if (activeNoteId === id) setActiveNoteId(null)
  })

  useSocket('online-users', setOnlineUsers)
  useSocket('activity-stats', setStats)

  async function createNote() {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Sans titre', content: '', author_id: user.id }),
    })
    const note = await res.json()
    setActiveNoteId(note.id)
  }

  async function createFlashNote() {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Note flash ⚡', content: '', author_id: user.id, expires_at: expires }),
    })
    const note = await res.json()
    setActiveNoteId(note.id)
  }

  async function deleteNote(id) {
    await fetch(`/api/notes/${id}`, { method: 'DELETE' })
  }

  const activeNote = notes.find(n => n.id === activeNoteId)

  return (
    <div className="app-layout">
      <Sidebar
        notes={notes}
        activeNoteId={activeNoteId}
        onSelect={setActiveNoteId}
        onNewNote={createNote}
        onNewFlash={createFlashNote}
        onDelete={deleteNote}
        user={user}
        onLogout={onLogout}
      />
      <div className="main-area">
        <div className="main-header">
          <div className="activity-stats">
            <span><span className="online-dot" /> {stats.online || onlineUsers.length} en ligne</span>
            <span>·</span>
            <span>{stats.totalNotes || notes.length} notes</span>
            <span>·</span>
            <span>{stats.todayModified} modifiées aujourd'hui</span>
          </div>
          <div className="activity-stats">
            {onlineUsers.map((u, i) => (
              <span key={i} className="user-avatar" style={{ background: u.color, width: 24, height: 24, fontSize: 11 }}>
                {u.display_name[0]}
              </span>
            ))}
          </div>
        </div>
        {activeNote ? (
          <NoteEditor note={activeNote} user={user} allUsers={allUsers} />
        ) : (
          <div className="empty-state">Sélectionne ou crée une note pour commencer</div>
        )}
      </div>
      <EffectOverlay />
      <EffectToasts />
    </div>
  )
}
