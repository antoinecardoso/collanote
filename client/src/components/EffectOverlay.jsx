import { useRef, useCallback } from 'react'
import { useSocket } from '../hooks/useSocket'

const USER_COLORS = ['#60A5FA', '#F87171', '#34D399', '#FBBF24', '#A78BFA', '#F472B6']

function randomBetween(a, b) { return a + Math.random() * (b - a) }
function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

export default function EffectOverlay() {
  const overlayRef = useRef(null)

  const runEffect = useCallback((effect) => {
    const el = overlayRef.current
    if (!el) return
    const effects = { confetti, explode, shake, matrix, disco, ghost, fireworks, flip, rain, applause }
    effects[effect]?.(el)
  }, [])

  useSocket('effect-triggered', (data) => {
    runEffect(data.effect)
  })

  return <div className="effect-overlay" ref={overlayRef} />
}

// ─── CONFETTI ───
function confetti(container) {
  const shapes = ['50%', '0', '50% 0 50% 50%']
  for (let i = 0; i < 100; i++) {
    const el = document.createElement('div')
    const size = randomBetween(6, 12)
    Object.assign(el.style, {
      position: 'absolute',
      width: size + 'px',
      height: size * randomBetween(0.5, 1.5) + 'px',
      background: randomPick(USER_COLORS),
      borderRadius: randomPick(shapes),
      left: randomBetween(0, 100) + '%',
      top: '-20px',
      opacity: '1',
      pointerEvents: 'none',
      zIndex: '9999',
    })
    container.appendChild(el)
    const xDrift = randomBetween(-100, 100)
    const duration = randomBetween(2000, 3500)
    const rotation = randomBetween(-720, 720)
    el.animate([
      { transform: `translateY(0) translateX(0) rotate(0deg)`, opacity: 1 },
      { transform: `translateY(${window.innerHeight + 50}px) translateX(${xDrift}px) rotate(${rotation}deg)`, opacity: 0.3 },
    ], { duration, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }).onfinish = () => el.remove()
  }
}

// ─── EXPLODE ───
function explode(container) {
  const editor = document.querySelector('.editor-container')
  if (!editor) return
  editor.style.transition = 'transform 0.4s, opacity 0.4s'
  editor.style.transform = 'scale(0.95)'
  editor.style.opacity = '0.3'
  // Create fragments
  const frags = []
  for (let i = 0; i < 12; i++) {
    const frag = document.createElement('div')
    Object.assign(frag.style, {
      position: 'fixed',
      width: randomBetween(20, 60) + 'px',
      height: randomBetween(20, 40) + 'px',
      background: randomPick(USER_COLORS),
      borderRadius: '4px',
      opacity: '0.6',
      left: randomBetween(20, 80) + '%',
      top: randomBetween(20, 70) + '%',
      pointerEvents: 'none',
      zIndex: '9999',
    })
    container.appendChild(frag)
    frags.push(frag)
    frag.animate([
      { transform: 'scale(1) translate(0,0) rotate(0deg)', opacity: 0.7 },
      { transform: `scale(0.3) translate(${randomBetween(-300, 300)}px, ${randomBetween(-300, 300)}px) rotate(${randomBetween(-180, 180)}deg)`, opacity: 0 },
    ], { duration: 800, easing: 'ease-out' }).onfinish = () => frag.remove()
  }
  setTimeout(() => {
    editor.style.transform = ''
    editor.style.opacity = ''
    setTimeout(() => { editor.style.transition = '' }, 400)
  }, 800)
}

