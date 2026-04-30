import { useEffect, useRef, useState } from 'react'
import './App.css'
import ChatActionsPanel from './components/ChatActionsPanel'
import ChatInput from './components/ChatInput'
import ChatMessages from './components/ChatMessages'
import TechnicalPanel from './components/TechnicalPanel'
import { DEFAULT_AGENTS } from './constants/agents'
import { sendMessage } from './services/chatApi'
import { openRoomSocket, sendRoomSocketMessage } from './services/roomSocket'
import { buildRequestMessages } from './utils/buildRequestMessages'
import { decryptChatLog, encryptChatLog, isEncryptedChatLog } from './utils/chatLogCrypto'
import { buildPlainChatLog, downloadJsonFile, parseChatLogText } from './utils/chatLogStorage'
import { buildValidatedRequestPayload, sanitizeMessages } from './utils/messageValidation'
import { extractMessagesFromApiResponse } from './utils/responseValidation'
import { generateRoomPasscode } from './utils/roomStorage'

const API_URL = import.meta.env.VITE_API_URL ?? 'localhost:8080/api/request/first'
const INITIAL_SYSTEM_MESSAGE =
  'You are a concise AI problem-solver. Focus on the best actionable answer only. If another AI response is provided, briefly critique it and give a better refined answer. No lengthy explanations.'

