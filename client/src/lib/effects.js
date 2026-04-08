const COLORS = ['#60A5FA', '#F87171', '#34D399', '#FBBF24', '#A78BFA', '#F472B6']
const rand = (a, b) => a + Math.random() * (b - a)
const pick = arr => arr[Math.floor(Math.random() * arr.length)]

export function runEffect(name, container) {
  const fx = { confetti, explode, shake, matrix, disco, ghost, fireworks, flip, rain, applause, starwars, pacman, tetris, rocket, portal }
  fx[name]?.(container)
}

function confetti(c) {
  for (let i = 0; i < 100; i++) {
    const el = document.createElement('div')
    const s = rand(6, 12)
    Object.assign(el.style, { position: 'absolute', width: s + 'px', height: s * rand(0.5, 1.5) + 'px', background: pick(COLORS), borderRadius: pick(['50%', '0', '30%']), left: rand(0, 100) + '%', top: '-20px', pointerEvents: 'none' })
    c.appendChild(el)
    el.animate([
      { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
      { transform: `translateY(${window.innerHeight + 50}px) translateX(${rand(-100, 100)}px) rotate(${rand(-720, 720)}deg)`, opacity: 0.3 }
    ], { duration: rand(2000, 3500), easing: 'cubic-bezier(.25,.46,.45,.94)' }).onfinish = () => el.remove()
  }
}

function explode() {
  const ed = document.querySelector('.editor-wrap')
  if (!ed) return
  ed.style.transition = 'none'
  ed.animate([
    { transform: 'translate(0,0) rotate(0)' },
    { transform: 'translate(-8px,-4px) rotate(-1deg)' },
    { transform: 'translate(8px,4px) rotate(1deg)' },
    { transform: 'translate(-6px,6px) rotate(-0.5deg)' },
    { transform: 'translate(6px,-6px) rotate(0.5deg)' },
    { transform: 'translate(0,0) rotate(0)' },
  ], { duration: 400, easing: 'ease-in-out' })
  // Flash
  const flash = document.createElement('div')
  Object.assign(flash.style, { position: 'fixed', inset: '0', background: '#fff', pointerEvents: 'none', zIndex: '9998' })
  document.body.appendChild(flash)
  flash.animate([{ opacity: 0 }, { opacity: 0.3 }, { opacity: 0 }], { duration: 200 }).onfinish = () => flash.remove()
}

function shake() {
  const ed = document.querySelector('.editor-wrap')
  if (!ed) return
  ed.animate([
    { transform: 'translate(0,0) rotate(0)' },
    { transform: 'translate(-8px,-4px) rotate(-1deg)' },
    { transform: 'translate(8px,4px) rotate(1deg)' },
    { transform: 'translate(-6px,6px) rotate(-0.5deg)' },
    { transform: 'translate(6px,-6px) rotate(0.5deg)' },
    { transform: 'translate(-4px,2px) rotate(-1deg)' },
    { transform: 'translate(4px,-2px) rotate(0.5deg)' },
    { transform: 'translate(-2px,4px) rotate(-0.5deg)' },
    { transform: 'translate(2px,-4px) rotate(0deg)' },
    { transform: 'translate(0,0) rotate(0)' },
  ], { duration: 800, easing: 'ease-in-out' })
}

function matrix(c) {
  const canvas = document.createElement('canvas')
  canvas.width = window.innerWidth; canvas.height = window.innerHeight
  Object.assign(canvas.style, { position: 'fixed', inset: '0', zIndex: '9999', pointerEvents: 'none', background: 'rgba(0,0,0,0.85)' })
  c.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  const chars = 'アイウエオカキクケコ0123456789ABCDEF'
  const cols = Math.floor(canvas.width / 18)
  const drops = Array(cols).fill(0)
  let frame = 0
  function draw() {
    ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#00FF41'; ctx.font = '15px monospace'
    for (let i = 0; i < cols; i++) {
      ctx.globalAlpha = rand(0.3, 1)
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 18, drops[i] * 18)
      if (drops[i] * 18 > canvas.height && Math.random() > 0.975) drops[i] = 0
      drops[i]++
    }
    ctx.globalAlpha = 1; frame++
    if (frame < 120) requestAnimationFrame(draw)
    else canvas.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500 }).onfinish = () => canvas.remove()
  }
  draw()
}

