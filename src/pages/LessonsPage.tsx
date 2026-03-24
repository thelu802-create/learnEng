import { useMemo, useState } from 'react'
import {
  BookOutlined,
  CheckCircleOutlined,
  ReadOutlined,
  RightOutlined,
  SearchOutlined,
  SoundOutlined,
} from '@ant-design/icons'
import { Button, Card, Col, Empty, Input, List, Row, Space, Tabs, Tag, Typography } from 'antd'
import type { TabsProps } from 'antd'
import { gradeContent } from '../data'
import { useI18n } from '../i18n'
import type {
  GradeContent,
  GradeKey,
  VocabularyTopic,
  VocabularyWord,
} from '../types'

const { Title, Paragraph, Text } = Typography

interface LessonsPageProps {
  selectedGrade: GradeKey
  currentGrade: GradeContent
}

interface SearchableVocabularyTopic extends VocabularyTopic {
  grade: GradeKey
}

interface SelectedVocabulary extends VocabularyWord {
  grade: GradeKey
  topicTitle: string
}

function matchesVocabulary(word: VocabularyWord, keyword: string): boolean {
  const normalizedKeyword = keyword.trim().toLowerCase()

  if (!normalizedKeyword) {
    return true
  }

  return [word.word, word.meaning, word.example]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(normalizedKeyword))
}

function LessonsPage({ selectedGrade, currentGrade }: LessonsPageProps) {
  const { t, gradeLabel, language } = useI18n()
  const [selectedVocabularyKey, setSelectedVocabularyKey] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [activeTabKey, setActiveTabKey] = useState('units')

  const lessonsCopy =
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
        }

  const searchableTopics = useMemo<SearchableVocabularyTopic[]>(() => {
    if (!searchKeyword.trim()) {
      return currentGrade.vocabularyTopics.map((topic) => ({
        ...topic,
        grade: selectedGrade,
      }))
    }

    return (Object.entries(gradeContent) as [GradeKey, GradeContent][]).flatMap(
      ([grade, content]) =>
        content.vocabularyTopics.map((topic) => ({
          ...topic,
          grade,
        })),
    )
  }, [currentGrade.vocabularyTopics, searchKeyword, selectedGrade])

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

  const vocabularyTopicMap = useMemo<Record<string, SearchableVocabularyTopic>>(
    () =>
      Object.fromEntries(
        filteredVocabularyTopics.map((topic) => [`${topic.grade}-${topic.key}`, topic]),
      ),
    [filteredVocabularyTopics],
  )

  let selectedVocabulary: SelectedVocabulary | null = null

  for (const topic of filteredVocabularyTopics) {
    const matchedWord = topic.words.find(
      (word) => `${topic.grade}-${topic.key}-${word.word}` === selectedVocabularyKey,
    )

    if (matchedWord) {
      selectedVocabulary = {
        ...matchedWord,
        grade: topic.grade,
        topicTitle: topic.title,
      }
      break
    }
  }

  if (!selectedVocabulary) {
    for (const topic of filteredVocabularyTopics) {
      const firstWord = topic.words[0]

      if (firstWord) {
        selectedVocabulary = {
          ...firstWord,
          grade: topic.grade,
          topicTitle: topic.title,
        }
        break
      }
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
              const topic = vocabularyTopicMap[`${selectedGrade}-${unit.vocabularyTopicKey}`]
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
                              const isActive =
                                selectedVocabulary?.word === word.word &&
                                selectedVocabulary.grade === topic.grade &&
                                selectedVocabulary.topicTitle === topic.title

                              return (
                                <button
                                  key={`${topic.grade}-${topic.key}-${word.word}`}
                                  type="button"
                                  className={`vocabulary-tag${isActive ? ' is-active' : ''}`}
                                  onClick={() =>
                                    setSelectedVocabularyKey(
                                      `${topic.grade}-${topic.key}-${word.word}`,
                                    )
                                  }
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
                      </div>
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
        </Space>
      </Col>
    </Row>
  )
}

export default LessonsPage
