function ChatInput({ value, isLoading, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="chat-form">
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Enter message"
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Waiting...' : 'Submit'}
      </button>
    </form>
  )
}

export default ChatInput
