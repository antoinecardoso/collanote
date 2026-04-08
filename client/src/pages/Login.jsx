import { useState } from 'react'

const USERS = [
  { id: 1, username: 'antoine', display_name: 'Antoine', color: '#60A5FA' },
  { id: 2, username: 'efraim',  display_name: 'Efraim',  color: '#F87171' },
  { id: 3, username: 'ana',     display_name: 'Ana',     color: '#34D399' },
  { id: 4, username: 'marie',   display_name: 'Marie',   color: '#FBBF24' },
  { id: 5, username: 'lucas',   display_name: 'Lucas',   color: '#A78BFA' },
  { id: 6, username: 'sarah',   display_name: 'Sarah',   color: '#F472B6' },
]

export default function Login({ onLogin }) {
  const [loaded, setLoaded] = useState(false)
  useState(() => { setTimeout(() => setLoaded(true), 50) })

  function pick(user) {
    onLogin({ token: null, user })
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className={`w-full max-w-md px-6 transition-all duration-500 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h1 className="text-5xl font-semibold text-white text-center mb-4">Notes</h1>
        <p className="text-txt-tertiary text-center mb-10">Qui es-tu ?</p>
        <div className="grid grid-cols-3 gap-3">
          {USERS.map(user => (
            <button
              key={user.id}
              onClick={() => pick(user)}
              className="flex flex-col items-center gap-2 py-5 px-3 bg-bg-secondary border-2 border-transparent rounded-xl hover:border-current transition-all duration-200 hover:-translate-y-0.5 group"
              style={{ color: user.color }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold transition-shadow duration-200"
                style={{ background: user.color, boxShadow: `0 0 0px ${user.color}00` }}
                onMouseEnter={e => e.target.style.boxShadow = `0 0 20px ${user.color}4D`}
                onMouseLeave={e => e.target.style.boxShadow = `0 0 0px ${user.color}00`}
              >
                {user.display_name[0]}
              </div>
              <span className="text-txt-primary text-sm font-medium">{user.display_name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
