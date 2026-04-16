import type { GradeContent, GradeKey } from '../../types'

export interface HomePageProps {
  selectedGrade: GradeKey
  currentGrade: GradeContent
  onOpenLessons: () => void
  onOpenPlanner: () => void
  onOpenPractice: () => void
}

export type HomeReminderStatusKey = 'today' | 'upcoming' | 'overdue'

export interface WeeklyPlannerDay {
  key: string
  date: Date
  total: number
  completed: number
}
