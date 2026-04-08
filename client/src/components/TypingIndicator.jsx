export default function TypingIndicator({ typingUsers }) {
  if (!typingUsers.length) return <div className="h-6" />

  const names = typingUsers.map(u => u.displayName)
  const text = names.length === 1
    ? `${names[0]} est en train d'écrire`
    : `${names.join(' et ')} sont en train d'écrire`

  const color = typingUsers[0].color

  return (
    <div className="h-6 flex items-center justify-center text-[13px]" style={{ color }}>
      {text}
      <span className="inline-flex ml-0.5 gap-0.5">
        {[0, 1, 2].map(i => (
          <span key={i} className="inline-block w-1 h-1 rounded-full bg-current" style={{ animation: `typingDots 1.4s infinite ${i * 0.2}s` }} />
        ))}
      </span>
    </div>
  )
}
