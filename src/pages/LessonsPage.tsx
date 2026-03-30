import { useEffect, useMemo, useState } from 'react'
import {
  BookOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  PlusOutlined,
  ReadOutlined,
  RightOutlined,
  SearchOutlined,
  SoundOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  List,
  Popconfirm,
  Row,
  Space,
  Spin,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd'
import type { TabsProps } from 'antd'
import { useSupabaseAuth } from '../components/providers/SupabaseAuthProvider'
import { gradeContent } from '../data'
import { useI18n } from '../i18n'
import {
  createVocabularyEntries,
  deleteVocabularyEntry,
  listTeacherNotes,
  listVocabularyEntries,
  updateVocabularyEntry,
  upsertTeacherNote,
} from '../lib/supabase/teacherData'
import { lookupIpaMap } from '../lib/vocabularyApi'
import type { VocabularyEntryRecord } from '../lib/supabase/types'
import type { GradeContent, GradeKey } from '../types'
import VocabularyAddModal from './lessons/VocabularyAddModal'
import VocabularyImportModal from './lessons/VocabularyImportModal'
import type {
  AddWordFormValues,
  ImportVocabularyRow,
  LessonsCopy,
  SearchableVocabularyTopic,
  SelectedVocabulary,
} from './lessons/types'
import {
  downloadCsvFile,
  downloadXlsxFile,
  matchesVocabulary,
  normalizeSpreadsheetRows,
  normalizeWordKey,
  parseVocabularyCsv,
  readSpreadsheetRows,
  slugifyTopicKey,
} from './lessons/utils'

const { Title, Paragraph, Text } = Typography

interface LessonsPageProps {
  selectedGrade: GradeKey
  currentGrade: GradeContent
}

function LessonsPage({ selectedGrade, currentGrade }: LessonsPageProps) {
  const { t, gradeLabel, language } = useI18n()
  const { configured, signInWithGithub, user } = useSupabaseAuth()
  const [addWordForm] = Form.useForm<AddWordFormValues>()
  const [selectedVocabularyKey, setSelectedVocabularyKey] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [activeTabKey, setActiveTabKey] = useState('units')
  const [topicNotes, setTopicNotes] = useState<Record<string, string>>({})
  const [noteDraft, setNoteDraft] = useState('')
  const [isNotesLoading, setIsNotesLoading] = useState(false)
  const [isSavingNote, setIsSavingNote] = useState(false)
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

  const lessonsCopy: LessonsCopy =
    language === 'en'
      ? {
          overviewEyebrow: 'Teaching topics',
          unitSummary: 'ready-to-teach units',
          openVocabulary: 'Open vocabulary',
          linkedTopic: 'Linked topic',
          focusLabel: 'Teaching focus',
          practiceLabel: 'Class activity',
          projectLabel: 'Suggested project',
          vocabularyEyebrow: 'Vocabulary board',
          vocabularyTitle: 'Search by topic and open a word quickly',
          wordCountLabel: 'words ready',
          detailTitle: 'Word details',
          detailSubtitle: 'Meaning, pronunciation, and a sample sentence',
          notesTitle: 'Teacher notes',
          notesCopy: 'Save a short teaching note for the selected topic.',
          notesPlaceholder: 'Add objectives, reminders, or quick in-class prompts...',
          saveNote: 'Save note',
          notesNeedLogin: 'Sign in with GitHub to save teaching notes for this topic.',
          notesNotReady: 'Supabase is not configured yet in this environment.',
          notesSaved: 'Note saved successfully.',
          notesLoadError: 'Unable to load teacher notes.',
          notesSaveError: 'Unable to save note.',
          toolsTitle: 'Vocabulary tools',
          toolsCopy: 'Add a single word or import a CSV/Excel file for the selected grade.',
          toolsNeedLogin: 'Sign in with GitHub to add and import vocabulary.',
          addWord: 'Add word',
          importWords: 'Import words',
          downloadTemplate: 'Download template',
          downloadTemplateCsv: 'CSV template',
          downloadTemplateExcel: 'Excel template',
          loadWordsError: 'Unable to load teacher vocabulary.',
          saveWordSuccess: 'New vocabulary added successfully.',
          saveWordError: 'Unable to save vocabulary.',
          duplicateWord: 'This word already exists in the selected topic.',
          editWord: 'Edit',
          updateWord: 'Save changes',
          deleteWord: 'Delete',
          deleteConfirmTitle: 'Delete this teacher-added word?',
          deleteConfirmContent: 'This action cannot be undone.',
          deleteSuccess: 'Vocabulary deleted.',
          deleteError: 'Unable to delete vocabulary.',
          importSuccess: 'Imported {count} new words.',
          importPartial: 'Imported {count} words. Skipped {skipped} duplicate or invalid rows.',
          importEmpty: 'There are no new rows to import.',
          importReadError: 'Unable to read the import file.',
          importTitle: 'Import vocabulary',
          importCopy: 'Use the template file, then upload it back here for the current grade.',
          importSelectedFile: 'Selected file',
          importRowsReady: '{count} rows ready to import.',
          importHint:
            'Required columns: topic_key, word, meaning. Optional columns: topic_title, ipa, example.',
          importRun: 'Import now',
          addWordTitle: 'Add a vocabulary item',
          addWordCopy: 'This word will be added to the selected topic for the current grade.',
          fieldTopic: 'Topic',
          fieldWord: 'Word',
          fieldIpa: 'IPA',
          fieldMeaning: 'Meaning',
          fieldExample: 'Example sentence',
          fileButton: 'Choose file',
          teacherTag: 'Teacher added',
          autoFillIpa: 'Auto-fill IPA',
          autoFillIpaHint: 'If IPA is blank, try filling it automatically from the dictionary API.',
        }
      : {
          overviewEyebrow: 'Chủ điểm giảng dạy',
          unitSummary: 'chủ điểm sẵn để triển khai',
          openVocabulary: 'Xem từ vựng',
          linkedTopic: 'Chủ điểm liên kết',
          focusLabel: 'Trọng tâm bài',
          practiceLabel: 'Hoạt động trên lớp',
          projectLabel: 'Gợi ý dự án',
          vocabularyEyebrow: 'Bảng từ vựng',
          vocabularyTitle: 'Tra cứu theo chủ điểm và mở nhanh từng từ',
          wordCountLabel: 'từ sẵn dùng',
          detailTitle: 'Chi tiết từ vựng',
          detailSubtitle: 'Nghĩa, phiên âm và câu ví dụ',
          notesTitle: 'Ghi chú giáo viên',
          notesCopy: 'Lưu nhanh mục tiêu bài dạy, lưu ý hoặc gợi ý triển khai cho chủ điểm đang chọn.',
          notesPlaceholder: 'Ghi mục tiêu, nhắc nhở hoặc hoạt động triển khai trên lớp...',
          saveNote: 'Lưu ghi chú',
          notesNeedLogin: 'Hãy đăng nhập GitHub trong phần Cài đặt để lưu ghi chú lên Supabase.',
          notesNotReady: 'Môi trường này chưa cấu hình Supabase.',
          notesSaved: 'Đã lưu ghi chú.',
          notesLoadError: 'Không tải được ghi chú giáo viên.',
          notesSaveError: 'Không lưu được ghi chú.',
          toolsTitle: 'Công cụ từ vựng',
          toolsCopy: 'Thêm nhanh một từ hoặc import cả file CSV/Excel cho khối đang chọn.',
          toolsNeedLogin: 'Hãy đăng nhập GitHub để thêm và import từ vựng.',
          addWord: 'Thêm từ',
          importWords: 'Import từ',
          downloadTemplate: 'Tải file mẫu',
          downloadTemplateCsv: 'Mẫu CSV',
          downloadTemplateExcel: 'Mẫu Excel',
          loadWordsError: 'Không tải được từ vựng giáo viên.',
          saveWordSuccess: 'Đã thêm từ vựng mới.',
          saveWordError: 'Không lưu được từ vựng.',
          duplicateWord: 'Từ này đã có trong chủ điểm đang chọn.',
          editWord: 'Sửa',
          updateWord: 'Lưu thay đổi',
          deleteWord: 'Xóa',
          deleteConfirmTitle: 'Xóa từ do giáo viên thêm?',
          deleteConfirmContent: 'Thao tác này không thể hoàn tác.',
          deleteSuccess: 'Đã xóa từ vựng.',
          deleteError: 'Không xóa được từ vựng.',
          importSuccess: 'Đã import {count} từ mới.',
          importPartial: 'Đã import {count} từ. Bỏ qua {skipped} dòng trùng hoặc chưa hợp lệ.',
          importEmpty: 'Không có dòng mới nào để import.',
          importReadError: 'Không đọc được file import.',
          importTitle: 'Import từ vựng',
          importCopy: 'Tải file mẫu, điền dữ liệu rồi upload lại cho khối đang chọn.',
          importSelectedFile: 'File đã chọn',
          importRowsReady: 'Có {count} dòng sẵn sàng để import.',
          importHint: 'Bắt buộc: topic_key, word, meaning. Tùy chọn: topic_title, ipa, example.',
          importRun: 'Bắt đầu import',
          addWordTitle: 'Thêm một mục từ vựng',
          addWordCopy: 'Từ này sẽ được thêm vào chủ điểm đang chọn của khối hiện tại.',
          fieldTopic: 'Chủ điểm',
          fieldWord: 'Từ vựng',
          fieldIpa: 'Phiên âm',
          fieldMeaning: 'Nghĩa',
          fieldExample: 'Câu ví dụ',
          fileButton: 'Chọn file',
          teacherTag: 'Giáo viên thêm',
          autoFillIpa: 'Tự động điền IPA',
          autoFillIpaHint: 'Nếu ô IPA đang trống, hệ thống sẽ thử tự điền từ dictionary API.',
        }

  const notesNeedLoginText =
    language === 'en'
      ? lessonsCopy.notesNeedLogin
      : 'Hãy đăng nhập GitHub để lưu ghi chú giảng dạy cho chủ điểm này.'
  const toolsNeedLoginText =
    language === 'en'
      ? lessonsCopy.toolsNeedLogin
      : 'Hãy đăng nhập GitHub để thêm và import từ vựng.'
  const loginActionText = language === 'en' ? 'Sign in with GitHub' : 'Đăng nhập GitHub'

  const handleGithubSignIn = async () => {
    try {
      await signInWithGithub()
    } catch {
      message.error(language === 'en' ? 'Unable to start GitHub sign-in.' : 'Không thể bắt đầu đăng nhập GitHub.')
    }
  }

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

  useEffect(() => {
    if (!configured || !user) {
      setTopicNotes({})
      return
    }

    let active = true
    setIsNotesLoading(true)

    listTeacherNotes(user.id)
      .then((notes) => {
        if (!active) {
          return
        }

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
  }, [configured, lessonsCopy.notesLoadError, user])

  useEffect(() => {
    if (!configured || !user) {
      setTeacherVocabularyEntries([])
      return
    }

    let active = true
    setIsVocabularyLoading(true)

    listVocabularyEntries(user.id)
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
  }, [configured, lessonsCopy.loadWordsError, user])

  useEffect(() => {
    const noteKey = `${selectedGrade}-${activeTopicKey}`
    setNoteDraft(topicNotes[noteKey] ?? '')
  }, [activeTopicKey, selectedGrade, topicNotes])

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
      topicKey: activeTopicKey,
      word: '',
      ipa: '',
      meaning: '',
      example: '',
    })
  }, [activeTopicKey, addWordForm, editingVocabularyId, isAddWordOpen, teacherVocabularyEntries])

  const handleSaveNote = async () => {
    if (!user || !activeTopicKey) {
      return
    }

    try {
      setIsSavingNote(true)
      await upsertTeacherNote({
        userId: user.id,
        gradeKey: selectedGrade,
        topicKey: activeTopicKey,
        content: noteDraft,
      })

      setTopicNotes((currentNotes) => ({
        ...currentNotes,
        [`${selectedGrade}-${activeTopicKey}`]: noteDraft,
      }))
      message.success(lessonsCopy.notesSaved)
    } catch {
      message.error(lessonsCopy.notesSaveError)
    } finally {
      setIsSavingNote(false)
    }
  }

  const handleSubmitAddWord = async () => {
    if (!user) {
      return
    }

    const values = await addWordForm.validateFields()
    const editingEntry =
      editingVocabularyId != null
        ? teacherVocabularyEntries.find((entry) => entry.id === editingVocabularyId) ?? null
        : null
    const topicTitle = selectedTopicLookup[values.topicKey]
    const trimmedWord = values.word.trim()
    const normalizedWord = normalizeWordKey(trimmedWord)

    if (!topicTitle) {
      message.error(language === 'en' ? 'Please choose a valid topic.' : 'Hãy chọn một chủ điểm hợp lệ.')
      return
    }

    const existingTopic = selectedGradeTopics.find((topic) => topic.key === values.topicKey)
    const isDuplicateWord = existingTopic?.words.some((word) => {
      if (normalizeWordKey(word.word) !== normalizedWord) {
        return false
      }

      if (word.source !== 'teacher') {
        return true
      }

      return word.id !== editingEntry?.id
    })

    if (isDuplicateWord) {
      message.warning(lessonsCopy.duplicateWord)
      return
    }

    try {
      setIsSavingVocabulary(true)
      const resolvedIpa =
        values.ipa?.trim() ||
        (autoFillSingleIpa
          ? await lookupIpaMap([trimmedWord]).then((ipaMap) => ipaMap[trimmedWord] || '').catch(() => '')
          : '')

      if (editingEntry) {
        const updatedEntry = await updateVocabularyEntry({
          id: editingEntry.id,
          userId: user.id,
          gradeKey: selectedGrade,
          topicKey: values.topicKey,
          topicTitle,
          word: trimmedWord,
          ipa: resolvedIpa,
          meaning: values.meaning.trim(),
          example: values.example?.trim() ?? '',
        })

        setTeacherVocabularyEntries((currentEntries) =>
          currentEntries.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry)),
        )
        message.success(
          language === 'en' ? 'Vocabulary updated successfully.' : 'Đã cập nhật từ vựng.',
        )
      } else {
        const [createdEntry] = await createVocabularyEntries([
          {
            userId: user.id,
            gradeKey: selectedGrade,
            topicKey: values.topicKey,
            topicTitle,
            word: trimmedWord,
            ipa: resolvedIpa,
            meaning: values.meaning.trim(),
            example: values.example?.trim() ?? '',
          },
        ])

        if (createdEntry) {
          setTeacherVocabularyEntries((currentEntries) => [...currentEntries, createdEntry])
        }
        message.success(lessonsCopy.saveWordSuccess)
      }

      setSelectedVocabularyKey(`${selectedGrade}-${values.topicKey}-${trimmedWord}`)
      setActiveTabKey('vocabulary')
      setSearchKeyword('')
      setIsAddWordOpen(false)
      setEditingVocabularyId(null)
      addWordForm.resetFields()
    } catch {
      message.error(lessonsCopy.saveWordError)
    } finally {
      setIsSavingVocabulary(false)
    }
  }

  const handleEditVocabulary = () => {
    if (!selectedVocabulary?.id || selectedVocabulary.source !== 'teacher') {
      return
    }

    setEditingVocabularyId(selectedVocabulary.id)
    setIsAddWordOpen(true)
  }

  const handleDeleteVocabulary = async () => {
    if (!user || !selectedVocabulary?.id || selectedVocabulary.source !== 'teacher') {
      return
    }

    try {
      setIsSavingVocabulary(true)
      await deleteVocabularyEntry(selectedVocabulary.id, user.id)
      setTeacherVocabularyEntries((currentEntries) =>
        currentEntries.filter((entry) => entry.id !== selectedVocabulary.id),
      )
      setSelectedVocabularyKey('')
      message.success(lessonsCopy.deleteSuccess)
    } catch {
      message.error(lessonsCopy.deleteError)
    } finally {
      setIsSavingVocabulary(false)
    }
  }

  const getTemplateRows = () => {
    const fallbackTopicKey = activeTopicKey || 'school'
    const fallbackTopicTitle = selectedTopicLookup[fallbackTopicKey] || 'School'
    return [
      {
        topic_key: fallbackTopicKey,
        topic_title: fallbackTopicTitle,
        word: 'classmate',
        ipa: '',
        meaning: language === 'en' ? 'classmate' : 'bạn cùng lớp',
        example: 'My classmate sits next to me.',
      },
      {
        topic_key: fallbackTopicKey,
        topic_title: fallbackTopicTitle,
        word: 'timetable',
        ipa: '',
        meaning: language === 'en' ? 'timetable' : 'thời khóa biểu',
        example: 'Our timetable is on the classroom wall.',
      },
    ]
  }

  const handleDownloadTemplateCsv = () => {
    const templateRows = getTemplateRows()
    const csvCell = (value: string) => `"${value.replaceAll('"', '""')}"`
    const sampleContent = [
      'topic_key,topic_title,word,ipa,meaning,example',
      ...templateRows.map((row) =>
        [
          csvCell(row.topic_key),
          csvCell(row.topic_title),
          csvCell(row.word),
          csvCell(row.ipa),
          csvCell(row.meaning),
          csvCell(row.example),
        ].join(','),
      ),
    ].join('\n')

    downloadCsvFile(
      `vocabulary-template-${selectedGrade.replace(/\s+/g, '-').toLowerCase()}.csv`,
      sampleContent,
    )
  }

  const handleDownloadTemplateExcel = () => {
    downloadXlsxFile(
      `vocabulary-template-${selectedGrade.replace(/\s+/g, '-').toLowerCase()}.xlsx`,
      getTemplateRows(),
      'Vocabulary Template',
    )
  }

  const handleImportFile = async (file: File) => {
    try {
      const fileName = file.name.toLowerCase()
      let rows: ImportVocabularyRow[] = []

      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const buffer = await file.arrayBuffer()
        rows = normalizeSpreadsheetRows(readSpreadsheetRows(buffer))
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
  }

  const handleImportVocabulary = async () => {
    if (!user) {
      return
    }

    const existingKeys = new Set(
      selectedGradeTopics.flatMap((topic) =>
        topic.words.map((word) => `${topic.key}::${normalizeWordKey(word.word)}`),
      ),
    )

    const rowsToCreate = importRows.reduce<
      Array<{
        userId: string
        gradeKey: string
        topicKey: string
        topicTitle: string
        word: string
        ipa: string
        meaning: string
        example: string
      }>
    >((result, row) => {
      const topicKey = slugifyTopicKey(row.topicKey)
      const topicTitle = row.topicTitle.trim() || selectedTopicLookup[topicKey] || ''
      const normalizedWord = normalizeWordKey(row.word)
      const dedupeKey = `${topicKey}::${normalizedWord}`

      if (!topicKey || !topicTitle || !normalizedWord || !row.meaning.trim() || existingKeys.has(dedupeKey)) {
        return result
      }

      existingKeys.add(dedupeKey)
      result.push({
        userId: user.id,
        gradeKey: selectedGrade,
        topicKey,
        topicTitle,
        word: row.word.trim(),
        ipa: row.ipa.trim(),
        meaning: row.meaning.trim(),
        example: row.example.trim(),
      })
      return result
    }, [])

    if (rowsToCreate.length === 0) {
      message.info(lessonsCopy.importEmpty)
      return
    }

    try {
      setIsSavingVocabulary(true)
      const missingIpaWords = [...new Set(rowsToCreate.filter((row) => !row.ipa).map((row) => row.word))]
      const ipaMap =
        autoFillImportIpa && missingIpaWords.length > 0
          ? await lookupIpaMap(missingIpaWords).catch(() => ({} as Record<string, string>))
          : {}

      const createdEntries = await createVocabularyEntries(
        rowsToCreate.map((row) => ({
          ...row,
          ipa: row.ipa || ipaMap[row.word] || '',
        })),
      )

      setTeacherVocabularyEntries((currentEntries) => [...currentEntries, ...createdEntries])
      setIsImportOpen(false)
      setImportRows([])
      setImportFileName('')

      const skippedCount = importRows.length - rowsToCreate.length
      if (skippedCount > 0) {
        message.success(
          lessonsCopy.importPartial
            .replace('{count}', String(createdEntries.length))
            .replace('{skipped}', String(skippedCount)),
        )
      } else {
        message.success(lessonsCopy.importSuccess.replace('{count}', String(createdEntries.length)))
      }
    } catch {
      message.error(lessonsCopy.saveWordError)
    } finally {
      setIsSavingVocabulary(false)
    }
  }

  const tabItems: TabsProps['items'] = [
    {
      key: 'units',
      label: t('lessons.unitsTab'),
      children: (
        <Space direction="vertical" size={18} className="full-width">
          <div className="lesson-units-summary">
            <Text className="page-kicker">{lessonsCopy.overviewEyebrow}</Text>
            <Title level={4} className="lesson-units-summary-title">
              {currentGrade.units.length} {lessonsCopy.unitSummary}
            </Title>
          </div>

          <Row gutter={[16, 16]}>
            {currentGrade.units.map((unit) => {
              const topic = selectedGradeTopics.find((item) => item.key === unit.vocabularyTopicKey)
              const firstTopicWord = topic?.words[0]

              return (
                <Col xs={24} lg={12} key={unit.key}>
                  <Card className="unit-card lesson-topic-card" bordered={false}>
                    <Space direction="vertical" size={14} className="full-width">
                      <div className="unit-head">
                        <div>
                          <Text className="page-kicker">{lessonsCopy.linkedTopic}</Text>
                          <Title level={4} className="lesson-topic-title">
                            {unit.title}
                          </Title>
                        </div>
                        {topic ? (
                          <Tag bordered={false} className="topic-chip">
                            {topic.title}
                          </Tag>
                        ) : null}
                      </div>

                      <div className="lesson-topic-brief">
                        <div className="lesson-topic-pill">
                          <Text className="lesson-topic-pill-label">{t('lessons.grammar')}</Text>
                          <Text>{unit.grammar.focus}</Text>
                        </div>
                        <div className="lesson-topic-pill">
                          <Text className="lesson-topic-pill-label">{t('lessons.vocabulary')}</Text>
                          <Text>{unit.vocabulary.summary}</Text>
                        </div>
                      </div>

                      <div className="lesson-topic-points">
                        {topic ? (
                          <div className="lesson-topic-point">
                            <BookOutlined />
                            <Text>
                              {topic.words.length} {t('lessons.linkedWords')}
                            </Text>
                          </div>
                        ) : null}
                        {unit.practice.length > 0 ? (
                          <div className="lesson-topic-point">
                            <ReadOutlined />
                            <Text>
                              <span className="label">{lessonsCopy.practiceLabel}:</span>{' '}
                              {unit.practice[0]}
                            </Text>
                          </div>
                        ) : null}
                        {unit.project ? (
                          <div className="lesson-topic-point">
                            <CheckCircleOutlined />
                            <Text>
                              <span className="label">{lessonsCopy.projectLabel}:</span>{' '}
                              {unit.project}
                            </Text>
                          </div>
                        ) : null}
                      </div>

                      <div className="lesson-topic-actions">
                        <Button
                          type="primary"
                          icon={<RightOutlined />}
                          iconPosition="end"
                          disabled={!topic || !firstTopicWord}
                          onClick={() => {
                            if (!topic || !firstTopicWord) {
                              return
                            }

                            setSelectedVocabularyKey(`${selectedGrade}-${topic.key}-${firstTopicWord.word}`)
                            setSearchKeyword('')
                            setActiveTabKey('vocabulary')
                          }}
                        >
                          {lessonsCopy.openVocabulary}
                        </Button>
                        {topic ? (
                          <Text className="unit-meta">
                            {lessonsCopy.focusLabel}: {topic.title}
                          </Text>
                        ) : null}
                      </div>
                    </Space>
                  </Card>
                </Col>
              )
            })}
          </Row>
        </Space>
      ),
    },
    {
      key: 'vocabulary',
      label: t('lessons.vocabularyTab'),
      children: (
        <Row gutter={[18, 18]} className="vocabulary-layout">
          <Col xs={24} lg={15}>
            <Space direction="vertical" size={14} className="full-width">
              <div className="vocabulary-search-summary">
                <Text className="page-kicker">{lessonsCopy.vocabularyEyebrow}</Text>
                <Title level={4} className="vocabulary-search-title">
                  {lessonsCopy.vocabularyTitle}
                </Title>
                <Text type="secondary">
                  {searchKeyword
                    ? t('lessons.searchFound', { count: totalMatchedWords })
                    : t('lessons.searchDefault', {
                        count: totalMatchedWords,
                        grade: gradeLabel(selectedGrade),
                      })}
                </Text>
              </div>

              {filteredVocabularyTopics.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {filteredVocabularyTopics.map((topic) => (
                    <Col xs={24} md={12} key={`${topic.grade}-${topic.key}`}>
                      <Card className="vocabulary-card" bordered={false}>
                        <Space direction="vertical" size={12} className="full-width">
                          <div className="vocabulary-topic-head">
                            <div>
                              <Text strong className="vocabulary-topic-title">
                                {topic.title}
                              </Text>
                              <div className="vocabulary-topic-meta">
                                <Tag color="cyan" bordered={false}>
                                  {gradeLabel(topic.grade)}
                                </Tag>
                              </div>
                            </div>
                            <Text className="topic-count">
                              {topic.words.length} {lessonsCopy.wordCountLabel}
                            </Text>
                          </div>
                          <div className="vocabulary-tags">
                            {topic.words.map((word) => {
                              const key = `${topic.grade}-${topic.key}-${word.word}`
                              const isActive = selectedVocabularyKey
                                ? selectedVocabularyKey === key
                                : selectedVocabulary?.word === word.word &&
                                  selectedVocabulary?.topicKey === topic.key &&
                                  selectedVocabulary?.grade === topic.grade

                              return (
                                <button
                                  key={key}
                                  type="button"
                                  className={`vocabulary-tag${isActive ? ' is-active' : ''}`}
                                  onClick={() => setSelectedVocabularyKey(key)}
                                >
                                  {word.word}
                                </button>
                              )
                            })}
                          </div>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Card className="vocabulary-card" bordered={false}>
                  <Empty description={t('lessons.noWords')} />
                </Card>
              )}
            </Space>
          </Col>

          <Col xs={24} lg={9}>
            <Card className="vocabulary-detail-panel" bordered={false}>
              {selectedVocabulary ? (
                <Space direction="vertical" size={16} className="full-width">
                  <div className="vocabulary-detail-intro">
                    <Text className="page-kicker">{lessonsCopy.detailTitle}</Text>
                    <Paragraph className="settings-copy">{lessonsCopy.detailSubtitle}</Paragraph>
                  </div>

                  <div className="vocabulary-detail-header">
                    <div className="vocabulary-word-meta">
                      <Text className="vocabulary-detail-word">{selectedVocabulary.word}</Text>
                      <div className="vocabulary-detail-meta">
                        <Tag color="cyan" bordered={false}>
                          {gradeLabel(selectedVocabulary.grade)}
                        </Tag>
                        <Tag bordered={false} className="topic-chip">
                          {selectedVocabulary.topicTitle}
                        </Tag>
                        {selectedVocabulary.source === 'teacher' ? (
                          <Tag color="geekblue" bordered={false}>
                            {lessonsCopy.teacherTag}
                          </Tag>
                        ) : null}
                      </div>
                      {selectedVocabulary.source === 'teacher' ? (
                        <Space size={10} wrap>
                          <Button size="small" onClick={handleEditVocabulary}>
                            {lessonsCopy.editWord}
                          </Button>
                          <Popconfirm
                            title={lessonsCopy.deleteConfirmTitle}
                            description={lessonsCopy.deleteConfirmContent}
                            okText={lessonsCopy.deleteWord}
                            cancelText={t('common.cancel')}
                            onConfirm={() => void handleDeleteVocabulary()}
                          >
                            <Button size="small" danger loading={isSavingVocabulary}>
                              {lessonsCopy.deleteWord}
                            </Button>
                          </Popconfirm>
                        </Space>
                      ) : null}
                    </div>
                    <Tag className="vocabulary-detail-tag" bordered={false}>
                      <SoundOutlined /> {selectedVocabulary.ipa || t('lessons.noIpa')}
                    </Tag>
                  </div>

                  <div className="vocabulary-meaning-card">
                    <Text className="vocabulary-meaning-text">{selectedVocabulary.meaning}</Text>
                  </div>

                  <div className="vocabulary-example-card">
                    <Paragraph className="vocabulary-example-text">
                      "{selectedVocabulary.example || t('lessons.noExample')}"
                    </Paragraph>
                  </div>
                </Space>
              ) : (
                <Empty description={t('lessons.noSelectedWord')} />
              )}
            </Card>
          </Col>
        </Row>
      ),
    },
  ]

  return (
    <>
      <Row gutter={[18, 18]}>
        <Col xs={24} xl={16}>
          <Card className="content-card" bordered={false}>
            <Space direction="vertical" size={18} className="full-width">
              <div className="section-heading">
                <Title level={2}>{t('lessons.title', { grade: gradeLabel(selectedGrade) })}</Title>
                <Paragraph>{currentGrade.overview}</Paragraph>
              </div>

              <div className="lesson-search-bar">
                <Input
                  allowClear
                  size="large"
                  prefix={<SearchOutlined />}
                  placeholder={t('lessons.searchPlaceholder')}
                  value={searchKeyword}
                  onChange={(event) => {
                    const nextKeyword = event.target.value
                    setSearchKeyword(nextKeyword)

                    if (nextKeyword.trim()) {
                      setActiveTabKey('vocabulary')
                    }
                  }}
                />
              </div>

              <Tabs
                activeKey={activeTabKey}
                onChange={setActiveTabKey}
                items={tabItems}
                className="lesson-tabs"
              />
            </Space>
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Space direction="vertical" size={18} className="full-width">
            <Card className="content-card side-card" bordered={false}>
              <Text className="eyebrow">{t('common.keySkills')}</Text>
              <List<string>
                dataSource={currentGrade.skills}
                renderItem={(skill) => (
                  <List.Item className="skill-item">
                    <CheckCircleOutlined className="accent-icon" />
                    <Text>{skill}</Text>
                  </List.Item>
                )}
              />
            </Card>

            <Card className="content-card highlight-card" bordered={false}>
              <Text className="eyebrow">{t('common.projectApply')}</Text>
              <Paragraph>{currentGrade.project}</Paragraph>
            </Card>

            <Card className="content-card vocabulary-tools-card" bordered={false}>
              <Space direction="vertical" size={14} className="full-width">
                <div>
                  <Text className="eyebrow">{lessonsCopy.toolsTitle}</Text>
                  <Paragraph className="settings-copy">{lessonsCopy.toolsCopy}</Paragraph>
                </div>

                {!configured ? (
                  <Paragraph className="practice-empty-copy">{lessonsCopy.notesNotReady}</Paragraph>
                ) : !user ? (
                  <Space direction="vertical" size={10}>
                    <Paragraph className="practice-empty-copy">{toolsNeedLoginText}</Paragraph>
                    <Button type="primary" onClick={() => void handleGithubSignIn()}>
                      {loginActionText}
                    </Button>
                  </Space>
                ) : (
                  <>
                    <Space wrap size={10}>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                          setEditingVocabularyId(null)
                          setIsAddWordOpen(true)
                        }}
                      >
                        {lessonsCopy.addWord}
                      </Button>
                      <Button icon={<UploadOutlined />} onClick={() => setIsImportOpen(true)}>
                        {lessonsCopy.importWords}
                      </Button>
                      <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplateCsv}>
                        {lessonsCopy.downloadTemplateCsv}
                      </Button>
                      <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplateExcel}>
                        {lessonsCopy.downloadTemplateExcel}
                      </Button>
                    </Space>
                    <Text type="secondary">
                      {isVocabularyLoading
                        ? language === 'en'
                          ? 'Loading teacher vocabulary...'
                          : 'Đang tải từ vựng giáo viên...'
                        : `${teacherVocabularyEntries.filter((entry) => entry.grade_key === selectedGrade).length} ${
                            language === 'en'
                              ? 'teacher-added words in this grade'
                              : 'từ giáo viên đã thêm ở khối này'
                          }`}
                    </Text>
                  </>
                )}
              </Space>
            </Card>

            <Card className="content-card teacher-notes-card" bordered={false}>
              <Space direction="vertical" size={14} className="full-width">
                <div>
                  <Text className="eyebrow">{lessonsCopy.notesTitle}</Text>
                  <Paragraph className="settings-copy">{lessonsCopy.notesCopy}</Paragraph>
                </div>

                {!configured ? (
                  <Paragraph className="practice-empty-copy">{lessonsCopy.notesNotReady}</Paragraph>
                ) : !user ? (
                  <Space direction="vertical" size={10}>
                    <Paragraph className="practice-empty-copy">{notesNeedLoginText}</Paragraph>
                    <Button type="primary" onClick={() => void handleGithubSignIn()}>
                      {loginActionText}
                    </Button>
                  </Space>
                ) : isNotesLoading ? (
                  <div className="teacher-notes-loading">
                    <Spin />
                  </div>
                ) : (
                  <>
                    <Input.TextArea
                      rows={7}
                      value={noteDraft}
                      onChange={(event) => setNoteDraft(event.target.value)}
                      placeholder={lessonsCopy.notesPlaceholder}
                      className="teacher-notes-input"
                    />
                    <Button type="primary" onClick={handleSaveNote} loading={isSavingNote}>
                      {lessonsCopy.saveNote}
                    </Button>
                  </>
                )}
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>

      <VocabularyAddModal
        open={isAddWordOpen}
        onCancel={() => {
          setIsAddWordOpen(false)
          setEditingVocabularyId(null)
          addWordForm.resetFields()
        }}
        onSubmit={() => void handleSubmitAddWord()}
        confirmLoading={isSavingVocabulary}
        copy={lessonsCopy}
        language={language}
        form={addWordForm}
        autoFillIpa={autoFillSingleIpa}
        onAutoFillIpaChange={setAutoFillSingleIpa}
        topics={selectedGradeTopics.map((topic) => ({
          key: topic.key,
          title: topic.title,
        }))}
        mode={editingVocabularyId ? 'edit' : 'create'}
        submitLabel={editingVocabularyId ? lessonsCopy.updateWord : lessonsCopy.addWord}
      />

      <VocabularyImportModal
        open={isImportOpen}
        onCancel={() => {
          setIsImportOpen(false)
          setImportRows([])
          setImportFileName('')
        }}
        onSubmit={() => void handleImportVocabulary()}
        confirmLoading={isSavingVocabulary}
        copy={lessonsCopy}
        autoFillIpa={autoFillImportIpa}
        onAutoFillIpaChange={setAutoFillImportIpa}
        onDownloadCsv={handleDownloadTemplateCsv}
        onDownloadExcel={handleDownloadTemplateExcel}
        onFileSelect={handleImportFile}
        importFileName={importFileName}
        importRowsCount={importRows.length}
      />
    </>
  )
}

export default LessonsPage
