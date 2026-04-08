import { useState, useEffect } from 'react'
import { useSocket } from '../hooks/useSocket'

const EMOJIS = ['👍', '🔥', '💡', '❓', '❤️', '✅']

export default function Reactions({ noteId, user }) {
  const [reactions, setReactions] = useState([])

  useEffect(() => {
    fetch(`/api/notes/${noteId}/reactions`).then(r => r.json()).then(setReactions)
  }, [noteId])

  useSocket('reactions-updated', (data) => {
    if (data.noteId === noteId) setReactions(data.reactions)
  })

  async function toggleReaction(emoji) {
    const res = await fetch(`/api/notes/${noteId}/reactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, emoji }),
    })
    setReactions(await res.json())
  }

  function getEmojiData(emoji) {
    const matching = reactions.filter(r => r.emoji === emoji)
    const isActive = matching.some(r => r.user_id === user.id)
    return { count: matching.length, isActive, users: matching }
  }

  return (
    <div className="reactions-bar">
      {EMOJIS.map(emoji => {
        const data = getEmojiData(emoji)
        return (
          <button
            key={emoji}
            className={`reaction-btn ${data.isActive ? 'active' : ''}`}
            onClick={() => toggleReaction(emoji)}
          >
            {emoji}
            {data.count > 0 && <span className="reaction-count">{data.count}</span>}
            {data.count > 0 && (
              <span className="reaction-users">
                {data.users.map((u, i) => (
                  <span key={i} className="reaction-user-dot" style={{ background: u.color }} />
                ))}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