function App() {
  const clientIdRef = useRef(crypto.randomUUID())
  const socketRef = useRef(null)
  const joinedRoomsRef = useRef(new Set())
  const stateRef = useRef({
    messages: [],
    systemMessage: INITIAL_SYSTEM_MESSAGE,
    numberOfRounds: 1,
    usedAI: DEFAULT_AGENTS,
  })
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState([])
  const [numberOfRounds, setNumberOfRounds] = useState(1)
  const [usedAI, setUsedAI] = useState(DEFAULT_AGENTS)
  const [systemMessage, setSystemMessage] = useState(INITIAL_SYSTEM_MESSAGE)
  const [showAgents, setShowAgents] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [socketConnected, setSocketConnected] = useState(false)
  const [lastRequestPayload, setLastRequestPayload] = useState(null)
  const [lastResponsePayload, setLastResponsePayload] = useState(null)
  const fileInputRef = useRef(null)

  // Keep stateRef in sync with actual state
  useEffect(() => {
    stateRef.current = {
      messages,
      systemMessage,
      numberOfRounds,
      usedAI,
    }
  }, [messages, systemMessage, numberOfRounds, usedAI])

  useEffect(() => {
    if (!roomCode) {
      if (socketRef.current) {
        console.log('Closing socket: no roomCode')
        socketRef.current.close()
        socketRef.current = null
      }
      joinedRoomsRef.current.clear()
      setSocketConnected(false)
      return
    }

    if (socketRef.current) {
      console.log('Closing previous socket before opening new one')
      socketRef.current.close()
      socketRef.current = null
    }

    // Remove this room from joined tracking so we rejoin
    joinedRoomsRef.current.delete(roomCode)

    const nextSocket = openRoomSocket({
      baseHttpUrl: API_URL,
      roomCode,
      onOpen: () => {
        console.log('Socket opened for room:', roomCode)
        setSocketConnected(true)

        if (!joinedRoomsRef.current.has(roomCode)) {
          console.log('Joining room:', roomCode)
          joinedRoomsRef.current.add(roomCode)
          
          // Request history from existing users in the room
          sendRoomSocketMessage(nextSocket, {
            type: 'ROOM_STATE_REQUEST',
            roomCode,
            senderId: clientIdRef.current,
          })
          
          // Also broadcast current state (for inviter or if importing)
          if (messages.length > 0) {
            sendRoomSocketMessage(nextSocket, {
              type: 'ROOM_STATE',
              roomCode,
              senderId: clientIdRef.current,
              payload: {
                messages,
                systemMessage,
                numberOfRounds,
                usedAI,
              },
            })
          }
        }
      },
      onClose: () => {
        console.log('Socket closed for room:', roomCode)
        if (socketRef.current === nextSocket) {
          socketRef.current = null
        }
        setSocketConnected(false)
      },
      onError: (error) => {
        console.log('Socket error for room:', roomCode, error)
        setSocketConnected(false)
      },
      onMessage: (eventPayload) => {
        if (!eventPayload || eventPayload.senderId === clientIdRef.current) return

        if (eventPayload.type === 'ROOM_LOADING' && eventPayload.roomCode === roomCode) {
          // Sync loading state across users
          const payload = eventPayload.payload ?? {}
          setIsLoading(Boolean(payload.isLoading))
          return
        }

        if (eventPayload.type === 'RAW_TEXT') {
          const rawText = String(eventPayload?.payload?.text ?? '').trim()
          if (rawText) {
            setMessages((prev) => [...prev, { role: 'user', content: rawText }])
          }
          return
        }

        if (eventPayload.type === 'ROOM_STATE_REQUEST' && eventPayload.roomCode === roomCode) {
          // Someone joined and requested state, broadcast current state from ref
          console.log('Received ROOM_STATE_REQUEST, broadcasting current state:', stateRef.current.messages.length, 'messages')
          sendRoomSocketMessage(socketRef.current, {
            type: 'ROOM_STATE',
            roomCode,
            senderId: clientIdRef.current,
            payload: stateRef.current,
          })
          return
        }

        if (eventPayload.type === 'ROOM_STATE' && eventPayload.roomCode === roomCode) {
          const payload = eventPayload.payload ?? {}
          const safeMessages = sanitizeMessages(payload.messages)
          setMessages(safeMessages)
          setSystemMessage(typeof payload.systemMessage === 'string' ? payload.systemMessage : '')
          setNumberOfRounds(
            Number.isInteger(payload.numberOfRounds)
              ? Math.max(1, Math.min(127, payload.numberOfRounds))
              : 1,
          )
          setUsedAI({
            ...DEFAULT_AGENTS,
            ...(payload.usedAI ?? {}),
          })
          if (safeMessages.length > 0) {
            setStatusText(`Loaded ${safeMessages.length} previous messages.`)
          }
        }
      },
    })

    socketRef.current = nextSocket

    return () => {
      console.log('Cleanup: closing socket for room:', roomCode)
      nextSocket.close()
      if (socketRef.current === nextSocket) {
        socketRef.current = null
      }
      setSocketConnected(false)
    }
  }, [roomCode])

  const broadcastRoomState = (targetRoomCode, state) => {
    if (!targetRoomCode) return
    sendRoomSocketMessage(socketRef.current, {
      type: 'ROOM_STATE',
      roomCode: targetRoomCode,
      senderId: clientIdRef.current,
      payload: state,
    })
  }

  const handleLeaveRoom = () => {
    console.log('Leaving room:', roomCode)
    if (roomCode) {
      joinedRoomsRef.current.delete(roomCode)
    }
    setRoomCode('')
    setMessages([])
    setStatusText('Left room.')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isLoading) return

    const trimmedValue = inputValue.trim()
    if (!trimmedValue) return

    try {
      setIsLoading(true)
      setStatusText('')
      
      // Broadcast that someone is requesting (disable others)
      sendRoomSocketMessage(socketRef.current, {
        type: 'ROOM_LOADING',
        roomCode,
        senderId: clientIdRef.current,
        payload: { isLoading: true },
      })
      
      const requestMessages = buildRequestMessages({
        messages,
        currentUserMessage: trimmedValue,
        systemMessage,
        fallbackSystem: '',
      })
      const requestPayload = buildValidatedRequestPayload({
        messages: requestMessages,
        numberOfRounds,
        usedAI,
      })
      setLastRequestPayload(requestPayload)
      
      const selectedModelNames = Object.keys(requestPayload.usedAI)
      const existingAssistantContents = new Set(
        messages.filter((message) => message.role === 'assistant').map((message) => message.content),
      )
      const nextMessagesAfterUser = [...messages, { role: 'user', content: trimmedValue }]

      setMessages((prev) => [...prev, { role: 'user', content: trimmedValue }])
      setInputValue('')

      broadcastRoomState(roomCode, {
        messages: nextMessagesAfterUser,
        systemMessage,
        numberOfRounds,
        usedAI,
      })

      const rawApiResponse = await sendMessage({
        apiUrl: API_URL,
        payload: requestPayload,
      })
      setLastResponsePayload(rawApiResponse)
      
      const safeIncomingMessages = extractMessagesFromApiResponse(rawApiResponse, selectedModelNames)
      const newAssistantMessages = safeIncomingMessages.filter(
        (message) => !existingAssistantContents.has(message.content),
      )

      setMessages((prev) => [...prev, ...newAssistantMessages])
      broadcastRoomState(roomCode, {
        messages: [...nextMessagesAfterUser, ...newAssistantMessages],
        systemMessage,
        numberOfRounds,
        usedAI,
      })
      setStatusText('Response received.')
      
      // Broadcast that loading is done
      sendRoomSocketMessage(socketRef.current, {
        type: 'ROOM_LOADING',
        roomCode,
        senderId: clientIdRef.current,
        payload: { isLoading: false },
      })
    } catch (error) {
      setStatusText(`Error: ${error.message}`)
      // Clear loading on error too
      sendRoomSocketMessage(socketRef.current, {
        type: 'ROOM_LOADING',
        roomCode,
        senderId: clientIdRef.current,
        payload: { isLoading: false },
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoundsChange = (value) => {
    const parsed = Number(value)
    if (Number.isNaN(parsed)) return
    const clamped = Math.max(1, Math.min(127, parsed))
    setNumberOfRounds(clamped)
  }

  const handleToggleAgent = (agentName) => {
    setUsedAI((prev) => ({
      ...prev,
      [agentName]: !prev[agentName],
    }))
  }

  const handleExportPlain = () => {
    const payload = buildPlainChatLog(messages)
    downloadJsonFile('chatlog.json', payload)
    setStatusText('Plain chat log exported.')
  }

  const handleExportEncrypted = async () => {
    const password = window.prompt('Enter encryption password')
    if (!password) return

    try {
      const payload = await encryptChatLog(messages, password)
      downloadJsonFile('chatlog.encrypted.json', payload)
      setStatusText('Encrypted chat log exported.')
    } catch {
      setStatusText('Error: failed to encrypt chat log.')
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportFile = async (event) => {
    const selectedFile = event.target.files?.[0]
    event.target.value = ''
    if (!selectedFile) return

    try {
      const fileText = await selectedFile.text()
      const parsed = parseChatLogText(fileText)
      let importedMessages = []

      if (isEncryptedChatLog(parsed)) {
        const password = window.prompt('Enter password to decrypt this chat log')
        if (!password) return
        importedMessages = await decryptChatLog(parsed, password)
      } else {
        importedMessages = parsed?.messages
      }

      const safeMessages = sanitizeMessages(importedMessages)
      setMessages(safeMessages)
      
      // Broadcast with the actual imported messages (not stale state)
      sendRoomSocketMessage(socketRef.current, {
        type: 'ROOM_STATE',
        roomCode,
        senderId: clientIdRef.current,
        payload: {
          messages: safeMessages,
          systemMessage,
          numberOfRounds,
          usedAI,
        },
      })
      setStatusText(`Imported ${safeMessages.length} messages.`)
    } catch {
      setStatusText('Error: failed to import chat log.')
    }
  }

  const handleInvite = async () => {
    const nextCode = roomCode || generateRoomPasscode()
    setRoomCode(nextCode)
    // Socket connection will auto-broadcast state via useEffect onOpen

    try {
      await navigator.clipboard.writeText(nextCode)
      setStatusText(`Invite code: ${nextCode} (copied to clipboard).`)
    } catch {
      setStatusText(`Invite code: ${nextCode}`)
    }
  }

  const handleJoin = () => {
    const inputCode = window.prompt('Enter room passcode')
    if (!inputCode) return

    const normalizedCode = inputCode.trim().toUpperCase()
    
    // Clear tracking to force reconnect to new room
    if (roomCode !== normalizedCode) {
      joinedRoomsRef.current.delete(roomCode)
    }

    // Clear messages and wait for backend to send history
    setRoomCode(normalizedCode)
    setMessages([])
  }

  return (
    <main className="app">
      <h1>Messages</h1>

      <div className="chat-window-area">
        {roomCode ? <p>{socketConnected ? 'Room socket connected.' : 'Room socket disconnected.'}</p> : null}
        <ChatMessages messages={messages} />
      </div>

      <aside className="sidebar">
        <TechnicalPanel
          numberOfRounds={numberOfRounds}
          showAgents={showAgents}
          usedAI={usedAI}
          systemMessage={systemMessage}
          isLoading={isLoading}
          lastRequestPayload={lastRequestPayload}
          lastResponsePayload={lastResponsePayload}
          onRoundsChange={handleRoundsChange}
          onShowAgentsChange={setShowAgents}
          onToggleAgent={handleToggleAgent}
          onSystemMessageChange={setSystemMessage}
        />

        <ChatActionsPanel
          roomCode={roomCode}
          isLoading={isLoading}
          onInvite={handleInvite}
          onJoin={handleJoin}
          onLeave={handleLeaveRoom}
          onExportPlain={handleExportPlain}
          onExportEncrypted={handleExportEncrypted}
          onImport={handleImportClick}
        />
      </aside>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleImportFile}
        hidden
      />
      
      {isLoading && <p className="awaiting-text">Awaiting response...</p>}
      {!isLoading && statusText ? <p>{statusText}</p> : null}

      <ChatInput
        value={inputValue}
        isLoading={isLoading}
        onChange={setInputValue}
        onSubmit={handleSubmit}
      />
    </main>
  )
}

export default App