// ─── SHAKE ───
function shake() {
  const main = document.querySelector('.main-area')
  if (!main) return
  main.style.animation = 'effectShake 0.8s ease-in-out'
  // Inject keyframes if not present
  if (!document.getElementById('shake-keyframes')) {
    const style = document.createElement('style')
    style.id = 'shake-keyframes'
    style.textContent = `
      @keyframes effectShake {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        10% { transform: translate(-8px, -4px) rotate(-1deg); }
        20% { transform: translate(8px, 4px) rotate(1deg); }
        30% { transform: translate(-6px, 6px) rotate(-0.5deg); }
        40% { transform: translate(6px, -6px) rotate(0.5deg); }
        50% { transform: translate(-4px, 2px) rotate(-1deg); }
        60% { transform: translate(4px, -2px) rotate(0.5deg); }
        70% { transform: translate(-2px, 4px) rotate(-0.5deg); }
        80% { transform: translate(2px, -4px) rotate(0deg); }
        90% { transform: translate(-1px, 1px) rotate(0.5deg); }
      }
    `
    document.head.appendChild(style)
  }
  setTimeout(() => { main.style.animation = '' }, 850)
}

// ─── MATRIX ───
function matrix(container) {
  const canvas = document.createElement('canvas')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', zIndex: '9999', pointerEvents: 'none',
    background: 'rgba(0,0,0,0.85)',
  })
  container.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  const chars = 'アイウエオカキクケコサシスセソタチツテト0123456789ABCDEF'
  const cols = Math.floor(canvas.width / 18)
  const drops = Array(cols).fill(0)
  let frame = 0
  const maxFrames = 120

  function draw() {
    ctx.fillStyle = 'rgba(0,0,0,0.05)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#00FF41'
    ctx.font = '15px monospace'
    for (let i = 0; i < cols; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)]
      ctx.globalAlpha = randomBetween(0.3, 1)
      ctx.fillText(char, i * 18, drops[i] * 18)
      if (drops[i] * 18 > canvas.height && Math.random() > 0.975) drops[i] = 0
      drops[i]++
    }
    ctx.globalAlpha = 1
    frame++
    if (frame < maxFrames) requestAnimationFrame(draw)
    else {
      canvas.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500 }).onfinish = () => canvas.remove()
    }
  }
  draw()
}

// ─── DISCO ───
function disco(container) {
  const overlay = document.createElement('div')
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0', zIndex: '9998', pointerEvents: 'none',
    mixBlendMode: 'overlay', opacity: '0.3',
  })
  container.appendChild(overlay)
  let step = 0
  const interval = setInterval(() => {
    overlay.style.background = USER_COLORS[step % USER_COLORS.length]
    step++
  }, 200)
  // Sparkles
  for (let i = 0; i < 40; i++) {
    setTimeout(() => {
      const spark = document.createElement('div')
      Object.assign(spark.style, {
        position: 'fixed', width: '4px', height: '4px',
        background: '#fff', borderRadius: '50%',
        left: randomBetween(5, 95) + '%', top: randomBetween(5, 95) + '%',
        zIndex: '9999', pointerEvents: 'none',
      })
      container.appendChild(spark)
      spark.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(0)' }], {
        duration: 400,
      }).onfinish = () => spark.remove()
    }, randomBetween(0, 2800))
  }
  setTimeout(() => { clearInterval(interval); overlay.remove() }, 3000)
}

