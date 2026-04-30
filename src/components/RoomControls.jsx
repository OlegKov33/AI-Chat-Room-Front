function RoomControls({ roomCode, isLoading, onInvite, onJoin, onLeave }) {
  return (
    <section className="panel room-controls">
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
    </section>
  )
}

export default RoomControls
