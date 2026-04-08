import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('collanote-user')
    return saved ? JSON.parse(saved) : null
  })

  function handleLogin(userData) {
    localStorage.setItem('collanote-user', JSON.stringify(userData))
    setUser(userData)
  }

  function handleLogout() {
    localStorage.removeItem('collanote-user')
    setUser(null)
  }

  if (!user) return <Login onLogin={handleLogin} />
  return <Dashboard user={user} onLogout={handleLogout} />
}
