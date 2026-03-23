import { useMemo, useState } from 'react'
import { CheckCircleOutlined, SearchOutlined, SoundOutlined } from '@ant-design/icons'
import { Card, Col, Empty, Input, List, Row, Space, Tabs, Tag, Typography } from 'antd'
import { gradeContent } from '../data'

const { Title, Paragraph, Text } = Typography

function normalizeVocabularyTopics(vocabularyTopics = []) {
  return vocabularyTopics.map((topic) => ({
    ...topic,
    words: (topic.words || []).map((entry) =>
      typeof entry === 'string'
        ? {
            word: entry,
            ipa: 'Đang cập nhật',
            meaning: 'Đang cập nhật',
            example: 'Ví dụ sẽ được bổ sung sau.',
          }
        : entry,
    ),
  }))
}

function matchesVocabulary(word, keyword) {
  const normalizedKeyword = keyword.trim().toLowerCase()

  if (!normalizedKeyword) {
    return true
  }

  return [word.word, word.meaning, word.example]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(normalizedKeyword))
}

function LessonsPage({ selectedGrade, currentGrade }) {
  const [selectedVocabularyKey, setSelectedVocabularyKey] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [activeTabKey, setActiveTabKey] = useState('units')

  const vocabularyTopics = useMemo(
    () => normalizeVocabularyTopics(currentGrade.vocabularyTopics || []),
    [currentGrade],
  )

  const searchableTopics = useMemo(() => {
    if (!searchKeyword.trim()) {
      return vocabularyTopics.map((topic) => ({
        ...topic,
        grade: selectedGrade,
      }))
    }

    return Object.entries(gradeContent).flatMap(([gradeLabel, grade]) =>
      normalizeVocabularyTopics(grade.vocabularyTopics || []).map((topic) => ({
        ...topic,
        grade: gradeLabel,
      })),
    )
  }, [searchKeyword, selectedGrade, vocabularyTopics])

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

  const vocabularyTopicMap = useMemo(
    () =>
      Object.fromEntries(
        filteredVocabularyTopics.map((topic) => [`${topic.grade}-${topic.key}`, topic]),
      ),
    [filteredVocabularyTopics],
  )

  let selectedVocabulary = null

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

  const tabItems = [
    {
      key: 'units',
      label: 'Chủ điểm học',
      children: (
        <List
          dataSource={currentGrade.units}
          renderItem={(unit) => {
            const topic = vocabularyTopicMap[`${selectedGrade}-${unit.vocabularyTopicKey}`]

            return (
              <List.Item className="unit-item">
                <Card className="unit-card" bordered={false}>
                  <Space direction="vertical" size={6}>
                    <div className="unit-head">
                      <Text strong>{unit.title}</Text>
                      {topic && (
                        <Tag bordered={false} className="topic-chip">
                          {topic.title}
                        </Tag>
                      )}
                    </div>
                    <Text>
                      <span className="label">Ngữ pháp:</span> {unit.grammar.focus}
                    </Text>
                    <Text>
                      <span className="label">Từ vựng:</span> {unit.vocabulary.summary}
                    </Text>
                    {topic && (
                      <Text className="unit-meta">{topic.words.length} từ liên kết</Text>
                    )}
                    {unit.practice?.length > 0 && (
                      <Text className="unit-meta">Luyện tập: {unit.practice[0]}</Text>
                    )}
                    {unit.project && <Text className="unit-meta">Dự án: {unit.project}</Text>}
                  </Space>
                </Card>
              </List.Item>
            )
          }}
        />
      ),
    },
    {
      key: 'vocabulary',
      label: 'Tra từ vựng',
      children: (
        <Row gutter={[18, 18]} className="vocabulary-layout">
          <Col xs={24} lg={15}>
            <Space direction="vertical" size={14} className="full-width">
              <div className="vocabulary-search-summary">
                <Text type="secondary">
                  {searchKeyword
                    ? `Tìm thấy ${totalMatchedWords} từ phù hợp trong các khối.`
                    : `Hiển thị ${totalMatchedWords} từ của ${selectedGrade}.`}
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
                              <Text strong>{topic.title}</Text>
                              <div className="vocabulary-topic-meta">
                                <Tag color="cyan" bordered={false}>
                                  {topic.grade}
                                </Tag>
                              </div>
                            </div>
                            <Text className="topic-count">{topic.words.length} từ</Text>
                          </div>
                          <div className="vocabulary-tags">
                            {topic.words.map((word) => (
                              <button
                                key={`${topic.grade}-${topic.key}-${word.word}`}
                                type="button"
                                className={`vocabulary-tag${
                                  selectedVocabulary?.word === word.word &&
                                  selectedVocabulary?.grade === topic.grade &&
                                  selectedVocabulary?.topicTitle === topic.title
                                    ? ' is-active'
                                    : ''
                                }`}
                                onClick={() =>
                                  setSelectedVocabularyKey(
                                    `${topic.grade}-${topic.key}-${word.word}`,
                                  )
                                }
                              >
                                {word.word}
                              </button>
                            ))}
                          </div>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Card className="vocabulary-card" bordered={false}>
                  <Empty description="Không tìm thấy từ vựng phù hợp." />
                </Card>
              )}
            </Space>
          </Col>

          <Col xs={24} lg={9}>
            <Card className="vocabulary-detail-panel" bordered={false}>
              {selectedVocabulary ? (
                <Space direction="vertical" size={16} className="full-width">
                  <div className="vocabulary-detail-header">
                    <div className="vocabulary-word-meta">
                      <Text className="vocabulary-detail-word">{selectedVocabulary.word}</Text>
                      <div className="vocabulary-detail-meta">
                        <Tag color="cyan" bordered={false}>
                          {selectedVocabulary.grade}
                        </Tag>
                        <Tag bordered={false} className="topic-chip">
                          {selectedVocabulary.topicTitle}
                        </Tag>
                      </div>
                    </div>
                    <Tag className="vocabulary-detail-tag" bordered={false}>
                      <SoundOutlined /> {selectedVocabulary.ipa || 'Chưa có IPA'}
                    </Tag>
                  </div>

                  <div className="vocabulary-meaning-card">
                    <Text className="vocabulary-meaning-text">{selectedVocabulary.meaning}</Text>
                  </div>

                  <div className="vocabulary-example-card">
                    <Paragraph className="vocabulary-example-text">
                      "{selectedVocabulary.example || 'Chưa có ví dụ sử dụng.'}"
                    </Paragraph>
                  </div>
                </Space>
              ) : (
                <Empty description="Chọn một từ vựng để xem chi tiết." />
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
              <Title level={2}>Nội dung học của {selectedGrade}</Title>
              <Paragraph>{currentGrade.overview}</Paragraph>
            </div>

            <div className="lesson-search-bar">
              <Input
                allowClear
                size="large"
                prefix={<SearchOutlined />}
                placeholder="Tra nhanh từ vựng toàn bộ các khối"
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
            <Text className="eyebrow">Kỹ năng trọng tâm</Text>
            <List
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
            <Text className="eyebrow">Dự án áp dụng</Text>
            <Paragraph>{currentGrade.project}</Paragraph>
          </Card>
        </Space>
      </Col>
    </Row>
  )
}

export default LessonsPage
