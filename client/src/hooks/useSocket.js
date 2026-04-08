import { useEffect, useRef } from 'react'

const API_URL = import.meta.env.VITE_API_URL || ''
const WS_URL = import.meta.env.VITE_WS_URL || ''
const IS_PROD = !!WS_URL

// ─── Production: native WebSocket ───
let ws = null
let wsListeners = new Map()
let reconnectTimer = null

function getWs() {
  if (!IS_PROD) return null
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return ws

  ws = new WebSocket(WS_URL)
  ws.onopen = () => clearTimeout(reconnectTimer)
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      const handlers = wsListeners.get(data.type) || []
      handlers.forEach(fn => fn(data))
    } catch {}
  }
  ws.onclose = () => { ws = null; reconnectTimer = setTimeout(getWs, 2000) }
  ws.onerror = () => ws?.close()
  return ws
}

// ─── Dev: Socket.io ───
let sio = null
async function getSio() {
  if (sio) return sio
  const { io } = await import('socket.io-client')
  sio = io('/', { transports: ['websocket', 'polling'] })
  return sio
}

// ─── Unified API ───
export function getSocket() {
  if (IS_PROD) {
    return {
      emit(type, data = {}) {
        const socket = getWs()
        const msg = JSON.stringify({ type, ...data })
        if (socket?.readyState === WebSocket.OPEN) {
          socket.send(msg)
        } else if (socket) {
          socket.addEventListener('open', () => socket.send(msg), { once: true })
        }
      },
      disconnect() {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
        ws?.close(); ws = null
      }
    }
  }
  // Dev mode: socket.io
  return {
    emit(type, data = {}) {
      getSio().then(s => s.emit(type, data))
    },
    disconnect() {
      sio?.disconnect(); sio = null
    }
  }
}

export function useSocket(event, callback) {
  const ref = useRef(callback)
  ref.current = callback

  useEffect(() => {
    if (IS_PROD) {
      getWs()
      const handler = (data) => ref.current(data)
      if (!wsListeners.has(event)) wsListeners.set(event, [])
      wsListeners.get(event).push(handler)
      return () => {
        const arr = wsListeners.get(event)
        if (arr) { const i = arr.indexOf(handler); if (i !== -1) arr.splice(i, 1) }
      }
    } else {
      let handler
      getSio().then(s => {
        handler = (...args) => ref.current(...args)
        s.on(event, handler)
      })
      return () => { getSio().then(s => { if (handler) s.off(event, handler) }) }
    }
  }, [event])
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  return res.json()
}
