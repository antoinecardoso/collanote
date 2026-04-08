import { useState, useEffect, useRef } from 'react'
import { useSocket, apiFetch } from '../hooks/useSocket'

const EMOJIS = ['👍', '🔥', '💡', '❓', '❤️', '✅']

export default function ReactionBar({ user }) {
  const [reactions, setReactions] = useState([])
  const [bouncing, setBouncing] = useState(null)

  useEffect(() => { apiFetch('/api/reactions').then(setReactions) }, [])

  useSocket('reactions-updated', (data) => {
    setReactions(data)
    // Find which emoji changed and bounce it
    setBouncing(null)
    setTimeout(() => setBouncing(Date.now()), 10)
  })

  async function toggle(emoji) {
    await apiFetch('/api/reactions', {
      method: 'POST',
      body: JSON.stringify({ user_id: user.id, emoji }),
    })
  }

  function getEmojiData(emoji) {
    const matching = reactions.filter(r => r.emoji === emoji)
    return { count: matching.length, isActive: matching.some(r => r.user_id === user.id), users: matching }
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-bg-secondary rounded-2xl px-5 py-2 flex items-center gap-1 border border-border/50">
      {EMOJIS.map(emoji => {
        const data = getEmojiData(emoji)
        return (
          <button
            key={emoji}
            onClick={() => toggle(emoji)}
            className="relative flex flex-col items-center px-2 py-1 rounded-xl transition-all duration-150 hover:scale-[1.3]"
            style={data.isActive ? { background: `${user.color}33`, boxShadow: `inset 0 0 0 1px ${user.color}` } : {}}
          >
            <span className="text-2xl">{emoji}</span>
            {data.count > 0 && <span className="text-[11px] text-txt-secondary -mt-0.5">{data.count}</span>}
          </button>
        )
      })}
    </div>
  )
}
