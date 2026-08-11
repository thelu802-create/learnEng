import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import {
  PlannerNotificationsContext,
  type PlannerNotificationsContextValue,
} from '../../contexts/plannerNotifications'
import { sortPlannerTasks, type PlannerTask } from '../../lib/plannerStorage'
import { listPlannerTasks } from '../../lib/supabase/plannerApi'
import { usePlannerBrowserNotifications } from '../../pages/home/hooks/usePlannerBrowserNotifications'
import { useSupabaseAuth } from './SupabaseAuthProvider'

const TASK_REFRESH_INTERVAL_MS = 5 * 60 * 1000

interface PlannerTaskState {
  errorVersion: number
  loading: boolean
  ownerKey?: string
  tasks: PlannerTask[]
}

function mapPlannerTask(task: Awaited<ReturnType<typeof listPlannerTasks>>[number]): PlannerTask {
  return {
    id: task.id,
    title: task.title,
    note: task.note,
    dueDate: task.due_date,
    dueTime: task.due_time,
    priority: task.priority,
    repeatPattern: task.repeat_pattern ?? (task.repeat_weekly ? 'weekly' : null),
    completed: task.completed,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
  }
}

function PlannerNotificationsProvider({ children }: { children: ReactNode }) {
  const { configured, user } = useSupabaseAuth()
  const location = useLocation()
  const userId = user?.id
  const ownerKey = user ? `${user.id}:${user.last_sign_in_at ?? ''}` : undefined
  const requestIdRef = useRef(0)
  const [taskState, setTaskState] = useState<PlannerTaskState>({
    errorVersion: 0,
    loading: false,
    tasks: [],
  })
  const tasks = useMemo(
    () => (taskState.ownerKey === ownerKey ? taskState.tasks : []),
    [ownerKey, taskState.ownerKey, taskState.tasks],
  )
  const loadingTasks = taskState.ownerKey === ownerKey && taskState.loading
  const taskLoadErrorVersion = taskState.ownerKey === ownerKey ? taskState.errorVersion : 0
  const notifications = usePlannerBrowserNotifications({ tasks, userId })
  const routeNeedsTasks = location.pathname === '/' || location.pathname === '/planner'

  const refreshTasks = useCallback(async () => {
    if (!configured || !userId) return

    const requestId = ++requestIdRef.current
    setTaskState((current) => ({
      errorVersion: current.ownerKey === ownerKey ? current.errorVersion : 0,
      loading: true,
      ownerKey,
      tasks: current.ownerKey === ownerKey ? current.tasks : [],
    }))

    try {
      const records = await listPlannerTasks(userId)
      if (requestId !== requestIdRef.current) return

      setTaskState((current) => ({
        errorVersion: current.ownerKey === ownerKey ? current.errorVersion : 0,
        loading: false,
        ownerKey,
        tasks: sortPlannerTasks(records.map(mapPlannerTask)),
      }))
    } catch (error) {
      if (requestId !== requestIdRef.current) return

      setTaskState((current) => ({
        errorVersion: (current.ownerKey === ownerKey ? current.errorVersion : 0) + 1,
        loading: false,
        ownerKey,
        tasks: current.ownerKey === ownerKey ? current.tasks : [],
      }))
      throw error
    }
  }, [configured, ownerKey, userId])

  const setTasks = useCallback<PlannerNotificationsContextValue['setTasks']>(
    (nextTasks) => {
      if (!userId) return

      requestIdRef.current += 1
      setTaskState((current) => {
        const currentTasks = current.ownerKey === ownerKey ? current.tasks : []
        const tasksValue = typeof nextTasks === 'function' ? nextTasks(currentTasks) : nextTasks

        return {
          errorVersion: current.ownerKey === ownerKey ? current.errorVersion : 0,
          loading: false,
          ownerKey,
          tasks: sortPlannerTasks(tasksValue),
        }
      })
    },
    [ownerKey, userId],
  )

  useEffect(() => {
    if (!configured || !userId || (!routeNeedsTasks && !notifications.enabled)) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') void refreshTasks().catch(() => undefined)
    }

    const initialRefreshId = window.setTimeout(() => void refreshTasks().catch(() => undefined), 0)
    const intervalId = notifications.enabled
      ? window.setInterval(() => void refreshTasks().catch(() => undefined), TASK_REFRESH_INTERVAL_MS)
      : null
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.clearTimeout(initialRefreshId)
      if (intervalId !== null) window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [configured, notifications.enabled, refreshTasks, routeNeedsTasks, userId])

  const contextValue = useMemo(
    () => ({
      ...notifications,
      loadingTasks,
      refreshTasks,
      setTasks,
      taskLoadErrorVersion,
      tasks,
    }),
    [loadingTasks, notifications, refreshTasks, setTasks, taskLoadErrorVersion, tasks],
  )

  return (
    <PlannerNotificationsContext.Provider value={contextValue}>
      {children}
    </PlannerNotificationsContext.Provider>
  )
}

export default PlannerNotificationsProvider
