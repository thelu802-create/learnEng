import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircleOutlined,
  DownloadOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import {
  App as AntdApp,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Space,
  Spin,
  Tabs,
  Typography,
} from 'antd'
import type { TabsProps } from 'antd'
import { useSupabaseAuth } from '../components/providers/SupabaseAuthProvider'
import { gradeContent } from '../data'
import { useI18n } from '../i18n'
import { listTeacherNotes, upsertTeacherNote } from '../lib/supabase/notesApi'
import {
  createVocabularyEntries,
  deleteVocabularyEntry,
  listVocabularyEntries,
  updateVocabularyEntry,
} from '../lib/supabase/vocabularyEntriesApi'
import { lookupIpaMap } from '../lib/vocabularyApi'
import type { VocabularyEntryRecord } from '../lib/supabase/types'
import type { GradeContent, GradeKey } from '../types'
import VocabularyAddModal from './lessons/VocabularyAddModal'
import VocabularyImportModal from './lessons/VocabularyImportModal'
import LessonsUnitsTab from './lessons/LessonsUnitsTab'
import LessonsVocabularyTab from './lessons/LessonsVocabularyTab'
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
  const { message } = AntdApp.useApp()
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

  const lessonsCopy: LessonsCopy = {
    overviewEyebrow: t('lessonsPage.overviewEyebrow'),
    unitSummary: t('lessonsPage.unitSummary'),
    openVocabulary: t('lessonsPage.openVocabulary'),
    linkedTopic: t('lessonsPage.linkedTopic'),
    focusLabel: t('lessonsPage.focusLabel'),
    practiceLabel: t('lessonsPage.practiceLabel'),
    projectLabel: t('lessonsPage.projectLabel'),
    vocabularyEyebrow: t('lessonsPage.vocabularyEyebrow'),
    vocabularyTitle: t('lessonsPage.vocabularyTitle'),
    wordCountLabel: t('lessonsPage.wordCountLabel'),
    detailTitle: t('lessonsPage.detailTitle'),
    detailSubtitle: t('lessonsPage.detailSubtitle'),
    notesTitle: t('lessonsPage.notesTitle'),
    notesCopy: t('lessonsPage.notesCopy'),
    notesPlaceholder: t('lessonsPage.notesPlaceholder'),
    saveNote: t('lessonsPage.saveNote'),
    notesNeedLogin: t('lessonsPage.notesNeedLogin'),
    notesNotReady: t('lessonsPage.notesNotReady'),
    notesSaved: t('lessonsPage.notesSaved'),
    notesLoadError: t('lessonsPage.notesLoadError'),
    notesSaveError: t('lessonsPage.notesSaveError'),
    toolsTitle: t('lessonsPage.toolsTitle'),
    toolsCopy: t('lessonsPage.toolsCopy'),
    toolsNeedLogin: t('lessonsPage.toolsNeedLogin'),
    addWord: t('lessonsPage.addWord'),
    importWords: t('lessonsPage.importWords'),
    downloadTemplate: t('lessonsPage.downloadTemplate'),
    downloadTemplateCsv: t('lessonsPage.downloadTemplateCsv'),
    downloadTemplateExcel: t('lessonsPage.downloadTemplateExcel'),
    loadWordsError: t('lessonsPage.loadWordsError'),
    saveWordSuccess: t('lessonsPage.saveWordSuccess'),
    saveWordError: t('lessonsPage.saveWordError'),
    duplicateWord: t('lessonsPage.duplicateWord'),
    editWord: t('lessonsPage.editWord'),
    updateWord: t('lessonsPage.updateWord'),
    deleteWord: t('lessonsPage.deleteWord'),
    deleteConfirmTitle: t('lessonsPage.deleteConfirmTitle'),
    deleteConfirmContent: t('lessonsPage.deleteConfirmContent'),
    deleteSuccess: t('lessonsPage.deleteSuccess'),
    deleteError: t('lessonsPage.deleteError'),
    importSuccess: t('lessonsPage.importSuccess'),
    importPartial: t('lessonsPage.importPartial'),
    importEmpty: t('lessonsPage.importEmpty'),
    importReadError: t('lessonsPage.importReadError'),
    importTitle: t('lessonsPage.importTitle'),
    importCopy: t('lessonsPage.importCopy'),
    importSelectedFile: t('lessonsPage.importSelectedFile'),
    importRowsReady: t('lessonsPage.importRowsReady'),
    importHint: t('lessonsPage.importHint'),
    importRun: t('lessonsPage.importRun'),
    addWordTitle: t('lessonsPage.addWordTitle'),
    addWordCopy: t('lessonsPage.addWordCopy'),
    fieldTopic: t('lessonsPage.fieldTopic'),
    fieldWord: t('lessonsPage.fieldWord'),
    fieldIpa: t('lessonsPage.fieldIpa'),
    fieldMeaning: t('lessonsPage.fieldMeaning'),
    fieldExample: t('lessonsPage.fieldExample'),
    fileButton: t('lessonsPage.fileButton'),
    teacherTag: t('lessonsPage.teacherTag'),
    autoFillIpa: t('lessonsPage.autoFillIpa'),
    autoFillIpaHint: t('lessonsPage.autoFillIpaHint'),
  }

  const notesNeedLoginText = lessonsCopy.notesNeedLogin
  const toolsNeedLoginText = lessonsCopy.toolsNeedLogin
  const loginActionText = t('topbar.signIn')

  const handleGithubSignIn = async () => {
    try {
      await signInWithGithub()
    } catch {
      message.error(t('planner.signInError'))
    }
  }

  const mergedVocabularyTopicsByGrade = useMemo<Record<GradeKey, SearchableVocabularyTopic[]>>(() => {
    // Start with the bundled course data, then layer teacher-added rows on top for the active session.
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

    // Teacher vocabulary stays private per account, so it is only loaded after sign-in.
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
      message.error(t('lessonsPage.validTopicRequired'))
      return
    }

    const existingTopic = selectedGradeTopics.find((topic) => topic.key === values.topicKey)
    // Duplicate checks compare against both bundled words and teacher-added words after trim/normalization.
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
        message.success(t('lessonsPage.updateWordSuccess'))
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
        meaning: t('lessonsPage.templateMeaningClassmate'),
        example: 'My classmate sits next to me.',
      },
      {
        topic_key: fallbackTopicKey,
        topic_title: fallbackTopicTitle,
        word: 'timetable',
        ipa: '',
        meaning: t('lessonsPage.templateMeaningTimetable'),
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

  const handleDownloadTemplateExcel = async () => {
    await downloadXlsxFile(
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

  const handleOpenVocabulary = (topicKey: string, word: string) => {
    setSelectedVocabularyKey(`${selectedGrade}-${topicKey}-${word}`)
    setSearchKeyword('')
    setActiveTabKey('vocabulary')
  }

  const tabItems: TabsProps['items'] = useMemo(
    () => [
      {
        key: 'units',
        label: t('lessons.unitsTab'),
        children: (
          <LessonsUnitsTab
            currentGrade={currentGrade}
            lessonsCopy={lessonsCopy}
            selectedGradeTopics={selectedGradeTopics}
            linkedWordsLabel={t('lessons.linkedWords')}
            grammarLabel={t('lessons.grammar')}
            vocabularyLabel={t('lessons.vocabulary')}
            onOpenVocabulary={handleOpenVocabulary}
          />
        ),
      },
      {
        key: 'vocabulary',
        label: t('lessons.vocabularyTab'),
        children: (
          <LessonsVocabularyTab
            filteredVocabularyTopics={filteredVocabularyTopics}
            selectedVocabulary={selectedVocabulary}
            selectedVocabularyKey={selectedVocabularyKey}
            searchKeyword={searchKeyword}
            lessonsCopy={lessonsCopy}
            gradeLabel={gradeLabel}
            searchFoundText={t('lessons.searchFound', { count: totalMatchedWords })}
            searchDefaultText={t('lessons.searchDefault', {
              count: totalMatchedWords,
              grade: gradeLabel(selectedGrade),
            })}
            noWordsText={t('lessons.noWords')}
            noSelectedWordText={t('lessons.noSelectedWord')}
            noIpaText={t('lessons.noIpa')}
            noExampleText={t('lessons.noExample')}
            cancelText={t('common.cancel')}
            isSavingVocabulary={isSavingVocabulary}
            onSelectVocabulary={setSelectedVocabularyKey}
            onEditVocabulary={handleEditVocabulary}
            onDeleteVocabulary={handleDeleteVocabulary}
          />
        ),
      },
    ],
    [
      currentGrade,
      filteredVocabularyTopics,
      gradeLabel,
      handleDeleteVocabulary,
      handleEditVocabulary,
      lessonsCopy,
      searchKeyword,
      selectedGrade,
      selectedGradeTopics,
      selectedVocabulary,
      selectedVocabularyKey,
      t,
      totalMatchedWords,
      isSavingVocabulary,
    ],
  )

  return (
    <>
      <Row gutter={[18, 18]}>
        <Col xs={24} xl={16}>
          <Card className="content-card" variant="borderless">
            <Space orientation="vertical" size={18} className="full-width">
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
          <Space orientation="vertical" size={18} className="full-width">
            <Card className="content-card side-card" variant="borderless">
              <Text className="eyebrow">{t('common.keySkills')}</Text>
              <Space orientation="vertical" size={10} className="full-width">
                {currentGrade.skills.map((skill) => (
                  <div className="skill-item" key={skill}>
                    <CheckCircleOutlined className="accent-icon" />
                    <Text>{skill}</Text>
                  </div>
                ))}
              </Space>
            </Card>

            <Card className="content-card highlight-card" variant="borderless">
              <Text className="eyebrow">{t('common.projectApply')}</Text>
              <Paragraph>{currentGrade.project}</Paragraph>
            </Card>

            <Card className="content-card vocabulary-tools-card" variant="borderless">
              <Space orientation="vertical" size={14} className="full-width">
                <div>
                  <Text className="eyebrow">{lessonsCopy.toolsTitle}</Text>
                  <Paragraph className="settings-copy">{lessonsCopy.toolsCopy}</Paragraph>
                </div>

                {!configured ? (
                  <Paragraph className="practice-empty-copy">{lessonsCopy.notesNotReady}</Paragraph>
                ) : !user ? (
                  <Space orientation="vertical" size={10}>
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
                        ? t('lessonsPage.loadingTeacherVocabulary')
                        : t('lessonsPage.teacherWordsInGrade', {
                            count: teacherVocabularyEntries.filter((entry) => entry.grade_key === selectedGrade).length,
                          })}
                    </Text>
                  </>
                )}
              </Space>
            </Card>

            <Card className="content-card teacher-notes-card" variant="borderless">
              <Space orientation="vertical" size={14} className="full-width">
                <div>
                  <Text className="eyebrow">{lessonsCopy.notesTitle}</Text>
                  <Paragraph className="settings-copy">{lessonsCopy.notesCopy}</Paragraph>
                </div>

                {!configured ? (
                  <Paragraph className="practice-empty-copy">{lessonsCopy.notesNotReady}</Paragraph>
                ) : !user ? (
                  <Space orientation="vertical" size={10}>
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
