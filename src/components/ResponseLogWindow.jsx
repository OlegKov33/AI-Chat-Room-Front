function ResponseLogWindow({ responseLog }) {
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
      <strong>Response Log</strong>
      {responseLog.length === 0 ? (
        <p>No logged responses yet.</p>
      ) : (
        responseLog.map((entry) => (
          <article key={entry.id} className="log-entry">
            <p className="log-entry-title">Call #{entry.callNumber}</p>
            <pre className="json-block">{formatJson(entry.rawResponse)}</pre>
          </article>
        ))
      )}
    </section>
  )
}

export default ResponseLogWindow
