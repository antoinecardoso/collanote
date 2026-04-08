let ctx = null
let muted = localStorage.getItem('notes-sound-muted') === 'true'

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

export function isMuted() { return muted }
export function toggleMute() { muted = !muted; localStorage.setItem('notes-sound-muted', muted); return muted }

function play(fn) { if (muted) return; try { fn(getCtx()) } catch {} }

export const sounds = {
  confetti: () => play(ctx => { const o = ctx.createOscillator(); const g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(300, ctx.currentTime); o.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15); g.gain.setValueAtTime(0.15, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15); o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.15) }),

  explode: () => play(ctx => { const buf = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05)); const src = ctx.createBufferSource(); src.buffer = buf; const g = ctx.createGain(); g.gain.setValueAtTime(0.3, ctx.currentTime); src.connect(g).connect(ctx.destination); src.start(); const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 80; const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.2, ctx.currentTime); g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3); o.connect(g2).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.3) }),

  shake: () => play(ctx => { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 60; const g = ctx.createGain(); g.gain.setValueAtTime(0.15, ctx.currentTime); const lfo = ctx.createOscillator(); lfo.frequency.value = 8; const lfoG = ctx.createGain(); lfoG.gain.value = 0.1; lfo.connect(lfoG).connect(g.gain); o.connect(g).connect(ctx.destination); o.start(); lfo.start(); o.stop(ctx.currentTime + 0.8); lfo.stop(ctx.currentTime + 0.8) }),

  matrix: () => play(ctx => { for (let i = 0; i < 5; i++) { const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = 800 + Math.random() * 400; const g = ctx.createGain(); g.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.1); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.08); o.connect(g).connect(ctx.destination); o.start(ctx.currentTime + i * 0.1); o.stop(ctx.currentTime + i * 0.1 + 0.08) } }),

  disco: () => play(ctx => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(200, ctx.currentTime); o.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.5); const g = ctx.createGain(); g.gain.setValueAtTime(0.1, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5); o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.5) }),

  ghost: () => play(ctx => { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 400; const lfo = ctx.createOscillator(); lfo.frequency.value = 4; const lfoG = ctx.createGain(); lfoG.gain.value = 20; lfo.connect(lfoG).connect(o.frequency); const g = ctx.createGain(); g.gain.setValueAtTime(0.1, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1); o.connect(g).connect(ctx.destination); o.start(); lfo.start(); o.stop(ctx.currentTime + 1); lfo.stop(ctx.currentTime + 1) }),

  fireworks: () => play(ctx => { for (let i = 0; i < 3; i++) { setTimeout(() => { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(200, ctx.currentTime); o.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.1); const g = ctx.createGain(); g.gain.setValueAtTime(0.12, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3); o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.3) }, i * 300) } }),

  flip: () => play(ctx => { const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.3; const src = ctx.createBufferSource(); src.buffer = buf; const filter = ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = 800; filter.Q.value = 2; const g = ctx.createGain(); g.gain.setValueAtTime(0.15, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3); src.connect(filter).connect(g).connect(ctx.destination); src.start(); src.stop(ctx.currentTime + 0.3) }),

  rain: () => play(ctx => { const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1); const src = ctx.createBufferSource(); src.buffer = buf; const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 400; const g = ctx.createGain(); g.gain.setValueAtTime(0.06, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3); src.connect(filter).connect(g).connect(ctx.destination); src.start(); src.stop(ctx.currentTime + 3) }),

  applause: () => play(ctx => { for (let i = 0; i < 8; i++) { setTimeout(() => { const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate); const d = buf.getChannelData(0); for (let j = 0; j < d.length; j++) d[j] = (Math.random() * 2 - 1); const src = ctx.createBufferSource(); src.buffer = buf; const g = ctx.createGain(); g.gain.value = 0.1; src.connect(g).connect(ctx.destination); src.start() }, i * 100) } }),

  starwars: () => play(ctx => { const notes = [392, 523, 466, 440, 784]; notes.forEach((f, i) => { const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = f; const g = ctx.createGain(); g.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.3); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.3 + 0.25); o.connect(g).connect(ctx.destination); o.start(ctx.currentTime + i * 0.3); o.stop(ctx.currentTime + i * 0.3 + 0.25) }) }),

  pacman: () => play(ctx => { for (let i = 0; i < 6; i++) { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = i % 2 === 0 ? 600 : 500; const g = ctx.createGain(); g.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.08); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.06); o.connect(g).connect(ctx.destination); o.start(ctx.currentTime + i * 0.08); o.stop(ctx.currentTime + i * 0.08 + 0.06) } }),

  tetris: () => play(ctx => { const melody = [659,494,523,587,523,494,440,440,523,659,587,523,494,523,587,659]; melody.forEach((f, i) => { const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = f; const g = ctx.createGain(); g.gain.setValueAtTime(0.06, ctx.currentTime + i * 0.12); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.1); o.connect(g).connect(ctx.destination); o.start(ctx.currentTime + i * 0.12); o.stop(ctx.currentTime + i * 0.12 + 0.1) }) }),

  rocket: () => play(ctx => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(80, ctx.currentTime); o.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 1.5); const g = ctx.createGain(); g.gain.setValueAtTime(0.15, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5); o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 1.5) }),

  portal: () => play(ctx => { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(200, ctx.currentTime); o.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 1); o.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 2.5); const lfo = ctx.createOscillator(); lfo.frequency.value = 6; const lfoG = ctx.createGain(); lfoG.gain.value = 50; lfo.connect(lfoG).connect(o.frequency); const g = ctx.createGain(); g.gain.setValueAtTime(0.1, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5); o.connect(g).connect(ctx.destination); o.start(); lfo.start(); o.stop(ctx.currentTime + 2.5); lfo.stop(ctx.currentTime + 2.5) }),
}
