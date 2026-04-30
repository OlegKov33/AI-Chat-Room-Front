function parseAssistantMessage(content) {
  const match = content.match(/^([a-z0-9._/-]+):\s*([\s\S]*)$/i)
  if (!match) {
    return { modelLabel: 'assistant', responseText: content }
  }

  return {
    modelLabel: match[1],
    responseText: match[2].trim(),
  }
}

function parseMarkdownContent(text) {
  // Split by code block markers: ```language ... ```
  const parts = []
  const regex = /```([a-z0-9]*)\n?([\s\S]*?)```/gi

  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }

    // Add code block
    const language = match[1] || 'plaintext'
    const code = match[2].trimEnd()
    parts.push({ type: 'code', language, content: code })

    lastIndex = regex.lastIndex
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) })
  }

  return parts.length > 0 ? parts : [{ type: 'text', content: text }]
}

function renderMarkdownContent(parts) {
  return parts.map((part, index) => {
    if (part.type === 'code') {
      return (
        <div key={index} className="code-block">
          <div className="code-block-language">{part.language}</div>
          <pre className="code-block-content">
            <code>{part.content}</code>
          </pre>
        </div>
      )
    }

    return (
      <span key={index} className="text-content">
        {part.content}
      </span>
    )
  })
}

function getBubbleClassName(role) {
  if (role === 'assistant') return 'chat-message chat-message-assistant'
  return 'chat-message chat-message-user'
}

function ChatMessages({ messages }) {
  const visibleMessages = messages.filter((message) => message.role !== 'system')

  return (
    <section className="panel">
      <strong>Chat</strong>
      {visibleMessages.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        <div className="chat-window">
          {visibleMessages.map((message, index) => {
            if (message.role === 'assistant') {
              const parsed = parseAssistantMessage(message.content)
              const contentParts = parseMarkdownContent(parsed.responseText)
              return (
                <article key={`assistant-${index}`} className={getBubbleClassName(message.role)}>
                  <p className="chat-bubble-label">{parsed.modelLabel}</p>
                  <div className="chat-bubble-content">{renderMarkdownContent(contentParts)}</div>
                </article>
              )
            }

            return (
              <article key={`user-${index}`} className={getBubbleClassName(message.role)}>
                <p className="chat-bubble-label">You</p>
                <p className="chat-bubble-content">{message.content}</p>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default ChatMessages
