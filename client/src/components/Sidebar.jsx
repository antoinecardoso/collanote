function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "à l'instant"
  if (mins < 60) return `il y a ${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `il y a ${days}j`
}

function getTimeRemaining(expiresAt) {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return 'expiré'
  const hours = Math.floor(diff / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  return `${hours}h${mins.toString().padStart(2, '0')}`
}

export default function Sidebar({ notes, activeNoteId, onSelect, onNewNote, onNewFlash, onDelete, user, onLogout }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>CollaNote</h2>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn-new-note" onClick={onNewFlash} title="Note flash 24h">⚡</button>
          <button className="btn-new-note" onClick={onNewNote}>+ Note</button>
        </div>
      </div>

      <div className="note-list">
        {notes.map(note => (
          <div
            key={note.id}
            className={`note-item ${note.id === activeNoteId ? 'active' : ''}`}
            onClick={() => onSelect(note.id)}
          >
            <div className="note-item-title">{note.title || 'Sans titre'}</div>
            <div className="note-item-meta">
              <span className="note-item-dot" style={{ background: note.author_color }} />
              <span>{note.author_name}</span>
              <span>· {timeAgo(note.updated_at)}</span>
              {note.expires_at && (
                <span className="flash-badge">⚡ {getTimeRemaining(note.expires_at)}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar-user">
        <div className="user-avatar" style={{ background: user.color }}>
          {user.display_name[0]}
        </div>
        <span>{user.display_name}</span>
        <button className="btn-logout" onClick={onLogout}>Quitter</button>
      </div>
    </div>
  )
}
