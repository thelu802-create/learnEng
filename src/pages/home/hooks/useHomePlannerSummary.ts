import { useMemo } from 'react'
import { getTaskBucket, type PlannerTask } from '../../../lib/plannerStorage'
import type { HomeReminderStatusKey, WeeklyPlannerDay } from '../types'

function getStartOfWeek(date: Date) {
  const next = new Date(date)
  const day = next.getDay()
  const offset = day === 0 ? -6 : 1 - day
  next.setHours(0, 0, 0, 0)
  next.setDate(next.getDate() + offset)
  return next
}

export function useHomePlannerSummary(plannerTasks: PlannerTask[]) {
  const reminderTasks = useMemo(
    () =>
      plannerTasks
        .filter((task) => {
          const bucket = getTaskBucket(task)
          return bucket === 'today' || bucket === 'upcoming' || bucket === 'overdue'
        })
        .slice(0, 3),
    [plannerTasks],
  )

  const plannerStats = useMemo(() => {
    const counts: Record<HomeReminderStatusKey, number> = {
      today: 0,
      upcoming: 0,
      overdue: 0,
    }

    plannerTasks.forEach((task) => {
      const bucket = getTaskBucket(task)
      if (bucket === 'today' || bucket === 'upcoming' || bucket === 'overdue') {
        counts[bucket] += 1
      }
    })

    return counts
  }, [plannerTasks])

  const weeklyPlanner = useMemo(() => {
    const start = getStartOfWeek(new Date())
    const days: WeeklyPlannerDay[] = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)

      return {
        key: date.toISOString(),
        date,
        total: 0,
        completed: 0,
      }
    })

    plannerTasks.forEach((task) => {
      const dueDate = new Date(`${task.dueDate}T00:00:00`)
      dueDate.setHours(0, 0, 0, 0)
      const diff = Math.round((dueDate.getTime() - start.getTime()) / 86400000)

      if (diff >= 0 && diff < 7) {
        days[diff].total += 1
        if (task.completed) {
          days[diff].completed += 1
        }
      }
    })

    const total = days.reduce((sum, day) => sum + day.total, 0)
    const completed = days.reduce((sum, day) => sum + day.completed, 0)
    const max = Math.max(...days.map((day) => day.total), 1)

    return {
      days,
      total,
      completed,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      max,
    }
  }, [plannerTasks])

  const getReminderStatus = (task: PlannerTask) => {
    const bucket = getTaskBucket(task)

    if (bucket === 'today') {
      return { key: 'today' as const, color: 'gold' }
    }

    if (bucket === 'overdue') {
      return { key: 'overdue' as const, color: 'volcano' }
    }

    return { key: 'upcoming' as const, color: 'cyan' }
  }

  return {
    plannerTasks,
    reminderTasks,
    plannerStats,
    weeklyPlanner,
    getReminderStatus,
  }
}
