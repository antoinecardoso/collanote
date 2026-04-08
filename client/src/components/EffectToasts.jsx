import { useState, useCallback } from 'react'
import { useSocket } from '../hooks/useSocket'

const NAMES = { confetti:'🎉 Confetti', explode:'💥 Exploser', shake:'🫨 Tremblement', matrix:'🟢 Matrix', disco:'🪩 Disco', ghost:'👻 Fantôme', fireworks:'🎆 Feu d\'artifice', flip:'🔄 Flip', rain:'🌧️ Pluie', applause:'👏 Applaudissements', starwars:'⚔️ Star Wars', pacman:'🕹️ Pac-Man', tetris:'🧱 Tetris', rocket:'🚀 Rocket', portal:'🌀 Portal' }

export default function EffectToasts() {
  const [toasts, setToasts] = useState([])

  useSocket('effect-triggered', useCallback((data) => {
    const id = Date.now()
    const isKonami = data.isCombo && data.effect === 'confetti'
    setToasts(prev => [...prev.slice(-2), { id, userName: data.userName, userColor: data.userColor, effectName: NAMES[data.effect] || data.effect, isKonami }])
    setTimeout(() => setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t)), 2000)
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2300)
  }, []))

  return (
    <div className="fixed bottom-20 right-5 z-[10000] flex flex-col-reverse gap-2">
      {toasts.map(t => (
        <div key={t.id}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] text-txt-primary shadow-lg ${t.isKonami ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400' : 'bg-bg-elevated'}`}
          style={{ borderLeft: t.isKonami ? 'none' : `3px solid ${t.userColor}`, animation: t.leaving ? 'toastOut 0.3s forwards' : 'toastIn 0.3s ease-out' }}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: t.userColor }} />
          {t.isKonami ? `🕹️ ${t.userName} a trouvé le code secret !` : `${t.userName} a lancé ${t.effectName}`}
        </div>
      ))}
    </div>
  )
}
