import { ReactRenderer } from '@tiptap/react'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

const MentionList = forwardRef(({ items, command }, ref) => {
  const [sel, setSel] = useState(0)
  useEffect(() => setSel(0), [items])
  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') { setSel((sel + items.length - 1) % items.length); return true }
      if (event.key === 'ArrowDown') { setSel((sel + 1) % items.length); return true }
      if (event.key === 'Enter') { items[sel] && command({ id: items[sel].username, label: items[sel].display_name }); return true }
      return false
    },
  }))

  return (
    <div className="bg-bg-elevated border border-border rounded-xl shadow-2xl p-1.5" style={{ animation: 'slideUp 0.15s ease-out' }}>
      {items.map((u, i) => (
        <div key={u.id} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-sm ${i === sel ? 'bg-bg-tertiary' : 'hover:bg-bg-tertiary'}`}
          onClick={() => command({ id: u.username, label: u.display_name })}>
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[11px] font-bold" style={{ background: u.color }}>{u.display_name[0]}</div>
          <span className="text-txt-primary">{u.display_name}</span>
        </div>
      ))}
    </div>
  )
})

export function createMentionSuggestion(users) {
  return {
    items: ({ query }) => users.filter(u => u.display_name.toLowerCase().includes(query.toLowerCase()) || u.username.toLowerCase().includes(query.toLowerCase())).slice(0, 6),
    render: () => {
      let component, wrapper
      return {
        onStart(props) {
          component = new ReactRenderer(MentionList, { props, editor: props.editor })
          wrapper = document.createElement('div'); wrapper.style.cssText = 'position:fixed;z-index:9999;'
          wrapper.appendChild(component.element); document.body.appendChild(wrapper)
          if (props.clientRect) { const r = props.clientRect(); wrapper.style.left = r.left + 'px'; wrapper.style.top = r.bottom + 4 + 'px' }
        },
        onUpdate(props) { component?.updateProps(props); if (props.clientRect && wrapper) { const r = props.clientRect(); wrapper.style.left = r.left + 'px'; wrapper.style.top = r.bottom + 4 + 'px' } },
        onKeyDown(props) { if (props.event.key === 'Escape') { wrapper?.remove(); return true } return component?.ref?.onKeyDown(props) },
        onExit() { wrapper?.remove(); component?.destroy() },
      }
    },
  }
}
