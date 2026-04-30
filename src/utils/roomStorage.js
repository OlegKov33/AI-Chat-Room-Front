// Room passcodes are backend-agnostic (cross-browser via WebSocket connection)
// Backend stores room state in memory per connection
// Frontend connects via roomCode in WebSocket URI path

export function generateRoomPasscode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let value = ''
  for (let i = 0; i < 8; i += 1) {
    value += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return value
}

export function saveRoomState() {
  // No local storage needed - backend maintains room state
}

export function loadRoomState() {
  // No local storage needed - backend provides state via WebSocket ROOM_HISTORY_RESPONSE
  return null
}
