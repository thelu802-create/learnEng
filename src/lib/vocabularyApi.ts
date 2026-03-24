import type { GradeKey, VocabularyApiPayload, VocabularyApiResponse } from '../types'

const apiBase = '/api/vocabulary'

interface ApiErrorPayload {
  message?: string
}

async function handleResponse<T extends object>(response: Response): Promise<T> {
  const payload = (await response.json()) as T | ApiErrorPayload

  if (!response.ok) {
    throw new Error('message' in payload ? payload.message || 'Yeu cau that bai.' : 'Yeu cau that bai.')
  }

  return payload as T
}

export async function fetchVocabularyTopics(grade: GradeKey): Promise<VocabularyApiResponse> {
  const response = await fetch(`${apiBase}/${encodeURIComponent(grade)}`)
  return handleResponse<VocabularyApiResponse>(response)
}

export async function createVocabularyWord(
  grade: GradeKey,
  payload: VocabularyApiPayload,
): Promise<VocabularyApiResponse> {
  const response = await fetch(`${apiBase}/${encodeURIComponent(grade)}/words`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return handleResponse<VocabularyApiResponse>(response)
}

export async function updateVocabularyWord(
  grade: GradeKey,
  wordId: string,
  payload: VocabularyApiPayload,
): Promise<VocabularyApiResponse> {
  const response = await fetch(`${apiBase}/${encodeURIComponent(grade)}/words/${wordId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return handleResponse<VocabularyApiResponse>(response)
}

export async function deleteVocabularyWord(
  grade: GradeKey,
  wordId: string,
): Promise<VocabularyApiResponse> {
  const response = await fetch(`${apiBase}/${encodeURIComponent(grade)}/words/${wordId}`, {
    method: 'DELETE',
  })

  return handleResponse<VocabularyApiResponse>(response)
}
