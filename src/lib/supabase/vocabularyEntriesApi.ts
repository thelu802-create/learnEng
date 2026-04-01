import { requireSupabaseClient } from './client'
import type {
  CreateVocabularyEntryInput,
  UpdateVocabularyEntryInput,
  VocabularyEntryRecord,
} from './types'

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
