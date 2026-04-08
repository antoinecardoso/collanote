import { useState, useCallback } from 'react'
import { useSocket } from '../hooks/useSocket'

const EFFECT_NAMES = {
  confetti: '🎉 Confetti',
  explode: '💥 Exploser',
  shake: '🫨 Tremblement',
  matrix: '🟢 Matrix',
  disco: '🪩 Disco',
  ghost: '👻 Fantôme',
  fireworks: '🎆 Feu d\'artifice',
  flip: '🔄 Flip',
  rain: '🌧️ Pluie',
  applause: '👏 Applaudissements',
}

export default function EffectToasts() {
  const [toasts, setToasts] = useState([])

  useSocket('effect-triggered', useCallback((data) => {
    const id = Date.now()
    const toast = {
      id,
      userName: data.userName || 'Quelqu\'un',
      userColor: data.userColor || '#60A5FA',
      effectName: EFFECT_NAMES[data.effect] || data.effect,
    }
    setToasts(prev => [...prev.slice(-2), toast])

    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t))
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 300)
    }, 2000)
  }, []))

  return (
    <div className="effect-toasts">
      {toasts.map(toast => (
        <div key={toast.id} className={`effect-toast ${toast.leaving ? 'leaving' : ''}`}
          style={{ borderLeft: `3px solid ${toast.userColor}` }}>
          <span className="toast-dot" style={{ background: toast.userColor }} />
          <span>{toast.userName} a lancé {toast.effectName}</span>
        </div>
      ))}
    </div>
  )
}
