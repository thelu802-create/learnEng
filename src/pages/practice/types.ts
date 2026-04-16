import type { GradeContent, GradeKey, VocabularyWord } from '../../types'

export type PracticeModeKey = 'meaning' | 'fill' | 'match'
export type PracticeSectionKey = 'word' | 'generator'
export type GeneratorViewKey = 'create' | 'take'

export interface PracticeMode {
  key: PracticeModeKey
  title: string
  description: string
  available: boolean
}

export interface PracticePageProps {
  selectedGrade: GradeKey
  currentGrade: GradeContent
  learningSteps: string[]
}

export interface PracticeChoiceSessionProps {
  selectedGrade: GradeKey
  vocabularyPool: PracticeVocabularyWord[]
  selectedMode: 'meaning' | 'fill'
}

export interface PracticeMatchSessionProps {
  selectedGrade: GradeKey
  vocabularyPool: PracticeVocabularyWord[]
}

export interface PassageGeneratorWorkbenchProps {
  distractorPool: string[]
}

export interface PracticeVocabularyWord extends VocabularyWord {
  topicKey: string
  topicTitle: string
}

export interface ChoiceQuestion {
  id: string
  mode: 'meaning' | 'fill'
  prompt: string
  word: string
  ipa: string
  meaning: string
  example: string
  topicTitle: string
  options: string[]
  optionDetails: Record<string, string>
  correctAnswer: string
}

export interface MatchRound {
  id: string
  pairs: PracticeVocabularyWord[]
  options: string[]
  topicTitle: string
}

export interface PassageQuestion {
  id: string
  sentence: string
  prompt: string
  answer: string
  options: string[]
}

export type PassageWordCategory = 'verb' | 'noun' | 'adjective' | 'adverb' | 'other'

export interface PassageCandidate {
  word: string
  category: PassageWordCategory
  score: number
}
