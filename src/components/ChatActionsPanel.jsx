function ChatActionsPanel({ roomCode, isLoading, onInvite, onJoin, onLeave, onExportPlain, onExportEncrypted, onImport }) {
  return (
    <section className="panel chat-actions-panel">
      <details open>
        <summary>
          <strong>💬 Room & Chat</strong>
        </summary>

        <div className="action-group">
          <strong>Room Access</strong>
          <p className="room-code-text">{roomCode ? `Current passcode: ${roomCode}` : 'No active passcode.'}</p>
          <div className="controls-row">
            <button type="button" onClick={onInvite} disabled={isLoading}>
              Invite
            </button>
            <button type="button" onClick={onJoin} disabled={isLoading}>
              Join
            </button>
            {roomCode && (
              <button type="button" onClick={onLeave} disabled={isLoading}>
                Leave Room
              </button>
            )}
          </div>
        </div>

        <div className="action-group">
          <strong>Chat Log</strong>
          <div className="controls-row">
            <button type="button" onClick={onExportPlain} disabled={isLoading}>
              Export (Plain)
            </button>
            <button type="button" onClick={onExportEncrypted} disabled={isLoading}>
              Export (Encrypted)
            </button>
            <button type="button" onClick={onImport} disabled={isLoading}>
              Import
            </button>
          </div>
        </div>
      </details>
    </section>
  )
}

export default ChatActionsPanel
