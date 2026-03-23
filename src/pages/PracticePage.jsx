import { useMemo, useState } from 'react'
import {
  CheckCircleOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  RightOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  Progress,
  Radio,
  Row,
  Select,
  Space,
  Tag,
  Timeline,
  Typography,
} from 'antd'

const { Title, Paragraph, Text } = Typography

const PRACTICE_MODES = [
  {
    key: 'meaning',
    title: 'Chọn nghĩa đúng',
    description: 'Nhìn từ tiếng Anh và chọn nghĩa tiếng Việt phù hợp nhất.',
    available: true,
  },
  {
    key: 'fill',
    title: 'Điền từ còn thiếu',
    description: 'Nhìn câu ví dụ có chỗ trống và chọn từ đúng để điền.',
    available: true,
  },
  {
    key: 'match',
    title: 'Ghép từ với nghĩa',
    description: 'Một lượt 4 từ, chọn đúng nghĩa cho từng từ rồi chấm điểm.',
    available: true,
  },
]

function shuffleItems(items) {
  const clonedItems = [...items]

  for (let index = clonedItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[clonedItems[index], clonedItems[swapIndex]] = [clonedItems[swapIndex], clonedItems[index]]
  }

  return clonedItems
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildQuestionPrompt(mode, entry) {
  if (mode === 'fill') {
    const pattern = new RegExp(escapeRegExp(entry.word), 'i')
    const blankedExample = entry.example?.replace(pattern, '_____')

    if (!blankedExample || blankedExample === entry.example) {
      return null
    }

    return blankedExample
  }

  return entry.word
}

function buildChoiceQuestions(words, mode) {
  if (words.length < 4) {
    return []
  }

  return shuffleItems(words)
    .map((entry) => {
      const distractors = shuffleItems(words.filter((word) => word.word !== entry.word)).slice(0, 3)
      const prompt = buildQuestionPrompt(mode, entry)

      if (!prompt) {
        return null
      }

      return {
        id: `${mode}-${entry.topicKey}-${entry.word}`,
        mode,
        prompt,
        word: entry.word,
        ipa: entry.ipa,
        meaning: entry.meaning,
        example: entry.example,
        topicTitle: entry.topicTitle,
        options:
          mode === 'fill'
            ? shuffleItems([entry.word, ...distractors.map((word) => word.word)])
            : shuffleItems([entry.meaning, ...distractors.map((word) => word.meaning)]),
        optionDetails:
          mode === 'fill'
            ? [entry, ...distractors].reduce(
                (details, word) => ({
                  ...details,
                  [word.word]: word.ipa,
                }),
                {},
              )
            : {},
        correctAnswer: mode === 'fill' ? entry.word : entry.meaning,
      }
    })
    .filter(Boolean)
    .slice(0, Math.min(words.length, 8))
}

function buildMatchRounds(words) {
  if (words.length < 4) {
    return []
  }

  const shuffledWords = shuffleItems(words).slice(0, Math.min(words.length, 8))
  const rounds = []

  for (let index = 0; index < shuffledWords.length; index += 4) {
    const pairs = shuffledWords.slice(index, index + 4)

    if (pairs.length < 4) {
      break
    }

    rounds.push({
      id: `match-${index}`,
      pairs,
      options: shuffleItems(pairs.map((pair) => pair.meaning)),
      topicTitle: pairs[0].topicTitle,
    })
  }

  return rounds
}

function PracticeChoiceSession({ selectedGrade, vocabularyPool, selectedMode }) {
  const [questions, setQuestions] = useState(() => buildChoiceQuestions(vocabularyPool, selectedMode))
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)

  const currentQuestion = questions[questionIndex]
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer

  const resetSession = () => {
    setQuestions(buildChoiceQuestions(vocabularyPool, selectedMode))
    setQuestionIndex(0)
    setSelectedAnswer(null)
    setScore(0)
    setShowResult(false)
  }

  const handleAnswer = (value) => {
    if (showResult || !currentQuestion) {
      return
    }

    setSelectedAnswer(value)
    setShowResult(true)

    if (value === currentQuestion.correctAnswer) {
      setScore((currentScore) => currentScore + 1)
    }
  }

  const handleNextQuestion = () => {
    if (questionIndex >= questions.length - 1) {
      resetSession()
      return
    }

    setQuestionIndex((currentIndex) => currentIndex + 1)
    setSelectedAnswer(null)
    setShowResult(false)
  }

  return (
    <Card className="content-card practice-quiz-card" bordered={false}>
      {!currentQuestion ? (
        <Space direction="vertical" size={12} className="full-width">
          <Title level={4} className="practice-empty-title">
            Chưa đủ dữ liệu để tạo bài luyện
          </Title>
          <Paragraph className="practice-empty-copy">
            Chủ đề này cần ít nhất 4 từ và câu ví dụ phù hợp để tạo bài luyện. Bạn thử chuyển sang
            chủ đề khác hoặc chọn tất cả chủ đề.
          </Paragraph>
        </Space>
      ) : (
        <Space direction="vertical" size={18} className="full-width">
          <div className="practice-quiz-head">
            <div>
              <Text className="page-kicker">Câu {questionIndex + 1}</Text>
              <Title level={3} className="practice-word-title">
                {selectedMode === 'fill' ? 'Điền vào chỗ trống' : currentQuestion.word}
              </Title>
            </div>
            <div className="practice-question-meta">
              <Tag color="cyan">{selectedGrade}</Tag>
              <Tag color="orange">{currentQuestion.topicTitle}</Tag>
            </div>
          </div>

          {selectedMode !== 'fill' ? (
            <div className="practice-pronunciation">
              <Text>{currentQuestion.ipa || 'Phiên âm sẽ được cập nhật thêm.'}</Text>
            </div>
          ) : null}

          <div className="practice-question-panel">
            {selectedMode === 'fill' ? (
              <>
                <Text className="page-kicker">Câu ví dụ</Text>
                <Paragraph className="practice-sentence-prompt">{currentQuestion.prompt}</Paragraph>
              </>
            ) : (
              <Paragraph className="practice-question-copy">
                Chọn nghĩa tiếng Việt đúng nhất cho từ trên.
              </Paragraph>
            )}
          </div>

          <Radio.Group
            value={selectedAnswer}
            onChange={(event) => handleAnswer(event.target.value)}
            className="practice-options"
          >
            <Space direction="vertical" size={12} className="full-width">
              {currentQuestion.options.map((option) => {
                let optionState = ''

                if (showResult && option === currentQuestion.correctAnswer) {
                  optionState = 'is-correct'
                } else if (showResult && option === selectedAnswer) {
                  optionState = 'is-wrong'
                }

                return (
                  <Radio.Button
                    key={option}
                    value={option}
                    className={`practice-option ${optionState}`.trim()}
                  >
                    {selectedMode === 'fill' ? (
                      <span className="practice-option-copy">
                        <span className="practice-option-word">{option}</span>
                        <span className="practice-option-ipa">
                          {currentQuestion.optionDetails?.[option] || 'Đang cập nhật'}
                        </span>
                      </span>
                    ) : (
                      option
                    )}
                  </Radio.Button>
                )
              })}
            </Space>
          </Radio.Group>

          {showResult ? (
            <div className={`practice-feedback ${isCorrect ? 'is-correct' : 'is-wrong'}`}>
              <Space direction="vertical" size={6}>
                <Text strong>{isCorrect ? 'Chính xác rồi' : 'Chưa đúng rồi'}</Text>
                {!isCorrect ? (
                  <Text>
                    Đáp án đúng là: {currentQuestion.correctAnswer}
                    {selectedMode === 'meaning' ? ` - ${currentQuestion.meaning}` : ''}
                  </Text>
                ) : null}
                <Text type="secondary">Ví dụ đầy đủ: {currentQuestion.example}</Text>
                <Text type="secondary">Nghĩa tiếng Việt: {currentQuestion.meaning}</Text>
                <Text type="secondary">
                  Điểm hiện tại: {score}/{questions.length}
                </Text>
              </Space>
            </div>
          ) : null}

          <div className="practice-actions">
            <Button icon={<ReloadOutlined />} onClick={resetSession}>
              Làm lại bộ câu hỏi
            </Button>
            <Button
              type="primary"
              icon={<RightOutlined />}
              iconPosition="end"
              onClick={handleNextQuestion}
              disabled={!showResult}
            >
              {questionIndex >= questions.length - 1 ? 'Chơi lại từ đầu' : 'Câu tiếp theo'}
            </Button>
          </div>
        </Space>
      )}
    </Card>
  )
}

