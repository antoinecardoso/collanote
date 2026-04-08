import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

let socket = null

export function getSocket() {
  if (!socket) socket = io('/', { transports: ['websocket', 'polling'] })
  return socket
}

export function useSocket(event, callback) {
  const ref = useRef(callback)
  ref.current = callback
  useEffect(() => {
    const s = getSocket()
    const handler = (...args) => ref.current(...args)
    s.on(event, handler)
    return () => s.off(event, handler)
  }, [event])
}
