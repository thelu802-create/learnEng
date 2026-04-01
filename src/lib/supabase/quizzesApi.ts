import { requireSupabaseClient } from './client'
import type {
  QuizAttemptRecord,
  SaveQuizInput,
  SavedQuizQuestionRecord,
  SavedQuizRecord,
} from './types'

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
    const { error: questionError } = await supabase.from('saved_quiz_questions').insert(questionRows)

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
