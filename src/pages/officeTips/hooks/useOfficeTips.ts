import { useCallback, useMemo } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { MessageInstance } from 'antd/es/message/interface'
import type {
  FavoriteShortcutMap,
  OfficeTipsLabels,
  ShortcutViewItem,
  ToolKey,
  ToolSection,
} from '../types'

interface UseOfficeTipsOptions {
  tools: ToolSection[]
  activeTool: ToolKey
  searchValue: string
  favoriteShortcuts: FavoriteShortcutMap
  setFavoriteShortcuts: Dispatch<SetStateAction<FavoriteShortcutMap>>
  searchAllTools: boolean
  showFavoritesOnly: boolean
  labels: OfficeTipsLabels
  message: MessageInstance
}

export function useOfficeTips({
  tools,
  activeTool,
  searchValue,
  favoriteShortcuts,
  setFavoriteShortcuts,
  searchAllTools,
  showFavoritesOnly,
  labels,
  message,
}: UseOfficeTipsOptions) {
  const activeSection = tools.find((tool) => tool.key === activeTool) ?? tools[0]
  const activeFavorites = favoriteShortcuts[activeTool] ?? []

  const totalFavoritesCount = useMemo(
    () => Object.values(favoriteShortcuts).reduce((total, entries) => total + entries.length, 0),
    [favoriteShortcuts],
  )

  const filteredShortcuts = useMemo<ShortcutViewItem[]>(() => {
    const keyword = searchValue.trim().toLowerCase()
    const sourceTools = searchAllTools ? tools : [activeSection]
    const collected = sourceTools.flatMap((tool) =>
      tool.shortcuts
        .filter((shortcut) =>
          !keyword
            ? true
            : [tool.title, shortcut.combo, shortcut.action, shortcut.note].some((value) =>
                value.toLowerCase().includes(keyword),
              ),
        )
        .map((shortcut) => ({
          ...shortcut,
          toolKey: tool.key,
          toolTitle: tool.title,
          isFavorite: (favoriteShortcuts[tool.key] ?? []).includes(shortcut.combo),
        })),
    )

    const baseResults = showFavoritesOnly ? collected.filter((shortcut) => shortcut.isFavorite) : collected

    return [...baseResults].sort((left, right) => {
      if (left.isFavorite !== right.isFavorite) return left.isFavorite ? -1 : 1
      if (left.toolKey !== right.toolKey) {
        return (
          sourceTools.findIndex((tool) => tool.key === left.toolKey) -
          sourceTools.findIndex((tool) => tool.key === right.toolKey)
        )
      }

      return left.combo.localeCompare(right.combo)
    })
  }, [activeSection, favoriteShortcuts, searchAllTools, searchValue, showFavoritesOnly, tools])

  const emptyStateCopy = useMemo(
    () => (showFavoritesOnly ? labels.emptyFavorites : labels.emptySearch),
    [labels.emptyFavorites, labels.emptySearch, showFavoritesOnly],
  )

  const shortcutSectionTitle = searchAllTools
    ? `${labels.shortcutSectionTitle} - ${labels.allToolsScope}`
    : `${labels.shortcutSectionTitle} - ${activeSection.title}`

  const shortcutOverviewItems = [
    `${searchAllTools ? filteredShortcuts.length : activeSection.shortcuts.length} ${labels.shortcutLabel}`,
    `${activeSection.tips.length} ${labels.tipLabel}`,
    `${searchAllTools ? totalFavoritesCount : activeFavorites.length} ${labels.favoriteLabel}`,
  ]

  const handleToggleFavorite = useCallback(
    (toolKey: ToolKey, combo: string) => {
      const currentItems = favoriteShortcuts[toolKey] ?? []
      const isRemoving = currentItems.includes(combo)

      setFavoriteShortcuts((current) => {
        const existingItems = current[toolKey] ?? []
        const nextItems = isRemoving
          ? existingItems.filter((item) => item !== combo)
          : [...existingItems, combo]

        return {
          ...current,
          [toolKey]: nextItems,
        }
      })

      message.success(isRemoving ? labels.favoriteRemoved : labels.favoriteAdded)
    },
    [favoriteShortcuts, labels.favoriteAdded, labels.favoriteRemoved, message, setFavoriteShortcuts],
  )

  return {
    activeSection,
    activeFavorites,
    totalFavoritesCount,
    filteredShortcuts,
    emptyStateCopy,
    shortcutSectionTitle,
    shortcutOverviewItems,
    handleToggleFavorite,
  }
}
