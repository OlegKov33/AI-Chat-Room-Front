function LatestResponseWindow({ response, isLoading, statusText }) {
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
      <strong>Latest Backend Response</strong>
      {response === null ? (
        <p>{isLoading ? 'Waiting for backend response...' : 'No response yet.'}</p>
      ) : (
        <pre className="json-block">{formatJson(response)}</pre>
      )}
      {!isLoading && statusText ? <p>{statusText}</p> : null}
    </section>
  )
}

export default LatestResponseWindow
