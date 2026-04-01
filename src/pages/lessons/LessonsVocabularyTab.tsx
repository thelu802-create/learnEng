import { memo } from 'react'
import { SoundOutlined } from '@ant-design/icons'
import { Button, Card, Col, Empty, Popconfirm, Row, Space, Tag, Typography } from 'antd'
import type { GradeKey } from '../../types'
import type { LessonsCopy, SearchableVocabularyTopic, SelectedVocabulary } from './types'

const { Paragraph, Text, Title } = Typography

interface LessonsVocabularyTabProps {
  filteredVocabularyTopics: SearchableVocabularyTopic[]
  selectedVocabulary: SelectedVocabulary | null
  selectedVocabularyKey: string
  searchKeyword: string
  lessonsCopy: LessonsCopy
  gradeLabel: (grade: GradeKey) => string
  searchFoundText: string
  searchDefaultText: string
  noWordsText: string
  noSelectedWordText: string
  noIpaText: string
  noExampleText: string
  cancelText: string
  isSavingVocabulary: boolean
  onSelectVocabulary: (key: string) => void
  onEditVocabulary: () => void
  onDeleteVocabulary: () => void
}

function LessonsVocabularyTab({
  filteredVocabularyTopics,
  selectedVocabulary,
  selectedVocabularyKey,
  searchKeyword,
  lessonsCopy,
  gradeLabel,
  searchFoundText,
  searchDefaultText,
  noWordsText,
  noSelectedWordText,
  noIpaText,
  noExampleText,
  cancelText,
  isSavingVocabulary,
  onSelectVocabulary,
  onEditVocabulary,
  onDeleteVocabulary,
}: LessonsVocabularyTabProps) {
  return (
    <Row gutter={[18, 18]} className="vocabulary-layout">
      <Col xs={24} lg={15}>
        <Space orientation="vertical" size={14} className="full-width">
          <div className="vocabulary-search-summary">
            <Text className="page-kicker">{lessonsCopy.vocabularyEyebrow}</Text>
            <Title level={4} className="vocabulary-search-title">
              {lessonsCopy.vocabularyTitle}
            </Title>
            <Text type="secondary">{searchKeyword ? searchFoundText : searchDefaultText}</Text>
          </div>

          {filteredVocabularyTopics.length > 0 ? (
            <Row gutter={[16, 16]}>
              {filteredVocabularyTopics.map((topic) => (
                <Col xs={24} md={12} key={`${topic.grade}-${topic.key}`}>
                  <Card className="vocabulary-card" variant="borderless">
                    <Space orientation="vertical" size={12} className="full-width">
                      <div className="vocabulary-topic-head">
                        <div>
                          <Text strong className="vocabulary-topic-title">
                            {topic.title}
                          </Text>
                          <div className="vocabulary-topic-meta">
                            <Tag color="cyan" variant="filled">
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
                              onClick={() => onSelectVocabulary(key)}
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
            <Card className="vocabulary-card" variant="borderless">
              <Empty description={noWordsText} />
            </Card>
          )}
        </Space>
      </Col>

      <Col xs={24} lg={9}>
        <Card className="vocabulary-detail-panel" variant="borderless">
          {selectedVocabulary ? (
            <Space orientation="vertical" size={16} className="full-width">
              <div className="vocabulary-detail-intro">
                <Text className="page-kicker">{lessonsCopy.detailTitle}</Text>
                <Paragraph className="settings-copy">{lessonsCopy.detailSubtitle}</Paragraph>
              </div>

              <div className="vocabulary-detail-header">
                <div className="vocabulary-word-meta">
                  <Text className="vocabulary-detail-word">{selectedVocabulary.word}</Text>
                  <div className="vocabulary-detail-meta">
                    <Tag color="cyan" variant="filled">
                      {gradeLabel(selectedVocabulary.grade)}
                    </Tag>
                    <Tag variant="filled" className="topic-chip">
                      {selectedVocabulary.topicTitle}
                    </Tag>
                    {selectedVocabulary.source === 'teacher' ? (
                      <Tag color="geekblue" variant="filled">
                        {lessonsCopy.teacherTag}
                      </Tag>
                    ) : null}
                  </div>
                  {selectedVocabulary.source === 'teacher' ? (
                    <Space size={10} wrap>
                      <Button size="small" onClick={onEditVocabulary}>
                        {lessonsCopy.editWord}
                      </Button>
                      <Popconfirm
                        title={lessonsCopy.deleteConfirmTitle}
                        description={lessonsCopy.deleteConfirmContent}
                        okText={lessonsCopy.deleteWord}
                        cancelText={cancelText}
                        onConfirm={() => void onDeleteVocabulary()}
                      >
                        <Button size="small" danger loading={isSavingVocabulary}>
                          {lessonsCopy.deleteWord}
                        </Button>
                      </Popconfirm>
                    </Space>
                  ) : null}
                </div>
                <Tag className="vocabulary-detail-tag" variant="filled">
                  <SoundOutlined /> {selectedVocabulary.ipa || noIpaText}
                </Tag>
              </div>

              <div className="vocabulary-meaning-card">
                <Text className="vocabulary-meaning-text">{selectedVocabulary.meaning}</Text>
              </div>

              <div className="vocabulary-example-card">
                <Paragraph className="vocabulary-example-text">"{selectedVocabulary.example || noExampleText}"</Paragraph>
              </div>
            </Space>
          ) : (
            <Empty description={noSelectedWordText} />
          )}
        </Card>
      </Col>
    </Row>
  )
}

export default memo(LessonsVocabularyTab)
