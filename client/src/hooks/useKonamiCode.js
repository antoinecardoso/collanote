import { useEffect, useRef } from 'react'

const SEQUENCE = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']

export default function useKonamiCode(onActivate) {
  const idx = useRef(0)
  useEffect(() => {
    function handler(e) {
      if (document.querySelector('.ProseMirror:focus')) return
      if (e.key === SEQUENCE[idx.current]) {
        idx.current++
        if (idx.current === SEQUENCE.length) { idx.current = 0; onActivate() }
      } else {
        idx.current = 0
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onActivate])
}
