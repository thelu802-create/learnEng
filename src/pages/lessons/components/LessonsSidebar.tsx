import {
  CheckCircleOutlined,
  DownloadOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { Button, Card, Input, Space, Spin, Typography } from 'antd'
import type { LessonsCopy } from '../types'

const { Paragraph, Text } = Typography

interface LessonsSidebarProps {
  currentGradeSkills: string[]
  currentGradeProject: string
  copy: LessonsCopy
  configured: boolean
  hasUser: boolean
  loginActionText: string
  notesNeedLoginText: string
  toolsNeedLoginText: string
  loadingTeacherVocabularyText: string
  teacherWordsInGradeText: string
  noteDraft: string
  isNotesLoading: boolean
  isSavingNote: boolean
  isVocabularyLoading: boolean
  onNoteDraftChange: (value: string) => void
  onSaveNote: () => void
  onGithubSignIn: () => void
  onOpenAddWord: () => void
  onOpenImport: () => void
  onDownloadTemplateCsv: () => void
  onDownloadTemplateExcel: () => void
  keySkillsLabel: string
  projectApplyLabel: string
}

function SidebarLoginState({
  text,
  loginActionText,
  onGithubSignIn,
}: {
  text: string
  loginActionText: string
  onGithubSignIn: () => void
}) {
  return (
    <Space orientation="vertical" size={10}>
      <Paragraph className="practice-empty-copy">{text}</Paragraph>
      <Button type="primary" onClick={onGithubSignIn}>
        {loginActionText}
      </Button>
    </Space>
  )
}

function LessonsSidebar({
  currentGradeSkills,
  currentGradeProject,
  copy,
  configured,
  hasUser,
  loginActionText,
  notesNeedLoginText,
  toolsNeedLoginText,
  loadingTeacherVocabularyText,
  teacherWordsInGradeText,
  noteDraft,
  isNotesLoading,
  isSavingNote,
  isVocabularyLoading,
  onNoteDraftChange,
  onSaveNote,
  onGithubSignIn,
  onOpenAddWord,
  onOpenImport,
  onDownloadTemplateCsv,
  onDownloadTemplateExcel,
  keySkillsLabel,
  projectApplyLabel,
}: LessonsSidebarProps) {
  return (
    <Space orientation="vertical" size={18} className="full-width">
      <Card className="content-card side-card" variant="borderless">
        <Text className="eyebrow">{keySkillsLabel}</Text>
        <Space orientation="vertical" size={10} className="full-width">
          {currentGradeSkills.map((skill) => (
            <div className="skill-item" key={skill}>
              <CheckCircleOutlined className="accent-icon" />
              <Text>{skill}</Text>
            </div>
          ))}
        </Space>
      </Card>

      <Card className="content-card highlight-card" variant="borderless">
        <Text className="eyebrow">{projectApplyLabel}</Text>
        <Paragraph>{currentGradeProject}</Paragraph>
      </Card>

      <Card className="content-card vocabulary-tools-card" variant="borderless">
        <Space orientation="vertical" size={14} className="full-width">
          <div>
            <Text className="eyebrow">{copy.toolsTitle}</Text>
            <Paragraph className="settings-copy">{copy.toolsCopy}</Paragraph>
          </div>

          {!configured ? (
            <Paragraph className="practice-empty-copy">{copy.notesNotReady}</Paragraph>
          ) : !hasUser ? (
            <SidebarLoginState
              text={toolsNeedLoginText}
              loginActionText={loginActionText}
              onGithubSignIn={onGithubSignIn}
            />
          ) : (
            <>
              <Space wrap size={10}>
                <Button type="primary" icon={<PlusOutlined />} onClick={onOpenAddWord}>
                  {copy.addWord}
                </Button>
                <Button icon={<UploadOutlined />} onClick={onOpenImport}>
                  {copy.importWords}
                </Button>
                <Button icon={<DownloadOutlined />} onClick={onDownloadTemplateCsv}>
                  {copy.downloadTemplateCsv}
                </Button>
                <Button icon={<DownloadOutlined />} onClick={onDownloadTemplateExcel}>
                  {copy.downloadTemplateExcel}
                </Button>
              </Space>
              <Text type="secondary">
                {isVocabularyLoading ? loadingTeacherVocabularyText : teacherWordsInGradeText}
              </Text>
            </>
          )}
        </Space>
      </Card>

      <Card className="content-card teacher-notes-card" variant="borderless">
        <Space orientation="vertical" size={14} className="full-width">
          <div>
            <Text className="eyebrow">{copy.notesTitle}</Text>
            <Paragraph className="settings-copy">{copy.notesCopy}</Paragraph>
          </div>

          {!configured ? (
            <Paragraph className="practice-empty-copy">{copy.notesNotReady}</Paragraph>
          ) : !hasUser ? (
            <SidebarLoginState
              text={notesNeedLoginText}
              loginActionText={loginActionText}
              onGithubSignIn={onGithubSignIn}
            />
          ) : isNotesLoading ? (
            <div className="teacher-notes-loading">
              <Spin />
            </div>
          ) : (
            <>
              <Input.TextArea
                rows={7}
                value={noteDraft}
                onChange={(event) => onNoteDraftChange(event.target.value)}
                placeholder={copy.notesPlaceholder}
                className="teacher-notes-input"
              />
              <Button type="primary" onClick={onSaveNote} loading={isSavingNote}>
                {copy.saveNote}
              </Button>
            </>
          )}
        </Space>
      </Card>
    </Space>
  )
}

export default LessonsSidebar
