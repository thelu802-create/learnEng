import type { FormInstance } from 'antd'
import type { GradeKey, VocabularyTopic, VocabularyWord } from '../../types'

export interface DisplayVocabularyWord extends VocabularyWord {
  id?: string
  source: 'system' | 'teacher'
}

export interface SearchableVocabularyTopic extends VocabularyTopic {
  grade: GradeKey
  words: DisplayVocabularyWord[]
}

export interface SelectedVocabulary extends DisplayVocabularyWord {
  grade: GradeKey
  topicTitle: string
  topicKey: string
}

export interface AddWordFormValues {
  topicKey: string
  word: string
  ipa?: string
  meaning: string
  example?: string
}

export interface ImportVocabularyRow {
  topicKey: string
  topicTitle: string
  word: string
  ipa: string
  meaning: string
  example: string
}

export interface SpreadsheetRow {
  topic_key?: string
  topic_title?: string
  word?: string
  ipa?: string
  meaning?: string
  example?: string
}

export interface LessonsCopy {
  overviewEyebrow: string
  unitSummary: string
  openVocabulary: string
  linkedTopic: string
  focusLabel: string
  practiceLabel: string
  projectLabel: string
  vocabularyEyebrow: string
  vocabularyTitle: string
  wordCountLabel: string
  detailTitle: string
  detailSubtitle: string
  notesTitle: string
  notesCopy: string
  notesPlaceholder: string
  saveNote: string
  notesNeedLogin: string
  notesNotReady: string
  notesSaved: string
  notesLoadError: string
  notesSaveError: string
  toolsTitle: string
  toolsCopy: string
  toolsNeedLogin: string
  addWord: string
  importWords: string
  downloadTemplate: string
  downloadTemplateCsv: string
  downloadTemplateExcel: string
  loadWordsError: string
  saveWordSuccess: string
  saveWordError: string
  duplicateWord: string
  editWord: string
  updateWord: string
  deleteWord: string
  deleteConfirmTitle: string
  deleteConfirmContent: string
  deleteSuccess: string
  deleteError: string
  importSuccess: string
  importPartial: string
  importEmpty: string
  importReadError: string
  importTitle: string
  importCopy: string
  importSelectedFile: string
  importRowsReady: string
  importHint: string
  importRun: string
  addWordTitle: string
  addWordCopy: string
  fieldTopic: string
  fieldWord: string
  fieldIpa: string
  fieldMeaning: string
  fieldExample: string
  fileButton: string
  teacherTag: string
  autoFillIpa: string
  autoFillIpaHint: string
}

export interface VocabularyAddModalProps {
  open: boolean
  onCancel: () => void
  onSubmit: () => void
  confirmLoading: boolean
  copy: LessonsCopy
  language: 'vi' | 'en'
  form: FormInstance<AddWordFormValues>
  autoFillIpa: boolean
  onAutoFillIpaChange: (checked: boolean) => void
  topics: Array<{ key: string; title: string }>
  mode: 'create' | 'edit'
  submitLabel: string
}

export interface VocabularyImportModalProps {
  open: boolean
  onCancel: () => void
  onSubmit: () => void
  confirmLoading: boolean
  copy: LessonsCopy
  autoFillIpa: boolean
  onAutoFillIpaChange: (checked: boolean) => void
  onDownloadCsv: () => void
  onDownloadExcel: () => void
  onFileSelect: (file: File) => void | Promise<void>
  importFileName: string
  importRowsCount: number
}
