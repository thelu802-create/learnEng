export type ToolKey = 'word' | 'excel' | 'powerpoint' | 'windows' | 'google'

export interface ShortcutItem {
  combo: string
  action: string
  note: string
}

export interface ToolSection {
  key: ToolKey
  title: string
  description: string
  tips: string[]
  shortcuts: ShortcutItem[]
}

export type FavoriteShortcutMap = Record<ToolKey, string[]>

export type ShortcutViewItem = ShortcutItem & {
  toolKey: ToolKey
  toolTitle: string
  isFavorite: boolean
}

export interface OfficeTipsLabels {
  emptySearch: string
  emptyFavorites: string
  shortcutLabel: string
  tipLabel: string
  favoriteLabel: string
  shortcutSectionTitle: string
  allToolsScope: string
  favoriteAdded: string
  favoriteRemoved: string
}
