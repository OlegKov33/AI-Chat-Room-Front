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
              return (
                <article key={`assistant-${index}`} className={getBubbleClassName(message.role)}>
                  <p className="chat-bubble-label">{parsed.modelLabel}</p>
                  <p className="chat-bubble-content">{parsed.responseText}</p>
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
