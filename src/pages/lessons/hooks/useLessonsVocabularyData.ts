import { useMemo } from 'react'
import { gradeContent } from '../../../data'
import type { VocabularyEntryRecord } from '../../../lib/supabase/types'
import type { GradeContent, GradeKey } from '../../../types'
import type {
  SearchableVocabularyTopic,
  SelectedVocabulary,
} from '../types'
import { matchesVocabulary, normalizeWordKey } from '../utils'

interface UseLessonsVocabularyDataOptions {
  selectedGrade: GradeKey
  currentGrade: GradeContent
  teacherVocabularyEntries: VocabularyEntryRecord[]
  searchKeyword: string
  selectedVocabularyKey: string
}

export function useLessonsVocabularyData({
  selectedGrade,
  currentGrade,
  teacherVocabularyEntries,
  searchKeyword,
  selectedVocabularyKey,
}: UseLessonsVocabularyDataOptions) {
  const mergedVocabularyTopicsByGrade = useMemo<Record<GradeKey, SearchableVocabularyTopic[]>>(() => {
    const baseMap = (Object.entries(gradeContent) as [GradeKey, GradeContent][]).reduce<
      Record<GradeKey, SearchableVocabularyTopic[]>
    >((result, [grade, content]) => {
      result[grade] = content.vocabularyTopics.map((topic) => ({
        ...topic,
        grade,
        words: topic.words.map((word) => ({
          ...word,
          source: 'system' as const,
        })),
      }))
      return result
    }, {} as Record<GradeKey, SearchableVocabularyTopic[]>)

    teacherVocabularyEntries.forEach((entry) => {
      const grade = entry.grade_key as GradeKey

      if (!baseMap[grade]) {
        return
      }

      let topic = baseMap[grade].find((item) => item.key === entry.topic_key)

      if (!topic) {
        topic = {
          key: entry.topic_key,
          title: entry.topic_title,
          grade,
          words: [],
        }
        baseMap[grade] = [...baseMap[grade], topic]
      }

      const existingIndex = topic.words.findIndex(
        (word) =>
          normalizeWordKey(word.word) === normalizeWordKey(entry.word) &&
          (word.source !== 'teacher' || word.id === entry.id),
      )

      const nextWord = {
        id: entry.id,
        word: entry.word,
        ipa: entry.ipa,
        meaning: entry.meaning,
        example: entry.example,
        source: entry.source,
      } as const

      if (existingIndex >= 0) {
        if (topic.words[existingIndex].source === 'teacher') {
          topic.words = topic.words.map((word, index) => (index === existingIndex ? nextWord : word))
        }
      } else {
        topic.words = [...topic.words, nextWord]
      }
    })

    return baseMap
  }, [teacherVocabularyEntries])

  const selectedGradeTopics = mergedVocabularyTopicsByGrade[selectedGrade] ?? []

  const searchableTopics = useMemo<SearchableVocabularyTopic[]>(() => {
    if (!searchKeyword.trim()) {
      return selectedGradeTopics
    }

    return (Object.entries(mergedVocabularyTopicsByGrade) as [GradeKey, SearchableVocabularyTopic[]][])
      .flatMap(([, topics]) => topics)
  }, [mergedVocabularyTopicsByGrade, searchKeyword, selectedGradeTopics])

  const filteredVocabularyTopics = useMemo(
    () =>
      searchableTopics
        .map((topic) => ({
          ...topic,
          words: topic.words.filter((word) => matchesVocabulary(word, searchKeyword)),
        }))
        .filter((topic) => topic.words.length > 0),
    [searchKeyword, searchableTopics],
  )

  const totalMatchedWords = useMemo(
    () => filteredVocabularyTopics.reduce((total, topic) => total + topic.words.length, 0),
    [filteredVocabularyTopics],
  )

  const activeTopicKey = useMemo(
    () => currentGrade.units[0]?.vocabularyTopicKey ?? selectedGradeTopics[0]?.key ?? '',
    [currentGrade.units, selectedGradeTopics],
  )

  const selectedTopicLookup = useMemo<Record<string, string>>(
    () => Object.fromEntries(selectedGradeTopics.map((topic) => [topic.key, topic.title])),
    [selectedGradeTopics],
  )

  const selectedVocabulary = useMemo<SelectedVocabulary | null>(() => {
    for (const topic of filteredVocabularyTopics) {
      const matchedWord = topic.words.find(
        (word) => `${topic.grade}-${topic.key}-${word.word}` === selectedVocabularyKey,
      )

      if (matchedWord) {
        return {
          ...matchedWord,
          grade: topic.grade,
          topicTitle: topic.title,
          topicKey: topic.key,
        }
      }
    }

    for (const topic of filteredVocabularyTopics) {
      const firstWord = topic.words[0]

      if (firstWord) {
        return {
          ...firstWord,
          grade: topic.grade,
          topicTitle: topic.title,
          topicKey: topic.key,
        }
      }
    }

    return null
  }, [filteredVocabularyTopics, selectedVocabularyKey])

  return {
    mergedVocabularyTopicsByGrade,
    selectedGradeTopics,
    filteredVocabularyTopics,
    totalMatchedWords,
    activeTopicKey,
    selectedTopicLookup,
    selectedVocabulary,
  }
}
