import { useCallback, useEffect, useState } from 'react'
import type { FormInstance } from 'antd'
import type { MessageInstance } from 'antd/es/message/interface'
import { listTeacherNotes } from '../../../lib/supabase/notesApi'
import type { VocabularyEntryRecord } from '../../../lib/supabase/types'
import { listVocabularyEntries } from '../../../lib/supabase/vocabularyEntriesApi'
import type {
  AddWordFormValues,
  ImportVocabularyRow,
  LessonsCopy,
} from '../types'
import {
  normalizeSpreadsheetRows,
  parseVocabularyCsv,
  readSpreadsheetRows,
} from '../utils'

interface UseLessonsTeacherToolsOptions {
  configured: boolean
  userId?: string
  lessonsCopy: LessonsCopy
  t: (key: string, params?: Record<string, string | number>) => string
  message: MessageInstance
  signInWithGithub: () => Promise<unknown>
  addWordForm: FormInstance<AddWordFormValues>
}

export function useLessonsTeacherTools({
  configured,
  userId,
  lessonsCopy,
  t,
  message,
  signInWithGithub,
  addWordForm,
}: UseLessonsTeacherToolsOptions) {
  const [topicNotes, setTopicNotes] = useState<Record<string, string>>({})
  const [isNotesLoading, setIsNotesLoading] = useState(false)
  const [teacherVocabularyEntries, setTeacherVocabularyEntries] = useState<VocabularyEntryRecord[]>([])
  const [isVocabularyLoading, setIsVocabularyLoading] = useState(false)
  const [isAddWordOpen, setIsAddWordOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isSavingVocabulary, setIsSavingVocabulary] = useState(false)
  const [importRows, setImportRows] = useState<ImportVocabularyRow[]>([])
  const [importFileName, setImportFileName] = useState('')
  const [autoFillSingleIpa, setAutoFillSingleIpa] = useState(true)
  const [autoFillImportIpa, setAutoFillImportIpa] = useState(true)
  const [editingVocabularyId, setEditingVocabularyId] = useState<string | null>(null)

  useEffect(() => {
    if (!configured || !userId) {
      setTopicNotes({})
      return
    }

    let active = true
    setIsNotesLoading(true)

    listTeacherNotes(userId)
      .then((notes) => {
        if (!active) return

        const mappedNotes = notes.reduce<Record<string, string>>((result, note) => {
          result[`${note.grade_key}-${note.topic_key}`] = note.content
          return result
        }, {})

        setTopicNotes(mappedNotes)
      })
      .catch(() => {
        if (active) {
          message.error(lessonsCopy.notesLoadError)
        }
      })
      .finally(() => {
        if (active) {
          setIsNotesLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [configured, lessonsCopy.notesLoadError, message, userId])

  useEffect(() => {
    if (!configured || !userId) {
      setTeacherVocabularyEntries([])
      return
    }

    let active = true
    setIsVocabularyLoading(true)

    listVocabularyEntries(userId)
      .then((entries) => {
        if (active) {
          setTeacherVocabularyEntries(entries.filter((entry) => entry.source === 'teacher'))
        }
      })
      .catch(() => {
        if (active) {
          message.error(lessonsCopy.loadWordsError)
        }
      })
      .finally(() => {
        if (active) {
          setIsVocabularyLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [configured, lessonsCopy.loadWordsError, message, userId])

  useEffect(() => {
    if (!isAddWordOpen) {
      return
    }

    if (editingVocabularyId) {
      const editingEntry = teacherVocabularyEntries.find((entry) => entry.id === editingVocabularyId)

      if (editingEntry) {
        addWordForm.setFieldsValue({
          topicKey: editingEntry.topic_key,
          word: editingEntry.word,
          ipa: editingEntry.ipa,
          meaning: editingEntry.meaning,
          example: editingEntry.example,
        })
        return
      }
    }

    addWordForm.setFieldsValue({
      topicKey: '',
      word: '',
      ipa: '',
      meaning: '',
      example: '',
    })
  }, [addWordForm, editingVocabularyId, isAddWordOpen, teacherVocabularyEntries])

  const handleGithubSignIn = useCallback(async () => {
    try {
      await signInWithGithub()
    } catch {
      message.error(t('planner.signInError'))
    }
  }, [message, signInWithGithub, t])

  const handleOpenAddWord = useCallback(() => {
    setEditingVocabularyId(null)
    setIsAddWordOpen(true)
  }, [])

  const handleCloseAddWord = useCallback(() => {
    setIsAddWordOpen(false)
    setEditingVocabularyId(null)
    addWordForm.resetFields()
  }, [addWordForm])

  const handleOpenImport = useCallback(() => {
    setIsImportOpen(true)
  }, [])

  const handleCloseImport = useCallback(() => {
    setIsImportOpen(false)
    setImportRows([])
    setImportFileName('')
  }, [])

  const handleImportFile = useCallback(async (file: File) => {
    try {
      const fileName = file.name.toLowerCase()
      let rows: ImportVocabularyRow[] = []

      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const buffer = await file.arrayBuffer()
        rows = normalizeSpreadsheetRows(await readSpreadsheetRows(buffer))
      } else {
        rows = parseVocabularyCsv(await file.text())
      }

      setImportRows(rows)
      setImportFileName(file.name)
    } catch {
      setImportRows([])
      setImportFileName('')
      message.error(lessonsCopy.importReadError)
    }
  }, [lessonsCopy.importReadError, message])

  return {
    topicNotes,
    isNotesLoading,
    teacherVocabularyEntries,
    isVocabularyLoading,
    isAddWordOpen,
    isImportOpen,
    isSavingVocabulary,
    importRows,
    importFileName,
    autoFillSingleIpa,
    setAutoFillSingleIpa,
    autoFillImportIpa,
    setAutoFillImportIpa,
    editingVocabularyId,
    handleGithubSignIn,
    handleOpenAddWord,
    handleCloseAddWord,
    handleOpenImport,
    handleCloseImport,
    handleImportFile,
    setTeacherVocabularyEntries,
    setTopicNotes,
    setIsSavingVocabulary,
    setEditingVocabularyId,
    setIsAddWordOpen,
  }
}
