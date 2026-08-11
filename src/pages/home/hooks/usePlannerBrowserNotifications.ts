import { useCallback, useEffect, useState } from 'react'
import { useI18n } from '../../../i18n'
import type { PlannerTask } from '../../../lib/plannerStorage'
import {
  getPlannerNotificationCandidate,
  getPlannerNotificationKey,
  type PlannerNotificationCandidate,
} from '../browserNotifications'
import type { PlannerBrowserNotificationPermission } from '../../../contexts/plannerNotifications'

interface BrowserNotificationState {
  userId?: string
  permission: PlannerBrowserNotificationPermission
  enabled: boolean
}

const ENABLED_STORAGE_PREFIX = 'learneng-planner-notifications-enabled'
const SENT_STORAGE_PREFIX = 'learneng-planner-notifications-sent'
const SENT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000
const CHECK_INTERVAL_MS = 30_000

function getPermission(): PlannerBrowserNotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  return Notification.permission
}

function getStorageKey(prefix: string, userId: string) {
  return `${prefix}:${userId}`
}

function getNotificationState(userId?: string): BrowserNotificationState {
  const permission = getPermission()
  const enabled = Boolean(
    userId &&
      permission === 'granted' &&
      typeof window !== 'undefined' &&
      window.localStorage.getItem(getStorageKey(ENABLED_STORAGE_PREFIX, userId)) === 'true',
  )

  return { userId, permission, enabled }
}

function readSentNotifications(userId: string, now: number): Record<string, number> {
  try {
    const raw = window.localStorage.getItem(getStorageKey(SENT_STORAGE_PREFIX, userId))
    const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {}

    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, number] => {
        const timestamp = entry[1]
        return typeof timestamp === 'number' && now - timestamp < SENT_RETENTION_MS
      }),
    )
  } catch {
    return {}
  }
}

function writeSentNotifications(userId: string, sent: Record<string, number>) {
  window.localStorage.setItem(getStorageKey(SENT_STORAGE_PREFIX, userId), JSON.stringify(sent))
}

function buildPlannerUrl(): string {
  const url = new URL(window.location.href)
  url.hash = '/planner'
  return url.href
}

async function showNotification(title: string, body: string) {
  const options: NotificationOptions = {
    body,
    icon: new URL(`${import.meta.env.BASE_URL}favicon.svg`, window.location.origin).href,
    tag: 'learneng-planner-browser-notification',
    data: { url: buildPlannerUrl() },
  }

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}notification-sw.js`)
    await registration.showNotification(title, options)
    return
  }

  const notification = new Notification(title, options)
  notification.onclick = () => {
    window.focus()
    window.location.hash = '/planner'
    notification.close()
  }
}

export function usePlannerBrowserNotifications({
  tasks,
  userId,
}: {
  tasks: PlannerTask[]
  userId?: string
}) {
  const { t } = useI18n()
  const [storedState, setStoredState] = useState<BrowserNotificationState>(() => getNotificationState(userId))
  const state = storedState.userId === userId ? storedState : getNotificationState(userId)

  const enable = useCallback(async (): Promise<PlannerBrowserNotificationPermission> => {
    if (!userId || !('Notification' in window)) {
      setStoredState({ userId, permission: 'unsupported', enabled: false })
      return 'unsupported'
    }

    const nextPermission =
      Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission()

    const nextEnabled = nextPermission === 'granted'
    setStoredState({ userId, permission: nextPermission, enabled: nextEnabled })
    window.localStorage.setItem(getStorageKey(ENABLED_STORAGE_PREFIX, userId), String(nextEnabled))
    return nextPermission
  }, [userId])

  const disable = useCallback(() => {
    if (userId) {
      window.localStorage.setItem(getStorageKey(ENABLED_STORAGE_PREFIX, userId), 'false')
    }
    setStoredState({ userId, permission: getPermission(), enabled: false })
  }, [userId])

  useEffect(() => {
    if (!state.enabled || state.permission !== 'granted' || !userId || tasks.length === 0) return

    let active = true

    const checkTasks = async () => {
      const now = new Date()
      const nowTimestamp = now.getTime()
      const sent = readSentNotifications(userId, nowTimestamp)
      const candidates = tasks
        .map((task) => getPlannerNotificationCandidate(task, now))
        .filter((candidate): candidate is PlannerNotificationCandidate => candidate !== null)
        .filter((candidate) => !sent[getPlannerNotificationKey(userId, candidate, now)])

      if (!active || candidates.length === 0) return

      const keys = candidates.map((candidate) => getPlannerNotificationKey(userId, candidate, now))
      keys.forEach((key) => {
        sent[key] = nowTimestamp
      })
      writeSentNotifications(userId, sent)

      const first = candidates[0]
      const body =
        candidates.length > 1
          ? t('home.notificationMultipleTasks', { count: candidates.length })
          : first.kind === 'overdue'
            ? t('home.notificationTaskOverdue', { title: first.task.title })
            : first.kind === 'upcoming'
              ? t('home.notificationTaskUpcoming', {
                  title: first.task.title,
                  time: first.task.dueTime,
                })
              : t('home.notificationTaskToday', { title: first.task.title })

      try {
        await showNotification(t('home.notificationTitle'), body)
      } catch {
        const latest = readSentNotifications(userId, Date.now())
        keys.forEach((key) => delete latest[key])
        writeSentNotifications(userId, latest)
      }
    }

    void checkTasks()
    const intervalId = window.setInterval(() => void checkTasks(), CHECK_INTERVAL_MS)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [state.enabled, state.permission, t, tasks, userId])

  return {
    disable,
    enable,
    enabled: state.enabled,
    permission: state.permission,
    supported: state.permission !== 'unsupported',
  }
}
