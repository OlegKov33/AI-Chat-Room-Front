# AI Development Instructions for OlegKov33's AI Chat Room

## Core Principles

### 1. Keep Answers Brief and Informative
- **Avoid**: Long explanations, verbose outputs, unnecessary details
- **Do**: Concise solutions, direct answers, actionable insights
- **Example**: Instead of 500 words, provide 2-3 sentences with code

### 2. React Way - No God Objects
- **Avoid**: Large monolithic components, all logic in one file, massive prop drilling
- **Do**: Small, focused components, separation of concerns, hooks for state management
- **Guidelines**:
  - Component files should be < 200 lines
  - One responsibility per component
  - Custom hooks for shared logic
  - Use context/refs only when necessary

### 3. Code Style
- Prefer functional components with hooks
- Use descriptive names (e.g., `ChatMessages` not `Msgs`)
- Keep CSS separate from JSX when possible
- Comment on "why", not "what"

## Project Context - READ FIRST

See `README.md` for:
- Architecture overview
- Feature descriptions
- How the app synchronizes across users
- API communication patterns
- WebSocket message types

## Key Architectural Points

### State Management
- **App.jsx**: Top-level state container
- **Components**: Receive data via props, emit changes via callbacks
- **stateRef**: Keeps current state accessible in WebSocket callbacks (closures)
- **Sidebar**: TechnicalPanel + ChatActionsPanel (collapsible)

### WebSocket Messages
- `ROOM_STATE`: Broadcasts chat state (messages, settings, AI config)
- `ROOM_STATE_REQUEST`: New user requests history
- `ROOM_LOADING`: Syncs loading state to prevent simultaneous requests
- `RAW_TEXT`: Direct text messages (fallback)

### Component Structure
```
App.jsx
├── TechnicalPanel (⚙️ AI Settings)
├── ChatActionsPanel (💬 Room & Chat)
├── ChatMessages (displays messages)
├── ChatInput (form at bottom)
└── utilities (services, hooks, utils)
```

### When to Add Features
1. Keep state in `App.jsx` if it affects multiple areas
2. Keep state in component if local-only (e.g., collapsible details)
3. Broadcast via WebSocket if other users need it
4. Check `stateRef` is updated for closure issues

## Frontend Code Organization

```
src/
├── components/
│   ├── ChatInput.jsx           # Form with submit button
│   ├── ChatMessages.jsx        # Display chat bubbles
│   ├── ChatActionsPanel.jsx    # Room + export/import controls
│   ├── TechnicalPanel.jsx      # AI settings + JSON viewers
│   └── ... (small, focused components)
├── services/
│   ├── chatApi.js              # HTTP POST to /api/request/first
│   └── roomSocket.js           # WebSocket connection management
├── utils/
│   ├── messageValidation.js    # Sanitize & validate messages
│   ├── buildRequestMessages.js # Format messages for backend
│   ├── responseValidation.js   # Parse backend responses
│   ├── chatLogCrypto.js        # Encrypt/decrypt exports
│   └── ... (pure functions)
├── constants/
│   └── agents.js               # List of AI models
└── App.jsx                     # Main app container
```

## Before Making Changes

1. **Read the current code** in related files
2. **Check component sizes** - if > 150 lines, consider splitting
3. **Test with multiple users** - use different browsers
4. **Check WebSocket messages** - browser DevTools → Network → WS
5. **Verify stateRef is updated** - for closures in callbacks

## Common Pitfalls

❌ **Don't**: Create new state in App.jsx without considering WebSocket sync
❌ **Don't**: Pass 10+ props to a component (consider composition or context)
❌ **Don't**: Put all UI in one component
❌ **Don't**: Mix API logic with component logic

✅ **Do**: Create small, reusable components
✅ **Do**: Use custom hooks for shared logic
✅ **Do**: Keep utilities pure (no side effects)
✅ **Do**: Test synchronization across multiple users

## Questions?

Refer to:
- `README.md` - Project overview
- `src/App.jsx` - Main state flow
- `src/services/` - Backend communication
- `src/components/` - UI examples
