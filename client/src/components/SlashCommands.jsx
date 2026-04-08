import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { getSocket } from '../hooks/useSocket'

let lastEffectTime = 0
function triggerEffect(effect) {
  if (Date.now() - lastEffectTime < 3000) return
  lastEffectTime = Date.now()
  getSocket().emit('trigger-effect', { effect })
}

function getCommands(user) {
  return [
    { cat: 'Écrire', icon: '📌', name: 'Titre', desc: 'Ajouter un titre', aliases: ['titre','heading','h2'], action: e => e.chain().focus().toggleHeading({ level: 2 }).run() },
    { cat: 'Écrire', icon: '📎', name: 'Sous-titre', desc: 'Ajouter un sous-titre', aliases: ['sous-titre','subtitle','h3'], action: e => e.chain().focus().toggleHeading({ level: 3 }).run() },
    { cat: 'Écrire', icon: '☑️', name: 'Checklist', desc: 'Cases à cocher', aliases: ['todo','checklist','task'], action: e => e.chain().focus().toggleTaskList().run() },
    { cat: 'Écrire', icon: '•', name: 'Liste à puces', desc: 'Liste non ordonnée', aliases: ['liste','bullets'], action: e => e.chain().focus().toggleBulletList().run() },
    { cat: 'Écrire', icon: '</>', name: 'Bloc de code', desc: 'Code monospace', aliases: ['code'], action: e => e.chain().focus().toggleCodeBlock().run() },
    { cat: 'Écrire', icon: '💬', name: 'Citation', desc: 'Bloc de citation', aliases: ['citation','quote'], action: e => e.chain().focus().toggleBlockquote().run() },
    { cat: 'Écrire', icon: '─', name: 'Séparateur', desc: 'Ligne horizontale', aliases: ['separateur','hr'], action: e => e.chain().focus().setHorizontalRule().run() },
    { cat: 'Insérer', icon: '📅', name: 'Date du jour', desc: 'Insère la date', aliases: ['date'], action: e => { const d = new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' }); e.chain().focus().insertContent(d.charAt(0).toUpperCase() + d.slice(1)).run() } },
    { cat: 'Insérer', icon: '🕐', name: 'Heure actuelle', desc: "Insère l'heure", aliases: ['heure','time'], action: e => e.chain().focus().insertContent(new Date().toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })).run() },
    { cat: 'Insérer', icon: '✍️', name: 'Ma signature', desc: `— ${user.display_name}`, aliases: ['signature','sign'], action: e => e.chain().focus().insertContent(`— ${user.display_name}`).run() },
    { cat: 'Effets', icon: '🎉', name: 'Confetti', desc: 'Pluie de confettis', aliases: ['confetti'], action: () => triggerEffect('confetti') },
    { cat: 'Effets', icon: '💥', name: 'Exploser', desc: 'La note explose', aliases: ['explode','boom'], action: () => triggerEffect('explode') },
    { cat: 'Effets', icon: '🟢', name: 'Matrix', desc: 'Pilule rouge', aliases: ['matrix','neo'], action: () => triggerEffect('matrix') },
    { cat: 'Effets', icon: '🪩', name: 'Disco', desc: 'Dancefloor', aliases: ['disco','dance'], action: () => triggerEffect('disco') },
    { cat: 'Effets', icon: '🎆', name: 'Feu d\'artifice', desc: 'Explosions', aliases: ['fireworks','feu'], action: () => triggerEffect('fireworks') },
    { cat: 'Effets', icon: '🌧️', name: 'Pluie', desc: 'Mélancolie', aliases: ['rain','pluie'], action: () => triggerEffect('rain') },
    { cat: 'Effets', icon: '⚔️', name: 'Star Wars', desc: 'Texte crawl', aliases: ['starwars','star'], action: () => triggerEffect('starwars') },
    { cat: 'Effets', icon: '🕹️', name: 'Pac-Man', desc: 'Waka waka', aliases: ['pacman','pac'], action: () => triggerEffect('pacman') },
    { cat: 'Effets', icon: '🧱', name: 'Tetris', desc: 'Blocs qui tombent', aliases: ['tetris','blocks'], action: () => triggerEffect('tetris') },
    { cat: 'Effets', icon: '🚀', name: 'Rocket', desc: 'Décollage', aliases: ['rocket','launch'], action: () => triggerEffect('rocket') },
    { cat: 'Effets', icon: '🌀', name: 'Portal', desc: 'Vortex', aliases: ['portal','vortex'], action: () => triggerEffect('portal') },
  ]
}

const SlashMenu = forwardRef(({ items, command }, ref) => {
  const [sel, setSel] = useState(0)
  useEffect(() => setSel(0), [items])
  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') { setSel((sel + items.length - 1) % items.length); return true }
      if (event.key === 'ArrowDown') { setSel((sel + 1) % items.length); return true }
      if (event.key === 'Enter') { items[sel] && command(items[sel]); return true }
      return false
    },
  }))

  let lastCat = null
  return (
    <div className="slash-menu">
      {items.map((item, i) => {
        const showCat = item.cat !== lastCat
        lastCat = item.cat
        return (
          <div key={item.name}>
            {showCat && <div className="text-[11px] font-semibold text-txt-tertiary uppercase tracking-wider px-2.5 pt-2 pb-1">{item.cat}</div>}
            <div className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer ${i === sel ? 'bg-bg-tertiary' : 'hover:bg-bg-tertiary'}`} onClick={() => command(item)}>
              <span className="w-8 h-8 flex items-center justify-center bg-bg-tertiary rounded-md text-base shrink-0">{item.icon}</span>
              <div>
                <div className="text-[13px] font-medium text-txt-primary">{item.name}</div>
                <div className="text-[11px] text-txt-tertiary">{item.desc}</div>
              </div>
            </div>
          </div>
        )
      })}
      {!items.length && <div className="px-3 py-3 text-txt-tertiary text-[13px]">Aucune commande</div>}
    </div>
  )
})

export function createSlashExtension(user) {
  const cmds = getCommands(user)
  return Extension.create({
    name: 'slashCommands',
    addOptions() {
      return {
        suggestion: {
          char: '/',
          command: ({ editor, range, props }) => { editor.chain().focus().deleteRange(range).run(); props.action(editor) },
          items: ({ query }) => cmds.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.aliases.some(a => a.includes(query.toLowerCase()))),
          render: () => {
            let component, wrapper
            return {
              onStart(props) {
                component = new ReactRenderer(SlashMenu, { props, editor: props.editor })
                wrapper = document.createElement('div'); wrapper.style.cssText = 'position:fixed;z-index:9999;'
                wrapper.appendChild(component.element); document.body.appendChild(wrapper)
                if (props.clientRect) { const r = props.clientRect(); wrapper.style.left = r.left + 'px'; wrapper.style.top = r.bottom + 4 + 'px' }
              },
              onUpdate(props) { component?.updateProps(props); if (props.clientRect && wrapper) { const r = props.clientRect(); wrapper.style.left = r.left + 'px'; wrapper.style.top = r.bottom + 4 + 'px' } },
              onKeyDown(props) { if (props.event.key === 'Escape') { wrapper?.remove(); return true } return component?.ref?.onKeyDown(props) },
              onExit() { wrapper?.remove(); component?.destroy() },
            }
          },
        },
      }
    },
    addProseMirrorPlugins() { return [Suggestion({ editor: this.editor, ...this.options.suggestion })] },
  })
}
