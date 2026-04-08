import { useState, useEffect } from 'react'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 6) return 'Bonne nuit'
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bon après-midi'
  return 'Bonne soirée'
}

export default function WelcomeScreen({ user, onlineCount, onDone }) {
  const [phase, setPhase] = useState('in') // in → show → out → done

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('show'), 400)
    const t2 = setTimeout(() => setPhase('out'), 2400)
    const t3 = setTimeout(() => onDone(), 2900)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  function skip() { setPhase('out'); setTimeout(onDone, 500) }

  const opacity = phase === 'show' ? 'opacity-100' : 'opacity-0'

  return (
    <div className={`fixed inset-0 z-50 bg-bg-primary flex items-center justify-center cursor-pointer transition-opacity duration-500 ${opacity}`} onClick={skip}>
      <div className="text-center">
        <h1 className="text-4xl font-semibold text-white mb-3">
          {getGreeting()}, {user.display_name} 👋
        </h1>
        <p className="text-txt-tertiary text-lg">
          {onlineCount > 0 ? `${onlineCount} personne${onlineCount > 1 ? 's' : ''} déjà là` : 'Tu es le premier !'}
        </p>
      </div>
    </div>
  )
}
