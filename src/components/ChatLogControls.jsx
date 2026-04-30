function ChatLogControls({ isLoading, onExportPlain, onExportEncrypted, onImport }) {
  return (
    <section className="panel chat-log-controls">
      <strong>Chat Log</strong>
      <div className="controls-row">
        <button type="button" onClick={onExportPlain} disabled={isLoading}>
          Export JSON
        </button>
        <button type="button" onClick={onExportEncrypted} disabled={isLoading}>
          Export Encrypted JSON
        </button>
        <button type="button" onClick={onImport} disabled={isLoading}>
          Import Chat Log
        </button>
      </div>
    </section>
  )
}

export default ChatLogControls
