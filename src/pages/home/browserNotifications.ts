import type { PlannerTask } from '../../lib/plannerStorage'

export type PlannerNotificationKind = 'today' | 'upcoming' | 'overdue'

export interface PlannerNotificationCandidate {
  kind: PlannerNotificationKind
  task: PlannerTask
}

const DEFAULT_LEAD_MINUTES = 15

export function formatLocalDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getPlannerNotificationCandidate(
  task: PlannerTask,
  now = new Date(),
  leadMinutes = DEFAULT_LEAD_MINUTES,
): PlannerNotificationCandidate | null {
  if (task.completed) return null

  const today = formatLocalDateKey(now)

  if (!task.dueTime.trim()) {
    if (task.dueDate === today) return { kind: 'today', task }
    if (task.dueDate < today) return { kind: 'overdue', task }
    return null
  }

  if (!/^\d{2}:\d{2}$/.test(task.dueTime)) return null

  const dueAt = new Date(`${task.dueDate}T${task.dueTime}:00`)
  if (Number.isNaN(dueAt.getTime())) return null

  const remainingMs = dueAt.getTime() - now.getTime()
  if (remainingMs < 0) return { kind: 'overdue', task }
  if (remainingMs <= leadMinutes * 60_000) return { kind: 'upcoming', task }

  return null
}

export function getPlannerNotificationKey(
  userId: string,
  candidate: PlannerNotificationCandidate,
  now = new Date(),
): string {
  const { kind, task } = candidate

  if (kind === 'overdue') {
    return `${userId}:${task.id}:overdue:${formatLocalDateKey(now)}`
  }

  return `${userId}:${task.id}:${kind}:${task.dueDate}:${task.dueTime || 'all-day'}`
}