function disco(c) {
  const ov = document.createElement('div')
  Object.assign(ov.style, { position: 'fixed', inset: '0', zIndex: '9998', pointerEvents: 'none', mixBlendMode: 'overlay', opacity: '0.3' })
  c.appendChild(ov)
  let step = 0
  const iv = setInterval(() => { ov.style.background = COLORS[step % COLORS.length]; step++ }, 200)
  for (let i = 0; i < 40; i++) {
    setTimeout(() => {
      const s = document.createElement('div')
      Object.assign(s.style, { position: 'fixed', width: '4px', height: '4px', background: '#fff', borderRadius: '50%', left: rand(5, 95) + '%', top: rand(5, 95) + '%', zIndex: '9999', pointerEvents: 'none' })
      c.appendChild(s)
      s.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(0)' }], { duration: 400 }).onfinish = () => s.remove()
    }, rand(0, 2800))
  }
  setTimeout(() => { clearInterval(iv); ov.remove() }, 3000)
}

function ghost() {
  const ed = document.querySelector('.ProseMirror')
  if (!ed) return
  ed.animate([
    { opacity: 1, filter: 'blur(0)', transform: 'scale(1)' },
    { opacity: 0.05, filter: 'blur(4px)', transform: 'scale(0.98)' },
    { opacity: 0.05, filter: 'blur(4px)', transform: 'scale(0.98)' },
    { opacity: 1, filter: 'blur(0)', transform: 'scale(1)' },
  ], { duration: 2000, easing: 'ease-in-out' })
  const g = document.createElement('div')
  Object.assign(g.style, { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '80px', zIndex: '9999', pointerEvents: 'none' })
  g.textContent = '👻'; document.body.appendChild(g)
  g.animate([{ opacity: 0, transform: 'translate(-50%,-50%) scale(0.5)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1.2)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }, { opacity: 0, transform: 'translate(-50%,-70%) scale(0.8)' }], { duration: 2000 }).onfinish = () => g.remove()
}

function fireworks(c) {
  for (let b = 0; b < 5; b++) {
    setTimeout(() => {
      const cx = rand(15, 85), cy = rand(15, 70)
      for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2, dist = rand(80, 200), s = rand(3, 6)
        const p = document.createElement('div')
        Object.assign(p.style, { position: 'fixed', width: s + 'px', height: s + 'px', borderRadius: '50%', background: pick(COLORS), left: cx + '%', top: cy + '%', zIndex: '9999', pointerEvents: 'none' })
        c.appendChild(p)
        p.animate([
          { transform: 'translate(0,0) scale(1)', opacity: 1 },
          { transform: `translate(${Math.cos(angle) * dist}px,${Math.sin(angle) * dist}px) scale(0)`, opacity: 0 }
        ], { duration: rand(600, 1000), easing: 'ease-out' }).onfinish = () => p.remove()
      }
    }, b * 400)
  }
}

function flip() {
  const ed = document.querySelector('.editor-wrap')
  if (!ed) return
  ed.style.transformStyle = 'preserve-3d'
  ed.animate([{ transform: 'perspective(1000px) rotateY(0)' }, { transform: 'perspective(1000px) rotateY(360deg)' }], { duration: 800, easing: 'ease-in-out' })
}

function rain(c) {
  const ov = document.createElement('div')
  Object.assign(ov.style, { position: 'fixed', inset: '0', background: 'rgba(96,165,250,0.05)', zIndex: '9998', pointerEvents: 'none' })
  c.appendChild(ov)
  for (let i = 0; i < 80; i++) {
    const d = document.createElement('div')
    Object.assign(d.style, { position: 'fixed', width: '2px', height: rand(10, 20) + 'px', background: 'rgba(96,165,250,0.6)', borderRadius: '2px', left: rand(0, 100) + '%', top: '-20px', transform: 'rotate(15deg)', zIndex: '9999', pointerEvents: 'none' })
    c.appendChild(d)
    setTimeout(() => {
      d.animate([{ transform: 'rotate(15deg) translateY(0)', opacity: 0.7 }, { transform: `rotate(15deg) translateY(${window.innerHeight + 40}px)`, opacity: 0.2 }], { duration: rand(400, 800) }).onfinish = () => d.remove()
    }, rand(0, 2500))
  }
  setTimeout(() => ov.remove(), 3500)
}

function applause(c) {
  for (let i = 0; i < 40; i++) {
    const e = document.createElement('div')
    Object.assign(e.style, { position: 'fixed', left: rand(5, 95) + '%', bottom: '-40px', fontSize: rand(20, 36) + 'px', zIndex: '9999', pointerEvents: 'none' })
    e.textContent = '👏'; c.appendChild(e)
    setTimeout(() => {
      e.animate([
        { transform: 'translateY(0) scale(0.5)', opacity: 0 },
        { transform: `translateY(-${rand(300, 600)}px) scale(1.2)`, opacity: 1, offset: 0.4 },
        { transform: `translateY(-${rand(600, 900)}px) scale(0.8)`, opacity: 0 }
      ], { duration: 2000, easing: 'ease-out' }).onfinish = () => e.remove()
    }, rand(0, 500))
  }
}

// ─── NEW EFFECTS ───

function starwars(c) {
  const ov = document.createElement('div')
  Object.assign(ov.style, { position: 'fixed', inset: '0', zIndex: '9999', pointerEvents: 'none', background: '#000', perspective: '400px', overflow: 'hidden' })
  const text = document.createElement('div')
  Object.assign(text.style, { position: 'absolute', bottom: '-100%', left: '50%', transform: 'translateX(-50%) rotateX(25deg)', width: '80%', maxWidth: '600px', textAlign: 'center', color: '#FBBF24', fontSize: '22px', fontWeight: '600', lineHeight: '1.8', fontFamily: 'DM Sans, sans-serif' })
  text.innerHTML = 'Il y a bien longtemps,<br>dans une salle de réunion<br>lointaine, très lointaine...<br><br>⭐ NOTES ⭐<br><br>Six développeurs se sont réunis<br>pour écrire la note ultime.'
  ov.appendChild(text); c.appendChild(ov)
  text.animate([
    { transform: 'translateX(-50%) rotateX(25deg) translateY(0)' },
    { transform: 'translateX(-50%) rotateX(25deg) translateY(-200%)' }
  ], { duration: 8000, easing: 'linear' })
  setTimeout(() => ov.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500 }).onfinish = () => ov.remove(), 7500)
}