function PracticeMatchSession({ selectedGrade, vocabularyPool }) {
  const [rounds, setRounds] = useState(() => buildMatchRounds(vocabularyPool))
  const [roundIndex, setRoundIndex] = useState(0)
  const [selectedPairs, setSelectedPairs] = useState({})
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [roundScore, setRoundScore] = useState(0)

  const currentRound = rounds[roundIndex]
  const totalPossibleScore = rounds.length * 4

  const resetSession = () => {
    setRounds(buildMatchRounds(vocabularyPool))
    setRoundIndex(0)
    setSelectedPairs({})
    setShowResult(false)
    setScore(0)
    setRoundScore(0)
  }

  const handleSelectMeaning = (word, meaning) => {
    if (showResult) {
      return
    }

    setSelectedPairs((currentPairs) => ({
      ...currentPairs,
      [word]: meaning,
    }))
  }

  const handleCheckRound = () => {
    if (!currentRound) {
      return
    }

    const matchedCount = currentRound.pairs.reduce((count, pair) => {
      return selectedPairs[pair.word] === pair.meaning ? count + 1 : count
    }, 0)

    setRoundScore(matchedCount)
    setScore((currentScore) => currentScore + matchedCount)
    setShowResult(true)
  }

  const handleNextRound = () => {
    if (roundIndex >= rounds.length - 1) {
      resetSession()
      return
    }

    setRoundIndex((currentIndex) => currentIndex + 1)
    setSelectedPairs({})
    setShowResult(false)
    setRoundScore(0)
  }

  const allPairsSelected =
    currentRound?.pairs.every((pair) => Boolean(selectedPairs[pair.word])) ?? false

  return (
    <Card className="content-card practice-quiz-card" bordered={false}>
      {!currentRound ? (
        <Space direction="vertical" size={12} className="full-width">
          <Title level={4} className="practice-empty-title">
            Chưa đủ dữ liệu để ghép từ với nghĩa
          </Title>
          <Paragraph className="practice-empty-copy">
            Chủ đề này cần ít nhất 4 từ để tạo một lượt ghép hoàn chỉnh.
          </Paragraph>
        </Space>
      ) : (
        <Space direction="vertical" size={18} className="full-width">
          <div className="practice-quiz-head">
            <div>
              <Text className="page-kicker">Lượt {roundIndex + 1}</Text>
              <Title level={3} className="practice-word-title">
                Ghép từ với nghĩa
              </Title>
            </div>
            <div className="practice-question-meta">
              <Tag color="cyan">{selectedGrade}</Tag>
              <Tag color="orange">{currentRound.topicTitle}</Tag>
            </div>
          </div>

          <div className="practice-question-panel">
            <Text className="page-kicker">Hướng dẫn</Text>
            <Paragraph className="practice-question-copy">
              Chọn nghĩa đúng cho từng từ bên dưới, sau đó bấm `Chấm điểm`.
            </Paragraph>
          </div>

          <div className="practice-match-list">
            {currentRound.pairs.map((pair, index) => {
              const isPairCorrect = selectedPairs[pair.word] === pair.meaning
              const rowState = showResult ? (isPairCorrect ? 'is-correct' : 'is-wrong') : ''

              return (
                <div key={pair.word} className={`practice-match-row ${rowState}`.trim()}>
                  <div className="practice-match-word">
                    <Text className="practice-match-index">{index + 1}</Text>
                    <div>
                      <Text strong>{pair.word}</Text>
                      <Text className="practice-match-ipa">{pair.ipa || 'Phiên âm đang cập nhật'}</Text>
                    </div>
                  </div>

                  <Select
                    value={selectedPairs[pair.word]}
                    placeholder="Chọn nghĩa phù hợp"
                    onChange={(value) => handleSelectMeaning(pair.word, value)}
                    className="practice-match-select"
                    options={currentRound.options.map((option) => ({
                      label: option,
                      value: option,
                    }))}
                    disabled={showResult}
                  />
                </div>
              )
            })}
          </div>

          {showResult ? (
            <div className={`practice-feedback ${roundScore === 4 ? 'is-correct' : 'is-wrong'}`}>
              <Space direction="vertical" size={6}>
                <Text strong>
                  {roundScore === 4
                    ? 'Bạn ghép đúng hết rồi'
                    : `Bạn ghép đúng ${roundScore}/4 cặp trong lượt này`}
                </Text>
                {currentRound.pairs.map((pair) => (
                  <Text key={pair.word} type="secondary">
                    {pair.word}: {pair.meaning}
                  </Text>
                ))}
                <Text type="secondary">
                  Tổng điểm hiện tại: {score}/{totalPossibleScore}
                </Text>
              </Space>
            </div>
          ) : null}

          <div className="practice-actions">
            <Button icon={<ReloadOutlined />} onClick={resetSession}>
              Làm lại lượt ghép
            </Button>
            <Space>
              <Button type="default" onClick={handleCheckRound} disabled={!allPairsSelected || showResult}>
                Chấm điểm
              </Button>
              <Button
                type="primary"
                icon={<RightOutlined />}
                iconPosition="end"
                onClick={handleNextRound}
                disabled={!showResult}
              >
                {roundIndex >= rounds.length - 1 ? 'Chơi lại từ đầu' : 'Lượt tiếp theo'}
              </Button>
            </Space>
          </div>
        </Space>
      )}
    </Card>
  )
}

