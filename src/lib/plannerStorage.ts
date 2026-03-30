export type PlannerTaskPriority = 'low' | 'medium' | 'high'

export interface PlannerTask {
  id: string
  title: string
  note: string
  dueDate: string
  dueTime: string
  priority: PlannerTaskPriority
  repeatWeekly: boolean
  completed: boolean
  createdAt: string
  updatedAt: string
}

export interface PlannerTaskInput {
  title: string
  note?: string
  dueDate: string
  dueTime?: string
  priority?: PlannerTaskPriority
  repeatWeekly?: boolean
}

export const PLANNER_STORAGE_KEY = 'english-path-planner-tasks'

function sortTasks(tasks: PlannerTask[]): PlannerTask[] {
  return [...tasks].sort((left, right) => {
    const leftTime = getTaskDueTimestamp(left)
    const rightTime = getTaskDueTimestamp(right)
    return leftTime - rightTime
  })
}

export function readPlannerTasks(): PlannerTask[] {
  if (typeof window === 'undefined') {
    return []
  }

  const raw = window.localStorage.getItem(PLANNER_STORAGE_KEY)
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as PlannerTask[]
    if (!Array.isArray(parsed)) {
      return []
    }

    return sortTasks(
      parsed.filter(
        (task) =>
          typeof task?.id === 'string' &&
          typeof task?.title === 'string' &&
          typeof task?.dueDate === 'string',
      ),
    )
  } catch {
    return []
  }
}

export function writePlannerTasks(tasks: PlannerTask[]): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(sortTasks(tasks)))
}

export function createPlannerTask(input: PlannerTaskInput): PlannerTask {
  const now = new Date().toISOString()
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `task-${Date.now()}`,
    title: input.title.trim(),
    note: input.note?.trim() ?? '',
    dueDate: input.dueDate,
    dueTime: input.dueTime ?? '',
    priority: input.priority ?? 'medium',
    repeatWeekly: input.repeatWeekly ?? false,
    completed: false,
    createdAt: now,
    updatedAt: now,
  }
}

export function upsertPlannerTask(task: PlannerTask): PlannerTask[] {
  const tasks = readPlannerTasks()
  const nextTasks = tasks.some((item) => item.id === task.id)
    ? tasks.map((item) => (item.id === task.id ? task : item))
    : [...tasks, task]

  writePlannerTasks(nextTasks)
  return sortTasks(nextTasks)
}

export function removePlannerTask(taskId: string): PlannerTask[] {
  const nextTasks = readPlannerTasks().filter((task) => task.id !== taskId)
  writePlannerTasks(nextTasks)
  return sortTasks(nextTasks)
}

export function togglePlannerTask(taskId: string): PlannerTask[] {
  const nextTasks = readPlannerTasks().map((task) => {
    if (task.id !== taskId) {
      return task
    }

    const nextCompleted = task.repeatWeekly ? false : !task.completed
    const nextDueDate =
      !task.completed && task.repeatWeekly ? shiftDateByDays(task.dueDate, 7) : task.dueDate

    return {
      ...task,
      completed: nextCompleted,
      dueDate: nextDueDate,
      updatedAt: new Date().toISOString(),
    }
  })

  writePlannerTasks(nextTasks)
  return sortTasks(nextTasks)
}

export function shiftPlannerTaskAfterCompletion(task: PlannerTask): PlannerTask {
  if (task.repeatWeekly) {
    return {
      ...task,
      dueDate: shiftDateByDays(task.dueDate, 7),
      completed: false,
      updatedAt: new Date().toISOString(),
    }
  }

  return {
    ...task,
    completed: !task.completed,
    updatedAt: new Date().toISOString(),
  }
}

export function getTaskDueDate(task: PlannerTask): Date {
  const timePart = task.dueTime ? `T${task.dueTime}:00` : 'T09:00:00'
  return new Date(`${task.dueDate}${timePart}`)
}

export function getTaskDueTimestamp(task: PlannerTask): number {
  return getTaskDueDate(task).getTime()
}

export function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

export function getTaskBucket(task: PlannerTask, now = new Date()): 'today' | 'upcoming' | 'overdue' | 'later' {
  if (task.completed) {
    return 'later'
  }

  const dueDate = getTaskDueDate(task)
  if (isSameDay(dueDate, now)) {
    return 'today'
  }

  if (dueDate.getTime() < now.getTime()) {
    return 'overdue'
  }

  const diffHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  if (diffHours <= 48) {
    return 'upcoming'
  }

  return 'later'
}

export function getWeekdayLabel(dateString: string, language: 'vi' | 'en'): string {
  const date = new Date(`${dateString}T09:00:00`)
  return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'vi-VN', {
    weekday: 'long',
  }).format(date)
}

export function formatTaskDate(dateString: string, language: 'vi' | 'en'): string {
  const date = new Date(`${dateString}T09:00:00`)
  return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function shiftDateByDays(dateString: string, days: number): string {
  const date = new Date(`${dateString}T09:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}
