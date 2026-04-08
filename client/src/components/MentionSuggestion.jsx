import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

const MentionList = forwardRef(({ items, command }, ref) => {
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
        const item = items[selectedIndex]
        if (item) command({ id: item.username, label: item.display_name })
        return true
      }
      return false
    },
  }))

  return (
    <div className="mention-menu">
      {items.map((item, i) => (
        <div
          key={item.id}
          className={`mention-item ${i === selectedIndex ? 'selected' : ''}`}
          onClick={() => command({ id: item.username, label: item.display_name })}
        >
          <div className="mention-avatar" style={{ background: item.color }}>
            {item.display_name[0]}
          </div>
          <span>{item.display_name}</span>
        </div>
      ))}
    </div>
  )
})

export function createMentionSuggestion(users) {
  return {
    items: ({ query }) => {
      return users.filter(u =>
        u.display_name.toLowerCase().includes(query.toLowerCase()) ||
        u.username.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    },
    render: () => {
      let component
      let popup

      return {
        onStart: (props) => {
          component = new ReactRenderer(MentionList, { props, editor: props.editor })
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
  }
}
