function SettingsPanel({
  numberOfRounds,
  showAgents,
  usedAI,
  systemMessage,
  isLoading,
  onRoundsChange,
  onShowAgentsChange,
  onToggleAgent,
  onSystemMessageChange,
}) {
  return (
    <section className="panel">
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
        Show AI agents
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
    </section>
  )
}

export default SettingsPanel
