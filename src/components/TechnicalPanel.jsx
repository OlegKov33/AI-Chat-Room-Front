import { useState } from 'react'

function TechnicalPanel({
  numberOfRounds,
  showAgents,
  usedAI,
  systemMessage,
  isLoading,
  lastRequestPayload,
  lastResponsePayload,
  onRoundsChange,
  onShowAgentsChange,
  onToggleAgent,
  onSystemMessageChange,
}) {
  const [showRequestJson, setShowRequestJson] = useState(false)
  const [showResponseJson, setShowResponseJson] = useState(false)

  const formatJson = (value) => {
    if (value === undefined) return 'undefined'
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return String(value)
    }
  }

  return (
    <section className="panel technical-panel">
      <details>
        <summary>
          <strong>⚙️ AI Settings</strong>
        </summary>

        <label className="label" htmlFor="rounds-input">
          Number of rounds (1-127)
        </label>
        <input
          id="rounds-input"
          type="number"
          min="1"
          max="127"
          value={numberOfRounds}
          onChange={(event) => onRoundsChange(event.target.value)}
          disabled={isLoading}
        />

        <label className="label" htmlFor="system-message-input">
          System message
        </label>
        <textarea
          id="system-message-input"
          value={systemMessage}
          onChange={(event) => onSystemMessageChange(event.target.value)}
          disabled={isLoading}
          rows={4}
        />

        <label className="inline-label">
          <input
            type="checkbox"
            checked={showAgents}
            onChange={(event) => onShowAgentsChange(event.target.checked)}
            disabled={isLoading}
          />
          Select AI models
        </label>

        {showAgents ? (
          <div className="agents-list">
            {Object.entries(usedAI).map(([agentName, isSelected]) => (
              <label key={agentName} className="inline-label">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleAgent(agentName)}
                  disabled={isLoading}
                />
                {agentName}
              </label>
            ))}
          </div>
        ) : null}

        <div className="json-viewers">
          <details>
            <summary>View outgoing request</summary>
            {lastRequestPayload ? (
              <pre className="json-block">{formatJson(lastRequestPayload)}</pre>
            ) : (
              <p>No request sent yet.</p>
            )}
          </details>

          <details>
            <summary>View incoming response</summary>
            {lastResponsePayload ? (
              <pre className="json-block">{formatJson(lastResponsePayload)}</pre>
            ) : (
              <p>No response received yet.</p>
            )}
          </details>
        </div>
      </details>
    </section>
  )
}

export default TechnicalPanel
