import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { getSocket } from '../hooks/useSocket'

// ─── Command definitions ───
function getCommands(user, onFlash) {
  return [
    // Écrire
    { category: 'Écrire', icon: '📌', name: 'Titre', desc: 'Ajouter un titre H2', aliases: ['titre', 'heading', 'h2'],
      action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { category: 'Écrire', icon: '📎', name: 'Sous-titre', desc: 'Ajouter un sous-titre H3', aliases: ['sous-titre', 'subtitle', 'h3'],
      action: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { category: 'Écrire', icon: '📝', name: 'Texte', desc: 'Paragraphe normal', aliases: ['texte', 'text', 'paragraph'],
      action: (editor) => editor.chain().focus().setParagraph().run() },
    { category: 'Écrire', icon: '☑️', name: 'Checklist', desc: 'Cases à cocher', aliases: ['todo', 'checklist', 'task'],
      action: (editor) => editor.chain().focus().toggleTaskList().run() },
    { category: 'Écrire', icon: '•', name: 'Liste à puces', desc: 'Liste non ordonnée', aliases: ['liste', 'bullets', 'ul'],
      action: (editor) => editor.chain().focus().toggleBulletList().run() },
    { category: 'Écrire', icon: '1.', name: 'Liste numérotée', desc: 'Liste ordonnée', aliases: ['numéros', 'numbers', 'ol'],
      action: (editor) => editor.chain().focus().toggleOrderedList().run() },
    { category: 'Écrire', icon: '</>', name: 'Bloc de code', desc: 'Code monospace', aliases: ['code', 'codeblock'],
      action: (editor) => editor.chain().focus().toggleCodeBlock().run() },
    { category: 'Écrire', icon: '─', name: 'Séparateur', desc: 'Ligne horizontale', aliases: ['separateur', 'divider', 'hr'],
      action: (editor) => editor.chain().focus().setHorizontalRule().run() },
    { category: 'Écrire', icon: '💬', name: 'Citation', desc: 'Bloc de citation', aliases: ['citation', 'quote', 'blockquote'],
      action: (editor) => editor.chain().focus().toggleBlockquote().run() },

    // Insérer
    { category: 'Insérer', icon: '📅', name: 'Date du jour', desc: 'Insère la date', aliases: ['date', 'today'],
      action: (editor) => {
        const d = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        editor.chain().focus().insertContent(d.charAt(0).toUpperCase() + d.slice(1)).run()
      }},
    { category: 'Insérer', icon: '🕐', name: 'Heure actuelle', desc: "Insère l'heure", aliases: ['heure', 'time', 'hour'],
      action: (editor) => {
        editor.chain().focus().insertContent(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })).run()
      }},
    { category: 'Insérer', icon: '✍️', name: 'Ma signature', desc: `Insère "— ${user.display_name}"`, aliases: ['signature', 'sign'],
      action: (editor) => {
        editor.chain().focus().insertContent(`— ${user.display_name}`).run()
      }},
    { category: 'Insérer', icon: '⚡', name: 'Rendre éphémère', desc: 'La note disparaît dans 24h', aliases: ['flash', 'ephemere', 'temporaire'],
      action: () => onFlash() },

    // Effets
    { category: 'Effets', icon: '🎉', name: 'Confetti', desc: 'Pluie de confettis', aliases: ['confetti', 'party'],
      action: () => triggerEffect('confetti') },
    { category: 'Effets', icon: '💥', name: 'Exploser', desc: 'La note explose et se recompose', aliases: ['explode', 'boom'],
      action: () => triggerEffect('explode') },
    { category: 'Effets', icon: '🫨', name: 'Tremblement', desc: "L'écran tremble", aliases: ['shake', 'tremble'],
      action: () => triggerEffect('shake') },
    { category: 'Effets', icon: '🟢', name: 'Mode Matrix', desc: 'Cascade de caractères verts', aliases: ['matrix', 'neo'],
      action: () => triggerEffect('matrix') },
    { category: 'Effets', icon: '🪩', name: 'Disco mode', desc: 'Couleurs pulsantes', aliases: ['disco', 'party', 'dance'],
      action: () => triggerEffect('disco') },
    { category: 'Effets', icon: '👻', name: 'Fantôme', desc: 'Le texte devient transparent', aliases: ['ghost', 'fantome'],
      action: () => triggerEffect('ghost') },
    { category: 'Effets', icon: '🎆', name: 'Feu d\'artifice', desc: 'Explosions de particules', aliases: ['fireworks', 'feu'],
      action: () => triggerEffect('fireworks') },
    { category: 'Effets', icon: '🔄', name: 'Retourner', desc: 'Flip 3D de la note', aliases: ['flip', 'retourner'],
      action: () => triggerEffect('flip') },
    { category: 'Effets', icon: '🌧️', name: 'Pluie', desc: 'Gouttes de pluie', aliases: ['rain', 'pluie'],
      action: () => triggerEffect('rain') },
    { category: 'Effets', icon: '👏', name: 'Applaudissements', desc: 'Emojis qui montent', aliases: ['applause', 'clap', 'bravo'],
      action: () => triggerEffect('applause') },
  ]
}

