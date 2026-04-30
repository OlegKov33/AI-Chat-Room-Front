import { sanitizeMessages } from './messageValidation'

function formatAssistantContent(message) {
  if (!message?.content?.trim()) return ''
  if (message.model && !message.content.startsWith(`${message.model} `)) {
    return `${message.model} ${message.content}`
  }
  return message.content
}

function getLatestUserIndex(messages) {
  return [...messages].map((message) => message.role).lastIndexOf('user')
}

function getLatestUserMessage(messages) {
  const latestUserIndex = getLatestUserIndex(messages)
  if (latestUserIndex < 0) return null
  return messages[latestUserIndex]
}

function getAssistantMessagesAfterIndex(messages, index) {
  return messages
    .slice(index + 1)
    .filter((message) => message.role === 'assistant')
    .map((message) => ({
      role: 'assistant',
      content: formatAssistantContent(message),
    }))
    .filter((message) => message.content)
}

export function buildRequestMessages({ messages, currentUserMessage, systemMessage, fallbackSystem }) {
  const safeSystemMessage = typeof systemMessage === 'string' ? systemMessage : ''
  const safeFallbackSystem = typeof fallbackSystem === 'string' ? fallbackSystem : ''
  const safeCurrentUserMessage = typeof currentUserMessage === 'string' ? currentUserMessage : ''
  const trimmedSystem = safeSystemMessage.trim() || safeFallbackSystem
  const currentUser = { role: 'user', content: safeCurrentUserMessage.trim() }
  const safeMessages = sanitizeMessages(messages)

  const previousUserIndex = getLatestUserIndex(safeMessages)

  if (previousUserIndex < 0) {
    return [currentUser, { role: 'system', content: trimmedSystem }]
  }

  const previousUserMessage = safeMessages[previousUserIndex]
  const assistantRepliesToPreviousUser = getAssistantMessagesAfterIndex(safeMessages, previousUserIndex)

  return [
    currentUser,
    { role: 'system', content: trimmedSystem },
    { role: 'user', content: previousUserMessage.content },
    ...assistantRepliesToPreviousUser,
  ]
}

export function buildReceivedInputMessages({
  messages,
  latestUserMessage,
  systemMessage,
  fallbackSystem,
  noAiFallbackMessage = 'No AI messages found.',
}) {
  const safeSystemMessage = typeof systemMessage === 'string' ? systemMessage : ''
  const safeFallbackSystem = typeof fallbackSystem === 'string' ? fallbackSystem : ''
  const safeLatestUserMessage = typeof latestUserMessage === 'string' ? latestUserMessage : ''
  const safeNoAiFallbackMessage =
    typeof noAiFallbackMessage === 'string' && noAiFallbackMessage.trim()
      ? noAiFallbackMessage.trim()
      : 'No AI messages found.'

  const trimmedSystem = safeSystemMessage.trim() || safeFallbackSystem
  const safeMessages = sanitizeMessages(messages)
  const latestUserFromHistory = getLatestUserMessage(safeMessages)
  const effectiveLatestUserContent = safeLatestUserMessage.trim() || latestUserFromHistory?.content || ''
  const latestUser = { role: 'user', content: effectiveLatestUserContent }
  const latestUserIndex = getLatestUserIndex(safeMessages)
  const assistantMessages =
    latestUserIndex < 0 ? [] : getAssistantMessagesAfterIndex(safeMessages, latestUserIndex)

  return [
    latestUser,
    { role: 'system', content: trimmedSystem },
    ...(assistantMessages.length > 0
      ? assistantMessages
      : [{ role: 'assistant', content: safeNoAiFallbackMessage }]),
  ]
}
