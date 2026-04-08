import { useState } from 'react'
import Login from './pages/Login'
import EditorPage from './pages/EditorPage'

export default function App() {
  const [auth, setAuth] = useState(() => {
    const s = localStorage.getItem('collanote-auth')
    return s ? JSON.parse(s) : null
  })

  function handleLogin(data) {
    localStorage.setItem('collanote-auth', JSON.stringify(data))
    setAuth(data)
  }

  function handleLogout() {
    localStorage.removeItem('collanote-auth')
    setAuth(null)
  }

  if (!auth) return <Login onLogin={handleLogin} />
  return <EditorPage user={auth.user} onLogout={handleLogout} />
}