let lastEffectTime = 0
function triggerEffect(effect) {
  const now = Date.now()
  if (now - lastEffectTime < 3000) return // Rate limit 3s
  lastEffectTime = now
  getSocket().emit('trigger-effect', { effect })
}

// ─── Slash menu component ───
const SlashMenu = forwardRef(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => setSelectedIndex(0), [items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + items.length - 1) % items.length)
        return true
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % items.length)
        return true
      }
      if (event.key === 'Enter') {
        items[selectedIndex] && command(items[selectedIndex])
        return true
      }
      return false
    },
  }))

  // Group by category
  const categories = []
  let lastCat = null
  items.forEach((item, i) => {
    if (item.category !== lastCat) {
      categories.push({ type: 'header', label: item.category })
      lastCat = item.category
    }
    categories.push({ type: 'item', item, index: i })
  })

  return (
    <div className="slash-menu">
      {categories.map((entry, i) => {
        if (entry.type === 'header') {
          return <div key={`h-${i}`} className="slash-menu-category">{entry.label}</div>
        }
        const { item, index } = entry
        return (
          <div
            key={item.name}
            className={`slash-menu-item ${index === selectedIndex ? 'selected' : ''}`}
            onClick={() => command(item)}
          >
            <div className="slash-menu-icon">{item.icon}</div>
            <div className="slash-menu-text">
              <div className="slash-menu-name">{item.name}</div>
              <div className="slash-menu-desc">{item.desc}</div>
            </div>
          </div>
        )
      })}
      {items.length === 0 && (
        <div style={{ padding: '12px', color: 'var(--text-tertiary)', fontSize: 13 }}>
          Aucune commande trouvée
        </div>
      )}
    </div>
  )
})

// ─── Tiptap extension ───
export function createSlashExtension(user, onFlash) {
  const commands = getCommands(user, onFlash)

  return Extension.create({
    name: 'slashCommands',
    addOptions() {
      return {
        suggestion: {
          char: '/',
          command: ({ editor, range, props }) => {
            editor.chain().focus().deleteRange(range).run()
            props.action(editor)
          },
          items: ({ query }) => {
            return commands.filter(cmd =>
              cmd.name.toLowerCase().includes(query.toLowerCase()) ||
              cmd.aliases.some(a => a.includes(query.toLowerCase()))
            )
          },
          render: () => {
            let component
            let popup

            return {
              onStart: (props) => {
                component = new ReactRenderer(SlashMenu, { props, editor: props.editor })
                if (!props.clientRect) return
                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                })
              },
              onUpdate(props) {
                component?.updateProps(props)
                if (props.clientRect) popup?.[0]?.setProps({ getReferenceClientRect: props.clientRect })
              },
              onKeyDown(props) {
                if (props.event.key === 'Escape') { popup?.[0]?.hide(); return true }
                return component?.ref?.onKeyDown(props)
              },
              onExit() {
                popup?.[0]?.destroy()
                component?.destroy()
              },
            }
          },
        },
      }
    },
    addProseMirrorPlugins() {
      return [Suggestion({ editor: this.editor, ...this.options.suggestion })]
    },
  })
}
