function normalizeHttpUrl(inputUrl) {
  const trimmed = String(inputUrl || '').trim()
  if (!trimmed) return 'http://localhost:8080'
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `http://${trimmed}`
}

function buildWebSocketUrl(baseHttpUrl, roomCode) {
  const normalized = normalizeHttpUrl(baseHttpUrl)
  const httpUrl = new URL(normalized)
  const wsProtocol = httpUrl.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${wsProtocol}//${httpUrl.host}/chat/${encodeURIComponent(roomCode)}`
}

export function openRoomSocket({ baseHttpUrl, roomCode, onMessage, onOpen, onClose, onError }) {
  const wsUrl = buildWebSocketUrl(baseHttpUrl, roomCode)
  console.log('Opening WebSocket:', wsUrl)
  
  const socket = new WebSocket(wsUrl)

  socket.addEventListener('open', () => {
    console.log('WebSocket opened for room:', roomCode)
    onOpen?.()
  })

  socket.addEventListener('close', (event) => {
    console.log('WebSocket closed for room:', roomCode, 'Code:', event.code, 'Reason:', event.reason)
    onClose?.()
  })

  socket.addEventListener('error', (event) => {
    console.log('WebSocket error for room:', roomCode, event)
    onError?.(event)
  })

  socket.addEventListener('message', (event) => {
    try {
      const parsed = JSON.parse(event.data)
      console.log('WebSocket message received for room:', roomCode, parsed.type)
      onMessage?.(parsed)
    } catch {
      console.log('WebSocket raw text received for room:', roomCode)
      onMessage?.({
        type: 'RAW_TEXT',
        payload: { text: String(event.data ?? '') },
      })
    }
  })

  return socket
}

export function sendRoomSocketMessage(socket, payload) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn('Cannot send message: socket not open. State:', socket?.readyState)
    return false
  }
  console.log('Sending WebSocket message:', payload.type)
  socket.send(JSON.stringify(payload))
  return true
}
