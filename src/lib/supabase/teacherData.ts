import { requireSupabaseClient } from './client'
import type {
  CreateVocabularyEntryInput,
  PlannerTaskInput,
  PlannerTaskRecord,
  QuizAttemptRecord,
  SaveQuizInput,
  SavedQuizQuestionRecord,
  SavedQuizRecord,
  TeacherNoteRecord,
  UpdateVocabularyEntryInput,
  VocabularyEntryRecord,
} from './types'

export async function listTeacherNotes(userId: string): Promise<TeacherNoteRecord[]> {
  const supabase = requireSupabaseClient()
  const { data, error } = await supabase
    .from('teacher_notes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as TeacherNoteRecord[]
}

export async function upsertTeacherNote(input: {
  userId: string
  gradeKey: string
  topicKey: string
  content: string
}): Promise<TeacherNoteRecord> {
  const supabase = requireSupabaseClient()
  const { data, error } = await supabase
    .from('teacher_notes')
    .upsert(
      {
        user_id: input.userId,
        grade_key: input.gradeKey,
        topic_key: input.topicKey,
        content: input.content,
      },
      {
        onConflict: 'user_id,grade_key,topic_key',
      },
    )
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as TeacherNoteRecord
}

export async function listSavedQuizzes(userId: string): Promise<SavedQuizRecord[]> {
  const supabase = requireSupabaseClient()
  const { data, error } = await supabase
    .from('saved_quizzes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as SavedQuizRecord[]
}

export async function createSavedQuiz(input: SaveQuizInput): Promise<SavedQuizRecord> {
  const supabase = requireSupabaseClient()
  const { data: quiz, error: quizError } = await supabase
    .from('saved_quizzes')
    .insert({
      user_id: input.userId,
      title: input.title,
      source_passage: input.sourcePassage,
      grade_key: input.gradeKey ?? null,
      topic_key: input.topicKey ?? null,
    })
    .select()
    .single()

  if (quizError) {
    throw quizError
  }

  const questionRows = input.questions.map((question, index) => ({
    quiz_id: quiz.id,
    prompt: question.prompt,
    answer: question.answer,
    options: question.options,
    original_sentence: question.originalSentence ?? null,
    question_order: index,
  }))

  if (questionRows.length > 0) {
    const { error: questionError } = await supabase
      .from('saved_quiz_questions')
      .insert(questionRows)

    if (questionError) {
      throw questionError
    }
  }

  return quiz as SavedQuizRecord
}

export async function getSavedQuizQuestions(quizId: string): Promise<SavedQuizQuestionRecord[]> {
  const supabase = requireSupabaseClient()
  const { data, error } = await supabase
    .from('saved_quiz_questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('question_order', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as SavedQuizQuestionRecord[]
}

export async function saveQuizAttempt(input: {
  quizId: string
  studentName?: string | null
  score: number
  totalQuestions: number
  answers: Record<string, string>
}): Promise<QuizAttemptRecord> {
  const supabase = requireSupabaseClient()
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({
      quiz_id: input.quizId,
      student_name: input.studentName ?? null,
      score: input.score,
      total_questions: input.totalQuestions,
      answers: input.answers,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as QuizAttemptRecord
}

export async function listVocabularyEntries(userId: string): Promise<VocabularyEntryRecord[]> {
  const supabase = requireSupabaseClient()
  const { data, error } = await supabase
    .from('vocabulary_entries')
    .select('*')
    .or(`user_id.eq.${userId},source.eq.system`)
    .order('topic_title', { ascending: true })
    .order('word', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as VocabularyEntryRecord[]
}

export async function createVocabularyEntries(
  entries: CreateVocabularyEntryInput[],
): Promise<VocabularyEntryRecord[]> {
  if (entries.length === 0) {
    return []
  }

  const supabase = requireSupabaseClient()
  const { data, error } = await supabase
    .from('vocabulary_entries')
    .insert(
      entries.map((entry) => ({
        user_id: entry.userId,
        grade_key: entry.gradeKey,
        topic_key: entry.topicKey,
        topic_title: entry.topicTitle,
        word: entry.word,
        ipa: entry.ipa ?? '',
        meaning: entry.meaning,
        example: entry.example ?? '',
        source: 'teacher',
      })),
    )
    .select()

  if (error) {
    throw error
  }

  return (data ?? []) as VocabularyEntryRecord[]
}

export async function updateVocabularyEntry(
  entry: UpdateVocabularyEntryInput,
): Promise<VocabularyEntryRecord> {
  const supabase = requireSupabaseClient()
  const { data, error } = await supabase
    .from('vocabulary_entries')
    .update({
      grade_key: entry.gradeKey,
      topic_key: entry.topicKey,
      topic_title: entry.topicTitle,
      word: entry.word,
      ipa: entry.ipa ?? '',
      meaning: entry.meaning,
      example: entry.example ?? '',
    })
    .eq('id', entry.id)
    .eq('user_id', entry.userId)
    .eq('source', 'teacher')
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as VocabularyEntryRecord
}

export async function deleteVocabularyEntry(entryId: string, userId: string): Promise<void> {
  const supabase = requireSupabaseClient()
  const { error } = await supabase
    .from('vocabulary_entries')
    .delete()
    .eq('id', entryId)
    .eq('user_id', userId)
    .eq('source', 'teacher')

  if (error) {
    throw error
  }
}

export async function listPlannerTasks(userId: string): Promise<PlannerTaskRecord[]> {
  const supabase = requireSupabaseClient()
  const { data, error } = await supabase
    .from('planner_tasks')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true })
    .order('due_time', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as PlannerTaskRecord[]
}

export async function createPlannerTaskRecord(input: PlannerTaskInput): Promise<PlannerTaskRecord> {
  const supabase = requireSupabaseClient()
  const { data, error } = await supabase
    .from('planner_tasks')
    .insert({
      user_id: input.userId,
      title: input.title,
      note: input.note ?? '',
      due_date: input.dueDate,
      due_time: input.dueTime ?? '',
      priority: input.priority ?? 'medium',
      repeat_weekly: input.repeatWeekly ?? false,
      completed: input.completed ?? false,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as PlannerTaskRecord
}

export async function updatePlannerTaskRecord(taskId: string, input: PlannerTaskInput): Promise<PlannerTaskRecord> {
  const supabase = requireSupabaseClient()
  const { data, error } = await supabase
    .from('planner_tasks')
    .update({
      title: input.title,
      note: input.note ?? '',
      due_date: input.dueDate,
      due_time: input.dueTime ?? '',
      priority: input.priority ?? 'medium',
      repeat_weekly: input.repeatWeekly ?? false,
      completed: input.completed ?? false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)
    .eq('user_id', input.userId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as PlannerTaskRecord
}

export async function deletePlannerTaskRecord(taskId: string, userId: string): Promise<void> {
  const supabase = requireSupabaseClient()
  const { error } = await supabase
    .from('planner_tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId)

  if (error) {
    throw error
  }
}
