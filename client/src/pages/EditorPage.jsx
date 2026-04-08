import { useState, useEffect, useRef, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Mention from '@tiptap/extension-mention'
import Header from '../components/Header'
import TypingIndicator from '../components/TypingIndicator'
import ReactionBar from '../components/ReactionBar'
import EffectOverlay from '../components/EffectOverlay'
import EffectToasts from '../components/EffectToasts'
import WelcomeScreen from '../components/WelcomeScreen'
import { createSlashExtension } from '../components/SlashCommands'
import { createMentionSuggestion } from '../components/MentionSuggestion'
import { getSocket, useSocket } from '../hooks/useSocket'
import useKonamiCode from '../hooks/useKonamiCode'

export default function EditorPage({ user, token, onLogout }) {
  const [showWelcome, setShowWelcome] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [activeUsers, setActiveUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [saved, setSaved] = useState(false)
  const saveTimer = useRef(null)
  const typingTimer = useRef(null)
  const isTyping = useRef(false)

  // Fetch users + note
  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(setAllUsers)
    const socket = getSocket()
    socket.emit('user-join', user)
    return () => socket.disconnect()
  }, [])

  // Konami code
  useKonamiCode(useCallback(() => {
    const socket = getSocket()
    const effects = ['confetti', 'shake', 'disco', 'matrix', 'fireworks']
    effects.forEach((e, i) => setTimeout(() => socket.emit('trigger-effect', { effect: e, isCombo: true }), i * 500))
  }, []))

  // Socket events
  useSocket('active-users', setActiveUsers)
  useSocket('user-joined', (u) => setActiveUsers(prev => [...prev.filter(p => p.id !== u.id), { ...u, isTyping: false }]))
  useSocket('user-left', (u) => setActiveUsers(prev => prev.filter(p => p.id !== u.id)))

  useSocket('user-typing', (data) => {
    if (data.userId === user.id) return
    setTypingUsers(prev => {
      if (prev.find(t => t.userId === data.userId)) return prev
      return [...prev, data]
    })
    setActiveUsers(prev => prev.map(u => u.id === data.userId ? { ...u, isTyping: true } : u))
  })

  useSocket('user-stop-typing', (data) => {
    setTypingUsers(prev => prev.filter(t => t.userId !== data.userId))
    setActiveUsers(prev => prev.map(u => u.id === data.userId ? { ...u, isTyping: false } : u))
  })

  useSocket('note-updated', (data) => {
    if (data.editedBy === user.id) return
    if (editor) {
      const pos = editor.state.selection.from
      editor.commands.setContent(data.content, false)
      try { editor.commands.setTextSelection(Math.min(pos, editor.state.doc.content.size - 1)) } catch {}
    }
  })

  function emitTyping() {
    const socket = getSocket()
    if (!isTyping.current) { isTyping.current = true; socket.emit('typing', { userId: user.id }) }
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => { isTyping.current = false; socket.emit('stop-typing', { userId: user.id }) }, 2000)
  }

  function saveNote(content) {
    clearTimeout(saveTimer.current)
    setSaved(false)
    saveTimer.current = setTimeout(() => {
      fetch('/api/note', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, userId: user.id }),
      }).then(() => { setSaved(true); setTimeout(() => setSaved(false), 2000) })
      getSocket().emit('note-update', { content, userId: user.id })
    }, 500)
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: 'Commence à écrire...' }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Mention.configure({
        HTMLAttributes: { class: 'mention' },
        suggestion: createMentionSuggestion(allUsers),
        renderHTML({ node }) {
          const u = allUsers.find(u => u.username === node.attrs.id)
          const color = u?.color || '#60A5FA'
          return ['span', { class: 'mention', style: `background:${color}25;color:${color}` }, `@${node.attrs.label || node.attrs.id}`]
        },
      }),
      createSlashExtension(user),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      emitTyping()
      saveNote(editor.getHTML())
    },
  }, [allUsers])

  // Load initial note content
  useEffect(() => {
    if (!editor) return
    fetch('/api/note').then(r => r.json()).then(note => {
      if (note?.content) editor.commands.setContent(note.content)
    })
  }, [editor])

  function handleWelcomeDone() {
    setShowWelcome(false)
    setTimeout(() => setShowEditor(true), 50)
  }

  return (
    <>
      {showWelcome && <WelcomeScreen user={user} onlineCount={activeUsers.length} onDone={handleWelcomeDone} />}
      <div className={`min-h-screen bg-bg-primary flex flex-col transition-opacity duration-500 ${showEditor ? 'opacity-100' : 'opacity-0'}`}>
        <Header activeUsers={activeUsers} saved={saved} onLogout={onLogout} />
        <TypingIndicator typingUsers={typingUsers} />
        <div className="flex-1 overflow-y-auto">
          <div className="editor-wrap max-w-[800px] mx-auto px-6 pt-6 pb-32">
            <EditorContent editor={editor} />
          </div>
        </div>
        <ReactionBar user={user} />
      </div>
      <EffectOverlay />
      <EffectToasts />
    </>
  )
}
