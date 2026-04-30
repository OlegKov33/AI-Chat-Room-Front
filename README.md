# OlegKov33's AI Chat Room

A real-time, multi-user collaborative AI chat application built with React + Vite and WebSocket synchronization.

## 🎯 Features

### Chat with Multiple AI Agents

Select and toggle multiple AI models simultaneously in the **AI Settings** panel:
- Click **"Select AI models"** checkbox to reveal agent toggles
- Each enabled model processes your message independently
- Responses are merged into the conversation thread
- Models configured in `src/constants/agents.js` (currently: Llama, Qwen)

**Where to add/remove models:**
```javascript
// src/constants/agents.js
export const DEFAULT_AGENTS = {
  'llama': true,      // Add/remove models here
  'qwen': true,
  'new-model': false, // New models default to disabled
}
```

### Room Selection & Multi-User Sync

**Create a room:**
- Click **"Invite"** button → generates unique passcode
- Passcode auto-copied to clipboard
- Share with others to collaborate

**Join existing room:**
- Click **"Join"** button → enter passcode
- Automatically receives chat history from inviter
- Real-time message sync via WebSocket

**Leave room:**
- Click **"Leave Room"** → disconnects and clears chat

**Key behavior:**
- When one user sends a message, all users are disabled until response arrives
- Prevents simultaneous requests that could confuse the models
- All users see the same chat history and AI responses

### Export & Import Chat Logs

**Export options** (in Room & Chat panel):
1. **Export (Plain)** - Standard JSON format
   - Portable, readable, shareable
   - File: `chatlog.json`

2. **Export (Encrypted)** - Password-protected JSON
   - Secure sharing, password-required to decrypt
   - File: `chatlog.encrypted.json`

**Import:**
- Click **"Import"** → select JSON file
- If encrypted, prompted for password
- Loaded into current chat
- Broadcasts to all room members

### Understanding "Number of Rounds"

**Number of rounds** controls how many times a selected AI agent(s) will be called:
- **1 round**: Only 1 API call will be performed. JSON -> backend -> model -> API -> response -> front
- **2 rounds**: Only 2 API calls will be performed. JSON -> backend -> (model -> API -> response) x2 -> front
- **Higher = Less clutter** when displaying JSON

**Example:**
```
Round 1: User asks "What is Python?"
Round 2: User asks "How do I install it?"
  → Round value of 2 sends both Q&A to the model for context

Round value of 1 would send only: "How do I install it?"
```

Use higher rounds for complex discussions, lower for standalone questions.

### System Message (Model Instructions)

The **System message** is an instruction prompt sent to all models to control their behavior:

**Default:**
```
You are a concise AI problem-solver. Focus on the best actionable 
answer only. If another AI response is provided, briefly critique it 
and give a better refined answer.
```

**Customize in AI Settings:**
- Edit the textarea to change model behavior
- Example instructions:
  - "Answer like you're explaining to a 10-year-old"
  - "Provide only code, no explanations"
  - "Be sarcastic in your responses"

Models use this system message alongside the conversation context.

### JSON Viewers (Development)

**View outgoing request** (collapsed by default):
- See exactly what your message is formatted as before sending
- Includes: messages array, system message, selected models, rounds
- Useful for debugging message format issues

**View incoming response:**
- See raw backend response for each model
- Check if a model responded or errored
- Inspect response structure

These are primarily for developers debugging the frontend-backend integration.

## 🏗️ Architecture

### Frontend Stack
- **React 19** with hooks
- **Vite** for fast development
- **WebSocket** for real-time room sync
- **CSS Grid** for responsive sidebar layout

### Key Files

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main state container, WebSocket management |
| `src/components/ChatMessages.jsx` | Display messages as bubbles |
| `src/components/ChatInput.jsx` | Form for message submission |
| `src/components/TechnicalPanel.jsx` | AI settings & JSON viewers |
| `src/components/ChatActionsPanel.jsx` | Room controls & export/import |
| `src/services/roomSocket.js` | WebSocket wrapper |
| `src/services/chatApi.js` | HTTP POST to backend |
| `src/constants/agents.js` | Available AI models |

### WebSocket Message Types

| Type | Sent by | Purpose |
|------|---------|---------|
| `ROOM_STATE` | Anyone | Broadcasts chat state to all users |
| `ROOM_STATE_REQUEST` | New joiner | Requests chat history |
| `ROOM_LOADING` | User sending message | Disables all users until response |
| `RAW_TEXT` | Backend (fallback) | Plain text messages |

### State Flow

```
User types message
    ↓
handleSubmit() broadcasts ROOM_LOADING: true
    ↓
All users receive → button disabled "Waiting..."
    ↓
HTTP POST to backend with message
    ↓
Backend processes with selected models
    ↓
Backend responds with AI answers
    ↓
Frontend broadcasts ROOM_STATE with new messages
    ↓
All users receive → chat updated, broadcasts ROOM_LOADING: false
    ↓
All users → button enabled
```

## 📱 Responsive Design

- **Desktop**: Sidebar on right (280px fixed)
- **Tablet/Mobile** (<900px): Sidebar stacks below chat
- Chat messages scroll above fixed input box
- Collapsible panels save screen space on mobile

## 🚀 Development

### Setup
```bash
npm install
npm run dev     # Start dev server (port 5173)
npm run build   # Production build
npm run lint    # ESLint check
```

### Backend Connection
- **Default URL**: `localhost:8080/api/request/first`
- **Override**: Set `VITE_API_URL` environment variable
- **Room WebSocket**: `ws://localhost:8080/chat/{roomCode}`

### Adding New Features

Follow `AI_INSTRUCTIONS.md` for:
- Component best practices
- State management patterns
- WebSocket synchronization
- Avoiding god objects

## 📝 Notes

- **No persistence**: Rooms exist only during connection (backend in-memory)
- **Cross-browser**: Use same IP address for multi-device access
- **Encryption**: Uses Web Crypto API (AES-GCM + PBKDF2)
- **Message format**: Frontend normalizes backend AI responses to standard format