function pacman(c) {
  const pac = document.createElement('div')
  Object.assign(pac.style, { position: 'fixed', left: '-40px', top: '50%', zIndex: '9999', pointerEvents: 'none', fontSize: '36px', transform: 'translateY(-50%)' })
  pac.textContent = '🟡'
  c.appendChild(pac)
  // Dots
  const dots = []
  for (let i = 0; i < 20; i++) {
    const d = document.createElement('div')
    Object.assign(d.style, { position: 'fixed', left: (5 + i * 5) + '%', top: '50%', transform: 'translateY(-50%)', zIndex: '9998', pointerEvents: 'none', width: '8px', height: '8px', borderRadius: '50%', background: '#FBBF24' })
    c.appendChild(d); dots.push(d)
  }
  // Ghosts following
  const ghosts = ['🔴', '🩷', '🩵', '🟠']
  const ghostEls = ghosts.map((g, i) => {
    const el = document.createElement('div')
    Object.assign(el.style, { position: 'fixed', left: (-80 - i * 40) + 'px', top: '50%', zIndex: '9997', pointerEvents: 'none', fontSize: '28px', transform: 'translateY(-50%)' })
    el.textContent = g; c.appendChild(el); return el
  })
  pac.animate([{ left: '-40px' }, { left: '110%' }], { duration: 3000, easing: 'linear' }).onfinish = () => pac.remove()
  ghostEls.forEach((g, i) => {
    g.animate([{ left: (-80 - i * 40) + 'px' }, { left: '110%' }], { duration: 3000 + i * 200, easing: 'linear' }).onfinish = () => g.remove()
  })
  dots.forEach((d, i) => { setTimeout(() => d.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-50%) scale(0)' }], { duration: 200 }).onfinish = () => d.remove(), i * 130) })
}

function tetris(c) {
  const shapes = [
    { blocks: [[0,0],[1,0],[2,0],[3,0]], color: '#60A5FA' }, // I
    { blocks: [[0,0],[1,0],[0,1],[1,1]], color: '#FBBF24' }, // O
    { blocks: [[0,0],[1,0],[2,0],[1,1]], color: '#A78BFA' }, // T
    { blocks: [[0,0],[1,0],[1,1],[2,1]], color: '#34D399' }, // S
    { blocks: [[1,0],[2,0],[0,1],[1,1]], color: '#F87171' }, // Z
  ]
  for (let i = 0; i < 12; i++) {
    const shape = pick(shapes)
    const group = document.createElement('div')
    Object.assign(group.style, { position: 'fixed', left: rand(5, 85) + '%', top: '-80px', zIndex: '9999', pointerEvents: 'none' })
    shape.blocks.forEach(([bx, by]) => {
      const b = document.createElement('div')
      Object.assign(b.style, { position: 'absolute', width: '20px', height: '20px', background: shape.color, border: '2px solid rgba(255,255,255,0.2)', borderRadius: '3px', left: bx * 22 + 'px', top: by * 22 + 'px' })
      group.appendChild(b)
    })
    c.appendChild(group)
    const delay = rand(0, 2000)
    setTimeout(() => {
      group.animate([
        { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
        { transform: `translateY(${window.innerHeight + 100}px) rotate(${rand(-180, 180)}deg)`, opacity: 0.5 }
      ], { duration: rand(1500, 3000), easing: 'ease-in' }).onfinish = () => group.remove()
    }, delay)
  }
}

function rocket(c) {
  const rocket = document.createElement('div')
  Object.assign(rocket.style, { position: 'fixed', left: '50%', bottom: '-60px', transform: 'translateX(-50%)', zIndex: '9999', pointerEvents: 'none', fontSize: '48px' })
  rocket.textContent = '🚀'
  c.appendChild(rocket)
  // Smoke particles
  const smokeInterval = setInterval(() => {
    const s = document.createElement('div')
    Object.assign(s.style, { position: 'fixed', left: (50 + rand(-3, 3)) + '%', bottom: '0px', transform: 'translateX(-50%)', zIndex: '9998', pointerEvents: 'none', width: rand(10, 25) + 'px', height: rand(10, 25) + 'px', borderRadius: '50%', background: 'rgba(200,200,200,0.5)' })
    c.appendChild(s)
    s.animate([
      { transform: 'translateX(-50%) scale(1)', opacity: 0.6 },
      { transform: `translateX(${rand(-50, 50)}px) scale(3)`, opacity: 0 }
    ], { duration: 800 }).onfinish = () => s.remove()
  }, 50)
  // Shake screen during launch
  const ed = document.querySelector('.editor-wrap')
  if (ed) ed.animate([
    { transform: 'translate(0,0)' }, { transform: 'translate(-2px,1px)' },
    { transform: 'translate(2px,-1px)' }, { transform: 'translate(-1px,2px)' },
    { transform: 'translate(1px,-2px)' }, { transform: 'translate(0,0)' },
  ], { duration: 300, iterations: 5 })
  // Launch
  rocket.animate([
    { bottom: '-60px', transform: 'translateX(-50%) scale(1)' },
    { bottom: '110%', transform: 'translateX(-50%) scale(0.5)' }
  ], { duration: 1500, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }).onfinish = () => { rocket.remove(); clearInterval(smokeInterval) }
  setTimeout(() => clearInterval(smokeInterval), 1600)
}

function portal(c) {
  const ov = document.createElement('div')
  Object.assign(ov.style, { position: 'fixed', inset: '0', zIndex: '9999', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' })
  const ring = document.createElement('div')
  Object.assign(ring.style, { width: '0px', height: '0px', borderRadius: '50%', border: '4px solid #A78BFA', boxShadow: '0 0 30px #A78BFA, 0 0 60px #A78BFA44, inset 0 0 30px #A78BFA44', transition: 'all 0.5s ease-out' })
  ov.appendChild(ring); c.appendChild(ov)
  // Expand
  setTimeout(() => { ring.style.width = '300px'; ring.style.height = '300px' }, 50)
  // Particles getting sucked in
  for (let i = 0; i < 60; i++) {
    setTimeout(() => {
      const p = document.createElement('div')
      const angle = Math.random() * Math.PI * 2
      const dist = rand(200, 500)
      const sx = Math.cos(angle) * dist, sy = Math.sin(angle) * dist
      Object.assign(p.style, { position: 'fixed', left: '50%', top: '50%', width: rand(3, 8) + 'px', height: rand(3, 8) + 'px', borderRadius: '50%', background: pick(COLORS), zIndex: '9999', pointerEvents: 'none' })
      c.appendChild(p)
      p.animate([
        { transform: `translate(${sx}px, ${sy}px) scale(1)`, opacity: 1 },
        { transform: 'translate(-50%, -50%) scale(0)', opacity: 0 }
      ], { duration: rand(500, 1000), easing: 'ease-in' }).onfinish = () => p.remove()
    }, rand(0, 2000))
  }
  // Collapse
  setTimeout(() => {
    ring.style.width = '0px'; ring.style.height = '0px'
    setTimeout(() => ov.remove(), 600)
  }, 2500)
}
