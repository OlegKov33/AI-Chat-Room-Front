import { sanitizeMessages } from './messageValidation'

function removeQwenThinking(content) {
  return content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
}

function removeEmptyCodeFences(content) {
  return content.replace(/```[\w-]*\s*```/g, '').trim()
}

function normalizeAssistantContent(content) {
  return removeEmptyCodeFences(removeQwenThinking(content))
}

function extractModelPrefix(content) {
  const match = content.match(/^([a-z0-9._/-]+):\s*/i)
  return match ? match[1] : null
}

function normalizeRoleForBackendMessage(message) {
  const hasModelPrefix = /^[a-z0-9._/-]+:\s+/i.test(message.content)
  const isAssistantMessage = message.role === 'assistant'
  const isPrefixedUserMessage = message.role === 'user' && hasModelPrefix

  if (!isAssistantMessage && !isPrefixedUserMessage) return null

  const cleanedContent = normalizeAssistantContent(message.content)
  if (!cleanedContent) return null

  return { role: 'assistant', content: cleanedContent }
}

export function extractMessagesFromApiResponse(rawResponse, allowedModels = []) {
  const candidate = Array.isArray(rawResponse) ? rawResponse : rawResponse?.messages
  const allowedModelSet = new Set(allowedModels)

  return sanitizeMessages(candidate)
    .map(normalizeRoleForBackendMessage)
    .filter(Boolean)
    .filter((message) => {
      if (allowedModelSet.size === 0) return true
      const model = extractModelPrefix(message.content)
      return model ? allowedModelSet.has(model) : false
    })
}
