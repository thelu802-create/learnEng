import type { FavoriteShortcutMap, ToolKey } from './types'

export const OFFICE_TIPS_ACTIVE_TOOL_KEY = 'english-path-office-tips-active-tool'
export const OFFICE_TIPS_FAVORITES_KEY = 'english-path-office-tips-favorites'

export function getDefaultFavorites(): FavoriteShortcutMap {
  return {
    word: [],
    excel: [],
    powerpoint: [],
    windows: [],
    google: [],
  }
}

export function getInitialTool(): ToolKey {
  if (typeof window === 'undefined') return 'word'

  const savedValue = window.localStorage.getItem(OFFICE_TIPS_ACTIVE_TOOL_KEY)
  if (
    savedValue === 'word' ||
    savedValue === 'excel' ||
    savedValue === 'powerpoint' ||
    savedValue === 'windows' ||
    savedValue === 'google'
  ) {
    return savedValue
  }

  return 'word'
}

export function getInitialFavorites(): FavoriteShortcutMap {
  if (typeof window === 'undefined') return getDefaultFavorites()

  try {
    const raw = window.localStorage.getItem(OFFICE_TIPS_FAVORITES_KEY)
    if (!raw) return getDefaultFavorites()

    const parsed = JSON.parse(raw) as Partial<FavoriteShortcutMap>
    return {
      word: Array.isArray(parsed.word) ? parsed.word : [],
      excel: Array.isArray(parsed.excel) ? parsed.excel : [],
      powerpoint: Array.isArray(parsed.powerpoint) ? parsed.powerpoint : [],
      windows: Array.isArray(parsed.windows) ? parsed.windows : [],
      google: Array.isArray(parsed.google) ? parsed.google : [],
    }
  } catch {
    return getDefaultFavorites()
  }
}