function PracticePage({ selectedGrade, currentGrade, learningSteps }) {
  const [selectedTopicKey, setSelectedTopicKey] = useState('all')
  const [selectedMode, setSelectedMode] = useState('meaning')

  const topicOptions = useMemo(
    () => [
      { key: 'all', title: 'Tất cả chủ đề' },
      ...currentGrade.vocabularyTopics.map((topic) => ({
        key: topic.key,
        title: topic.title,
      })),
    ],
    [currentGrade.vocabularyTopics],
  )

  const vocabularyPool = useMemo(() => {
    const filteredTopics =
      selectedTopicKey === 'all'
        ? currentGrade.vocabularyTopics
        : currentGrade.vocabularyTopics.filter((topic) => topic.key === selectedTopicKey)

    return filteredTopics.flatMap((topic) =>
      topic.words.map((word) => ({
        ...word,
        topicKey: topic.key,
        topicTitle: topic.title,
      })),
    )
  }, [currentGrade.vocabularyTopics, selectedTopicKey])

  const activeTopicCount =
    selectedTopicKey === 'all'
      ? currentGrade.vocabularyTopics.length
      : currentGrade.vocabularyTopics.filter((topic) => topic.key === selectedTopicKey).length

  return (
    <Row gutter={[18, 18]}>
      <Col xs={24} xl={16}>
        <Space direction="vertical" size={18} className="full-width">
          <Card className="content-card practice-hero-card" bordered={false}>
            <Space direction="vertical" size={18} className="full-width">
              <div className="section-heading">
                <Title level={2}>Luyện tập</Title>
                <Paragraph>
                  Chọn kiểu luyện phù hợp với {selectedGrade}, sau đó làm nhanh từng câu để ghi
                  nhớ từ vựng tốt hơn.
                </Paragraph>
              </div>

              <Row gutter={[14, 14]}>
                {PRACTICE_MODES.map((mode) => {
                  const isActive = mode.key === selectedMode

                  return (
                    <Col xs={24} md={8} key={mode.key}>
                      <button
                        type="button"
                        className={`practice-mode-card${isActive ? ' is-active' : ''}${
                          mode.available ? '' : ' is-disabled'
                        }`}
                        onClick={() => mode.available && setSelectedMode(mode.key)}
                      >
                        <div className="practice-mode-head">
                          <Text strong>{mode.title}</Text>
                          <Tag color={mode.available ? 'cyan' : 'default'}>
                            {mode.available ? 'Đang dùng' : 'Sắp có'}
                          </Tag>
                        </div>
                        <Text className="practice-mode-copy">{mode.description}</Text>
                      </button>
                    </Col>
                  )
                })}
              </Row>

              <div className="practice-topic-filter">
                {topicOptions.map((topic) => (
                  <button
                    key={topic.key}
                    type="button"
                    className={`practice-topic-chip${
                      selectedTopicKey === topic.key ? ' is-active' : ''
                    }`}
                    onClick={() => setSelectedTopicKey(topic.key)}
                  >
                    {topic.title}
                  </button>
                ))}
              </div>
            </Space>
          </Card>

          {selectedMode === 'match' ? (
            <PracticeMatchSession
              key={`${selectedGrade}-${selectedTopicKey}-${selectedMode}`}
              selectedGrade={selectedGrade}
              vocabularyPool={vocabularyPool}
            />
          ) : (
            <PracticeChoiceSession
              key={`${selectedGrade}-${selectedTopicKey}-${selectedMode}`}
              selectedGrade={selectedGrade}
              vocabularyPool={vocabularyPool}
              selectedMode={selectedMode}
            />
          )}
        </Space>
      </Col>

      <Col xs={24} xl={8}>
        <Space direction="vertical" size={18} className="full-width">
          <Card className="content-card highlight-card" bordered={false}>
            <Space direction="vertical" size={16} className="full-width">
              <div className="practice-score-head">
                <div>
                  <Text className="page-kicker">Tổng quan lượt luyện</Text>
                  <Title level={4} className="practice-score-title">
                    {vocabularyPool.length} từ sẵn sàng
                  </Title>
                </div>
                <TrophyOutlined className="practice-score-icon" />
              </div>

              <Progress
                percent={Math.min(100, Math.round((vocabularyPool.length / 8) * 100))}
                strokeColor="#2a9d8f"
                showInfo={false}
              />

              <div className="practice-score-grid">
                <div className="practice-score-box">
                  <CheckCircleOutlined />
                  <Text>{activeTopicCount} chủ đề đang mở</Text>
                </div>
                <div className="practice-score-box">
                  <PlayCircleOutlined />
                  <Text>{Math.min(vocabularyPool.length, 8)} câu mỗi lượt</Text>
                </div>
              </div>
            </Space>
          </Card>

          <Card className="content-card side-card" bordered={false}>
            <Title level={4}>Gợi ý luyện hiệu quả</Title>
            <Timeline
              items={learningSteps.map((step) => ({
                color: '#e76f51',
                children: step,
              }))}
            />
          </Card>

          <Card className="content-card" bordered={false}>
            <Space direction="vertical" size={12} className="full-width">
              <Title level={5} className="practice-mini-title">
                Hôm nay nên luyện gì?
              </Title>
              {currentGrade.exercises.map((exercise) => (
                <div key={exercise} className="practice-mini-item">
                  <PlayCircleOutlined className="accent-icon" />
                  <Text>{exercise}</Text>
                </div>
              ))}
            </Space>
          </Card>
        </Space>
      </Col>
    </Row>
  )
}

export default PracticePage
