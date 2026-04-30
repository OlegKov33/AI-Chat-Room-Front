function MessageList({ requestLog, isLoading, statusText }) {
  const formatJson = (value) => {
    if (value === undefined) return 'undefined'
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return String(value)
    }
  }

  return (
    <section className="panel">
      <strong>Request Window</strong>
      {requestLog.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        <div className="chat-window">
          {requestLog.map((entry) => (
            <article key={entry.id} className="chat-bubble chat-bubble-user">
              <p className="chat-bubble-label">{`Request #${entry.callNumber}`}</p>
              <pre className="json-block chat-json-block">{formatJson(entry.payload)}</pre>
            </article>
          ))}
        </div>
      )}
      {isLoading && <p className="awaiting-text">Awaiting response...</p>}
      {!isLoading && statusText ? <p>{statusText}</p> : null}
    </section>
  )
}

export default MessageList
