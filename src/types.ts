export type GradeKey = 'Lớp 6' | 'Lớp 7' | 'Lớp 8' | 'Lớp 9'
export type Language = 'vi' | 'en'
export type ThemeMode = 'light' | 'dark'
export type FontSizeMode = 'sm' | 'md' | 'lg'

export type MenuKey = 'home' | 'lessons' | 'practice' | 'progress' | 'help'
export type MenuIconKey = 'rocket' | 'book' | 'play' | 'rise' | 'help'

export interface MenuItemConfig {
  key: MenuKey
  icon: MenuIconKey
  label: string
}

export interface VocabularyWord {
  word: string
  ipa: string
  meaning: string
  example: string
}

export interface VocabularyTopic {
  key: string
  title: string
  words: VocabularyWord[]
}

export interface UnitContent {
  key: string
  title: string
  grammar: {
    focus: string
  }
  vocabulary: {
    summary: string
    topicKey: string
  }
  practice: string[]
  project: string
  vocabularyTopicKey: string
}

export interface GradeContent {
  level: string
  overview: string
  skills: string[]
  units: UnitContent[]
  vocabularyTopics: VocabularyTopic[]
  exercises: string[]
  project: string
  progress: number
}

export type GradeContentMap = Record<GradeKey, GradeContent>

export interface VocabularyApiPayload {
  topicKey: string
  word: string
  ipa: string
  meaning: string
  example: string
}

export interface VocabularyApiResponse {
  topics: VocabularyTopic[]
  filePath: string
}
