export function buildPlainChatLog(messages) {
  return {
    version: 1,
    type: 'plain',
    exportedAt: new Date().toISOString(),
    messages,
  }
}

export function parseChatLogText(textContent) {
  return JSON.parse(textContent)
}

export function downloadJsonFile(fileName, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
