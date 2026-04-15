import type { MenuItemConfig, MenuKey } from '../types'

export const menuItems: MenuItemConfig[] = [
  { key: 'home', icon: 'rocket', path: '/' },
  { key: 'lessons', icon: 'book', path: '/lessons' },
  { key: 'practice', icon: 'play', path: '/practice' },
  { key: 'playground', icon: 'bulb', path: '/playground' },
  { key: 'planner', icon: 'calendar', path: '/planner' },
  { key: 'progress', icon: 'rise', path: '/progress' },
  { key: 'officeTips', icon: 'bulb', path: '/office-tips' },
  { key: 'help', icon: 'help', path: '/help' },
]

const menuKeyByPath = new Map(menuItems.map((item) => [item.path, item.key]))
const menuPathByKey = new Map(menuItems.map((item) => [item.key, item.path]))

export function getMenuKeyFromPath(pathname: string): MenuKey {
  return menuKeyByPath.get(pathname) ?? 'home'
}

export function getMenuPath(menuKey: MenuKey): string {
  return menuPathByKey.get(menuKey) ?? '/'
}
