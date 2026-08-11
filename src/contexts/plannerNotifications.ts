import { createContext, useContext } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { PlannerTask } from '../lib/plannerStorage'

export type PlannerBrowserNotificationPermission = NotificationPermission | 'unsupported'

export interface PlannerNotificationsContextValue {
  disable: () => void
  enable: () => Promise<PlannerBrowserNotificationPermission>
  enabled: boolean
  loadingTasks: boolean
  permission: PlannerBrowserNotificationPermission
  refreshTasks: () => Promise<void>
  setTasks: Dispatch<SetStateAction<PlannerTask[]>>
  supported: boolean
  taskLoadErrorVersion: number
  tasks: PlannerTask[]
}

export const PlannerNotificationsContext = createContext<PlannerNotificationsContextValue | null>(null)

export function usePlannerNotifications(): PlannerNotificationsContextValue {
  const value = useContext(PlannerNotificationsContext)
  if (!value) throw new Error('usePlannerNotifications must be used inside PlannerNotificationsProvider.')
  return value
}
