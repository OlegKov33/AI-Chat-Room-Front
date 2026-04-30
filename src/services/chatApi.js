function normalizeApiUrl(apiUrl) {
  const trimmedUrl = apiUrl.trim()
  if (!trimmedUrl) {
    throw new Error('API URL is empty')
  }

  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl
  }

  return `http://${trimmedUrl}`
}

export async function sendMessage({ apiUrl, payload }) {
  const response = await fetch(normalizeApiUrl(apiUrl), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return response.json()
}
