import { useState, useEffect, useCallback, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Mention from '@tiptap/extension-mention'
import Reactions from './Reactions'
import { createSlashExtension } from './SlashCommands'
import { createMentionSuggestion } from './MentionSuggestion'
import { getSocket } from '../hooks/useSocket'

export default function NoteEditor({ note, user, allUsers }) {
  const [title, setTitle] = useState(note.title)
  const saveTimer = useRef(null)
  const noteIdRef = useRef(note.id)

  // Reset when note changes
  useEffect(() => {
    setTitle(note.title)
    noteIdRef.current = note.id
    if (editor && editor.getHTML() !== note.content) {
      editor.commands.setContent(note.content || '')
    }
  }, [note.id])

  const saveNote = useCallback((newTitle, newContent) => {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      fetch(`/api/notes/${noteIdRef.current}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle !== undefined ? newTitle : title,
          content: newContent !== undefined ? newContent : null,
        }),
      })
    }, 500)
  }, [title])

  function handleTitleChange(e) {
    setTitle(e.target.value)
    saveNote(e.target.value, undefined)
  }

  function handleFlashCommand() {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    fetch(`/api/notes/${noteIdRef.current}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expires_at: expires }),
    })
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({
        placeholder: 'Écris ici... tape / pour les commandes',
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Mention.configure({
        HTMLAttributes: { class: 'mention' },
        suggestion: createMentionSuggestion(allUsers),
        renderHTML({ node }) {
          const u = allUsers.find(u => u.username === node.attrs.id)
          const color = u?.color || '#60A5FA'
          return ['span', {
            class: 'mention',
            style: `background: ${color}25; color: ${color}`,
          }, `@${node.attrs.label || node.attrs.id}`]
        },
      }),
      createSlashExtension(user, handleFlashCommand),
    ],
    content: note.content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      saveNote(undefined, html)
      getSocket().emit('note-content-update', {
        noteId: noteIdRef.current,
        content: html,
        userId: user.id,
      })
    },
  }, [note.id, allUsers])

  // Listen for real-time updates from others
  useEffect(() => {
    const socket = getSocket()
    function handleUpdate(data) {
      if (data.noteId === noteIdRef.current && data.userId !== user.id && editor) {
        const pos = editor.state.selection.from
        editor.commands.setContent(data.content, false)
        try { editor.commands.setTextSelection(pos) } catch {}
      }
    }
    socket.on('note-content-update', handleUpdate)
    return () => socket.off('note-content-update', handleUpdate)
  }, [editor, user.id])

  return (
    <div className="editor-container">
      <input
        className="note-title-input"
        value={title}
        onChange={handleTitleChange}
        placeholder="Titre de la note..."
      />
      <EditorContent editor={editor} />
      <Reactions noteId={note.id} user={user} />
    </div>
  )
}
