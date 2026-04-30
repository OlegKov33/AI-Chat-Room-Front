const ALLOWED_ROLES = new Set(['user', 'system', 'assistant'])

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function isValidMessage(value) {
  if (!isPlainObject(value)) return false
  if (!ALLOWED_ROLES.has(value.role)) return false
  return typeof value.content === 'string'
}

export function sanitizeMessages(input) {
  if (!Array.isArray(input)) return []
  return input.filter(isValidMessage).map((message) => ({
    role: message.role,
    content: message.content,
  }))
}

export function validateNumberOfRounds(value) {
  return Number.isInteger(value) && value >= 1 && value <= 127
}

export function validateUsedAI(value) {
  if (!isPlainObject(value)) return false

  const entries = Object.entries(value)
  if (entries.length === 0) return false

  return entries.every(
    ([modelName, enabled]) => modelName.trim().length > 0 && typeof enabled === 'boolean',
  )
}

export function hasEnabledAI(value) {
  if (!validateUsedAI(value)) return false
  return Object.values(value).some(Boolean)
}

export function buildValidatedRequestPayload({ messages, numberOfRounds, usedAI }) {
  const sanitizedMessages = sanitizeMessages(messages)
  const sanitizedUsedAIEntries = Object.entries(usedAI ?? {}).map(([modelName, enabled]) => {
    const normalizedModelName = String(modelName).trim()
    if (typeof enabled !== 'boolean') {
      throw new Error('Invalid usedAI: expected object of modelName -> boolean.')
    }
    return [normalizedModelName, enabled]
  })
  const sanitizedUsedAI = Object.fromEntries(sanitizedUsedAIEntries)

  if (!Array.isArray(messages) || sanitizedMessages.length !== messages.length) {
    throw new Error('Invalid request messages: null or malformed entries are not allowed.')
  }

  if (!validateNumberOfRounds(numberOfRounds)) {
    throw new Error('Invalid numberOfRounds: expected integer in range 1-127.')
  }

  if (!validateUsedAI(sanitizedUsedAI)) {
    throw new Error('Invalid usedAI: expected object of modelName -> boolean.')
  }

  if (!hasEnabledAI(sanitizedUsedAI)) {
    throw new Error('Invalid usedAI: at least one AI model must be enabled.')
  }

  const enabledOnlyUsedAI = Object.fromEntries(
    Object.entries(sanitizedUsedAI).filter(([, enabled]) => enabled),
  )

  return {
    messages: sanitizedMessages,
    numberOfRounds,
    usedAI: enabledOnlyUsedAI,
  }
}