// ─── GHOST ───
function ghost() {
  const editor = document.querySelector('.ProseMirror')
  if (!editor) return
  editor.animate([
    { opacity: 1, filter: 'blur(0)', transform: 'scale(1)' },
    { opacity: 0.05, filter: 'blur(4px)', transform: 'scale(0.98)' },
    { opacity: 0.05, filter: 'blur(4px)', transform: 'scale(0.98)' },
    { opacity: 1, filter: 'blur(0)', transform: 'scale(1)' },
  ], { duration: 2000, easing: 'ease-in-out' })
  // Ghost emoji
  const ghost = document.createElement('div')
  Object.assign(ghost.style, {
    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    fontSize: '80px', zIndex: '9999', pointerEvents: 'none',
  })
  ghost.textContent = '👻'
  document.body.appendChild(ghost)
  ghost.animate([
    { opacity: 0, transform: 'translate(-50%, -50%) scale(0.5)' },
    { opacity: 1, transform: 'translate(-50%, -50%) scale(1.2)' },
    { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
    { opacity: 0, transform: 'translate(-50%, -70%) scale(0.8)' },
  ], { duration: 2000 }).onfinish = () => ghost.remove()
}

// ─── FIREWORKS ───
function fireworks(container) {
  for (let burst = 0; burst < 5; burst++) {
    setTimeout(() => {
      const cx = randomBetween(15, 85)
      const cy = randomBetween(15, 70)
      for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2
        const dist = randomBetween(80, 200)
        const particle = document.createElement('div')
        const size = randomBetween(3, 6)
        Object.assign(particle.style, {
          position: 'fixed', width: size + 'px', height: size + 'px',
          borderRadius: '50%', background: randomPick(USER_COLORS),
          left: cx + '%', top: cy + '%',
          zIndex: '9999', pointerEvents: 'none',
        })
        container.appendChild(particle)
        particle.animate([
          { transform: 'translate(0,0) scale(1)', opacity: 1 },
          { transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0)`, opacity: 0 },
        ], { duration: randomBetween(600, 1000), easing: 'ease-out' }).onfinish = () => particle.remove()
      }
    }, burst * 400)
  }
}

// ─── FLIP ───
function flip() {
  const editor = document.querySelector('.editor-container')
  if (!editor) return
  editor.style.transformStyle = 'preserve-3d'
  editor.animate([
    { transform: 'perspective(1000px) rotateY(0deg)' },
    { transform: 'perspective(1000px) rotateY(360deg)' },
  ], { duration: 800, easing: 'ease-in-out' })
}

// ─── RAIN ───
function rain(container) {
  const overlay = document.createElement('div')
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0', background: 'rgba(96,165,250,0.05)',
    zIndex: '9998', pointerEvents: 'none',
  })
  container.appendChild(overlay)
  for (let i = 0; i < 80; i++) {
    const drop = document.createElement('div')
    Object.assign(drop.style, {
      position: 'fixed', width: '2px', height: randomBetween(10, 20) + 'px',
      background: 'rgba(96,165,250,0.6)', borderRadius: '2px',
      left: randomBetween(0, 100) + '%', top: '-20px',
      transform: 'rotate(15deg)',
      zIndex: '9999', pointerEvents: 'none',
    })
    container.appendChild(drop)
    const duration = randomBetween(400, 800)
    const delay = randomBetween(0, 2500)
    setTimeout(() => {
      drop.animate([
        { transform: 'rotate(15deg) translateY(0)', opacity: 0.7 },
        { transform: `rotate(15deg) translateY(${window.innerHeight + 40}px)`, opacity: 0.2 },
      ], { duration }).onfinish = () => drop.remove()
    }, delay)
  }
  setTimeout(() => overlay.remove(), 3500)
}

// ─── APPLAUSE ───
function applause(container) {
  for (let i = 0; i < 40; i++) {
    const emoji = document.createElement('div')
    Object.assign(emoji.style, {
      position: 'fixed',
      left: randomBetween(5, 95) + '%',
      bottom: '-40px',
      fontSize: randomBetween(20, 36) + 'px',
      zIndex: '9999', pointerEvents: 'none',
    })
    emoji.textContent = '👏'
    container.appendChild(emoji)
    const delay = randomBetween(0, 500)
    setTimeout(() => {
      emoji.animate([
        { transform: 'translateY(0) scale(0.5)', opacity: 0 },
        { transform: `translateY(-${randomBetween(300, 600)}px) scale(1.2)`, opacity: 1, offset: 0.4 },
        { transform: `translateY(-${randomBetween(600, 900)}px) scale(0.8)`, opacity: 0 },
      ], { duration: 2000, easing: 'ease-out' }).onfinish = () => emoji.remove()
    }, delay)
  }
}
