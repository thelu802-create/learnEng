import { memo } from 'react'
import {
  BookOutlined,
  CheckCircleOutlined,
  ReadOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { Button, Card, Col, Row, Space, Tag, Typography } from 'antd'
import type { GradeContent } from '../../types'
import type { LessonsCopy, SearchableVocabularyTopic } from './types'

const { Text, Title } = Typography

interface LessonsUnitsTabProps {
  currentGrade: GradeContent
  lessonsCopy: LessonsCopy
  selectedGradeTopics: SearchableVocabularyTopic[]
  linkedWordsLabel: string
  grammarLabel: string
  vocabularyLabel: string
  onOpenVocabulary: (topicKey: string, word: string) => void
}

function LessonsUnitsTab({
  currentGrade,
  lessonsCopy,
  selectedGradeTopics,
  linkedWordsLabel,
  grammarLabel,
  vocabularyLabel,
  onOpenVocabulary,
}: LessonsUnitsTabProps) {
  return (
    <Space orientation="vertical" size={18} className="full-width">
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
              <Card className="unit-card lesson-topic-card" variant="borderless">
                <Space orientation="vertical" size={14} className="full-width">
                  <div className="unit-head">
                    <div>
                      <Text className="page-kicker">{lessonsCopy.linkedTopic}</Text>
                      <Title level={4} className="lesson-topic-title">
                        {unit.title}
                      </Title>
                    </div>
                    {topic ? (
                      <Tag variant="filled" className="topic-chip">
                        {topic.title}
                      </Tag>
                    ) : null}
                  </div>

                  <div className="lesson-topic-brief">
                    <div className="lesson-topic-pill">
                      <Text className="lesson-topic-pill-label">{grammarLabel}</Text>
                      <Text>{unit.grammar.focus}</Text>
                    </div>
                    <div className="lesson-topic-pill">
                      <Text className="lesson-topic-pill-label">{vocabularyLabel}</Text>
                      <Text>{unit.vocabulary.summary}</Text>
                    </div>
                  </div>

                  <div className="lesson-topic-points">
                    {topic ? (
                      <div className="lesson-topic-point">
                        <BookOutlined />
                        <Text>
                          {topic.words.length} {linkedWordsLabel}
                        </Text>
                      </div>
                    ) : null}
                    {unit.practice.length > 0 ? (
                      <div className="lesson-topic-point">
                        <ReadOutlined />
                        <Text>
                          <span className="label">{lessonsCopy.practiceLabel}:</span> {unit.practice[0]}
                        </Text>
                      </div>
                    ) : null}
                    {unit.project ? (
                      <div className="lesson-topic-point">
                        <CheckCircleOutlined />
                        <Text>
                          <span className="label">{lessonsCopy.projectLabel}:</span> {unit.project}
                        </Text>
                      </div>
                    ) : null}
                  </div>

                  <div className="lesson-topic-actions">
                    <Button
                      type="primary"
                      icon={<RightOutlined />}
                      iconPlacement="end"
                      disabled={!topic || !firstTopicWord}
                      onClick={() => {
                        if (!topic || !firstTopicWord) {
                          return
                        }

                        onOpenVocabulary(topic.key, firstTopicWord.word)
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
  )
}

export default memo(LessonsUnitsTab)
