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
  userId: string
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
  repeatWeekly?: boolean
  completed?: boolean
}
