import type { PlannerTaskInput } from '../../lib/plannerStorage'

export type PlannerFormValues = PlannerTaskInput
export type PlannerTaskListStatus = 'completed' | 'overdue' | 'later'

export interface PlannerPageProps {
  onRegisterTopbarAction?: (label: string | null, handler: (() => void) | null) => void
}

export interface WeeklyDayItem {
  key: string
  label: string
  dayNumber: number
  total: number
  completed: number
  pending: number
  isToday: boolean
}

export interface WeeklyOverview {
  days: WeeklyDayItem[]
  weekStart: Date
  weekEnd: Date
  total: number
  completed: number
  pending: number
  overdue: number
  percent: number
  max: number
  busiestDay: WeeklyDayItem | null
}

export interface PlannerOverviewCardItem {
  key: string
  title: string
  value: number
  tone: string
  icon: React.ReactNode
}
