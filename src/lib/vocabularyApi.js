const apiBase = '/api/vocabulary'

async function handleResponse(response) {
  const payload = await response.json()

  if (!response.ok) {
    throw new Error(payload.message || 'Yeu cau that bai.')
  }

  return payload
}

export async function fetchVocabularyTopics(grade) {
  const response = await fetch(`${apiBase}/${encodeURIComponent(grade)}`)
  return handleResponse(response)
}

export async function createVocabularyWord(grade, payload) {
  const response = await fetch(`${apiBase}/${encodeURIComponent(grade)}/words`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return handleResponse(response)
}

export async function updateVocabularyWord(grade, wordId, payload) {
  const response = await fetch(`${apiBase}/${encodeURIComponent(grade)}/words/${wordId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return handleResponse(response)
}

export async function deleteVocabularyWord(grade, wordId) {
  const response = await fetch(`${apiBase}/${encodeURIComponent(grade)}/words/${wordId}`, {
    method: 'DELETE',
  })

  return handleResponse(response)
}
