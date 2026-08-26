export interface TeacherNoteRecord {
  id: string
  user_id: string
  grade_key: string
  topic_key: string
  content: string
  updated_at: string
}

export interface SavedQuizRecord {
  id: string
  user_id: string
  title: string
  source_passage: string
  grade_key: string | null
  topic_key: string | null
  created_at: string
}

export interface ProfileRecord {
  id: string
  role: 'teacher' | 'student' | 'admin'
  display_name: string | null
  created_at: string
}

export type AppUserRole = 'admin' | 'member'
export type AppUserStatus = 'active' | 'disabled'

export interface AppUserAccessRecord {
  id: string
  email: string
  role: AppUserRole
  status: AppUserStatus
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface SavedQuizQuestionRecord {
  id: string
  quiz_id: string
  prompt: string
  answer: string
  options: string[]
  original_sentence: string | null
  question_order: number
}

export interface QuizAttemptRecord {
  id: string
  quiz_id: string
  student_name: string | null
  score: number
  total_questions: number
  answers: Record<string, string>
  created_at: string
}

export interface SaveQuizInput {
  title: string
  sourcePassage: string
  gradeKey?: string | null
  topicKey?: string | null
  questions: Array<{
    prompt: string
    answer: string
    options: string[]
    originalSentence?: string | null
  }>
}

export interface VocabularyEntryRecord {
  id: string
  user_id: string | null
  grade_key: string
  topic_key: string
  topic_title: string
  word: string
  ipa: string
  meaning: string
  example: string
  source: 'system' | 'teacher'
  created_at: string
  updated_at: string
}

export interface CreateVocabularyEntryInput {
  userId: string
  gradeKey: string
  topicKey: string
  topicTitle: string
  word: string
  ipa?: string
  meaning: string
  example?: string
}

export interface UpdateVocabularyEntryInput {
  id: string
  userId: string
  gradeKey: string
  topicKey: string
  topicTitle: string
  word: string
  ipa?: string
  meaning: string
  example?: string
}

export interface PlannerTaskRecord {
  id: string
  user_id: string
  title: string
  note: string
  due_date: string
  due_time: string
  priority: 'low' | 'medium' | 'high'
  repeat_weekly: boolean
  repeat_pattern: string | null
  completed: boolean
  created_at: string
  updated_at: string
}

export interface PlannerTaskInput {
  userId: string
  title: string
  note?: string
  dueDate: string
  dueTime?: string
  priority?: 'low' | 'medium' | 'high'
  repeatPattern?: string | null
  completed?: boolean
}

export type MakeupScheduleStatus = 'planned' | 'completed' | 'cancelled'

export interface MakeupScheduleRecord {
  id: string
  user_id: string
  class_name: string
  lesson_period: string
  missed_date: string
  makeup_date: string
  makeup_time: string
  note: string
  status: MakeupScheduleStatus
  created_at: string
  updated_at: string
}

export interface MakeupScheduleInput {
  userId: string
  className: string
  lessonPeriod?: string
  missedDate: string
  makeupDate: string
  makeupTime?: string
  note?: string
  status?: MakeupScheduleStatus
}

export interface ClassRosterRecord {
  id: string
  user_id: string
  name: string
  school_year: string
  source_file_name: string
  student_count: number
  created_at: string
  updated_at: string
}

export interface ClassStudentRecord {
  id: string
  roster_id: string
  user_id: string
  class_name: string
  student_number: string
  full_name: string
  gender: string
  date_of_birth: string
  phone_number: string
  is_ic3: boolean
  is_tabn: boolean
  has_air_conditioner: boolean
  is_inclusive: boolean
  has_zalo: boolean
  note: string
  extra_data: Record<string, string>
  source_sheet: string
  source_row: number
  created_at: string
}
