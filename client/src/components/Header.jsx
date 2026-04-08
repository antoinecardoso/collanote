import { useState } from 'react'
import { isMuted, toggleMute } from '../lib/sounds'

const ALL_USERS = [
  { id: 1, display_name: 'Antoine', color: '#60A5FA' },
  { id: 2, display_name: 'Efraim', color: '#F87171' },
  { id: 3, display_name: 'Ana', color: '#34D399' },
  { id: 4, display_name: 'Marie', color: '#FBBF24' },
  { id: 5, display_name: 'Lucas', color: '#A78BFA' },
  { id: 6, display_name: 'Sarah', color: '#F472B6' },
]

export default function Header({ activeUsers, saved, onLogout }) {
  const [muted, setMuted] = useState(isMuted())
  const onlineIds = activeUsers.map(u => u.id)

  return (
    <header className="h-14 flex items-center px-6 gap-4 shrink-0">
      <span className="text-lg font-medium text-txt-primary">Notes</span>
      <div className="flex-1 flex items-center justify-center gap-3">
        {ALL_USERS.map(u => {
          const online = onlineIds.includes(u.id)
          const typing = activeUsers.find(a => a.id === u.id)?.isTyping
          return (
            <div key={u.id} className="relative group" title={u.display_name}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold transition-all duration-300 ${online ? 'scale-100' : 'scale-90 opacity-40 grayscale'}`}
                style={{ background: online ? u.color : '#525252', boxShadow: online ? `0 0 12px ${u.color}4D` : 'none' }}
              >
                {u.display_name[0]}
              </div>
              {online && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-bg-primary" />}
              {typing && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-1 h-1 rounded-full bg-current" style={{ color: u.color, animation: `typingDots 1.4s infinite ${i * 0.2}s` }} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-2">
        {saved && <span className="text-xs text-txt-tertiary">Sauvegardé ✓</span>}
        <button onClick={() => setMuted(toggleMute())} className="text-txt-tertiary hover:text-txt-primary transition-colors text-lg w-8 h-8 flex items-center justify-center">
          {muted ? '🔇' : '🔊'}
        </button>
        <button onClick={onLogout} className="text-txt-tertiary hover:text-[#F87171] transition-colors text-lg w-8 h-8 flex items-center justify-center">
          ⏏
        </button>
      </div>
    </header>
  )
}
