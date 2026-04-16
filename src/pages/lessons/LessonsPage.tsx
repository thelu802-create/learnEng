import { useEffect, useMemo, useState } from 'react'
import { SearchOutlined } from '@ant-design/icons'
import {
  App as AntdApp,
  Card,
  Col,
  Form,
  Input,
  Row,
  Space,
  Tabs,
  Typography,
} from 'antd'
import type { TabsProps } from 'antd'
import { useSupabaseAuth } from '../../components/providers/SupabaseAuthProvider'
import { useI18n } from '../../i18n'
import {
  createVocabularyEntries,
  deleteVocabularyEntry,
  updateVocabularyEntry,
} from '../../lib/supabase/vocabularyEntriesApi'
import { upsertTeacherNote } from '../../lib/supabase/notesApi'
import { lookupIpaMap } from '../../lib/vocabularyApi'
import VocabularyAddModal from './VocabularyAddModal'
import VocabularyImportModal from './VocabularyImportModal'
import LessonsSidebar from './components/LessonsSidebar'
import LessonsUnitsTab from './LessonsUnitsTab'
import LessonsVocabularyTab from './LessonsVocabularyTab'
import { useLessonsTeacherTools } from './hooks/useLessonsTeacherTools'
import { useLessonsVocabularyData } from './hooks/useLessonsVocabularyData'
import type {
  AddWordFormValues,
  LessonsCopy,
  LessonsPageProps,
} from './types'
import { downloadCsvFile, downloadXlsxFile, normalizeWordKey, slugifyTopicKey } from './utils'

const { Title, Paragraph } = Typography

function LessonsPage({ selectedGrade, currentGrade }: LessonsPageProps) {
  const { message } = AntdApp.useApp()
  const { t, gradeLabel, language } = useI18n()
  const { configured, signInWithGithub, user } = useSupabaseAuth()
  const [addWordForm] = Form.useForm<AddWordFormValues>()
  const [selectedVocabularyKey, setSelectedVocabularyKey] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [activeTabKey, setActiveTabKey] = useState('units')
  const [noteDraft, setNoteDraft] = useState('')
  const [isSavingNote, setIsSavingNote] = useState(false)

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
  const {
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
  } = useLessonsTeacherTools({
    configured,
    userId: user?.id,
    lessonsCopy,
    t,
    message,
    signInWithGithub,
    addWordForm,
  })

  const {
    selectedGradeTopics,
    filteredVocabularyTopics,
    totalMatchedWords,
    activeTopicKey,
    selectedTopicLookup,
    selectedVocabulary,
  } = useLessonsVocabularyData({
    selectedGrade,
    currentGrade,
    teacherVocabularyEntries,
    searchKeyword,
    selectedVocabularyKey,
  })

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

  const teacherWordsInGrade = useMemo(
    () => teacherVocabularyEntries.filter((entry) => entry.grade_key === selectedGrade).length,
    [selectedGrade, teacherVocabularyEntries],
  )

  const topicsForAddModal = useMemo(
    () => selectedGradeTopics.map((topic) => ({ key: topic.key, title: topic.title })),
    [selectedGradeTopics],
  )

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
      handleCloseAddWord()
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
      handleCloseImport()

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
          <LessonsSidebar
            currentGradeSkills={currentGrade.skills}
            currentGradeProject={currentGrade.project}
            copy={lessonsCopy}
            configured={configured}
            hasUser={Boolean(user)}
            loginActionText={loginActionText}
            notesNeedLoginText={notesNeedLoginText}
            toolsNeedLoginText={toolsNeedLoginText}
            loadingTeacherVocabularyText={t('lessonsPage.loadingTeacherVocabulary')}
            teacherWordsInGradeText={t('lessonsPage.teacherWordsInGrade', { count: teacherWordsInGrade })}
            noteDraft={noteDraft}
            isNotesLoading={isNotesLoading}
            isSavingNote={isSavingNote}
            isVocabularyLoading={isVocabularyLoading}
            onNoteDraftChange={setNoteDraft}
            onSaveNote={() => void handleSaveNote()}
            onGithubSignIn={() => void handleGithubSignIn()}
            onOpenAddWord={handleOpenAddWord}
            onOpenImport={handleOpenImport}
            onDownloadTemplateCsv={handleDownloadTemplateCsv}
            onDownloadTemplateExcel={() => void handleDownloadTemplateExcel()}
            keySkillsLabel={t('common.keySkills')}
            projectApplyLabel={t('common.projectApply')}
          />
        </Col>
      </Row>

      <VocabularyAddModal
        open={isAddWordOpen}
        onCancel={handleCloseAddWord}
        onSubmit={() => void handleSubmitAddWord()}
        confirmLoading={isSavingVocabulary}
        copy={lessonsCopy}
        language={language}
        form={addWordForm}
        autoFillIpa={autoFillSingleIpa}
        onAutoFillIpaChange={setAutoFillSingleIpa}
        topics={topicsForAddModal}
        mode={editingVocabularyId ? 'edit' : 'create'}
        submitLabel={editingVocabularyId ? lessonsCopy.updateWord : lessonsCopy.addWord}
      />

      <VocabularyImportModal
        open={isImportOpen}
        onCancel={handleCloseImport}
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
