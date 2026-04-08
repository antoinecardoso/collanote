import { useRef, useCallback } from 'react'
import { useSocket } from '../hooks/useSocket'
import { runEffect } from '../lib/effects'
import { sounds } from '../lib/sounds'

export default function EffectOverlay() {
  const ref = useRef(null)

  useSocket('effect-triggered', useCallback((data) => {
    if (ref.current) runEffect(data.effect, ref.current)
    sounds[data.effect]?.()
  }, []))

  return <div className="effect-overlay" ref={ref} />
}
