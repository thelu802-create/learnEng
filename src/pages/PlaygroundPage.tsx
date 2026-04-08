import { useMemo, useState } from 'react'
import {
  BulbOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  RightOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import { Button, Card, Col, Input, Progress, Radio, Row, Space, Tag, Typography } from 'antd'
import { useI18n } from '../i18n'
import type { GradeContent, GradeKey, VocabularyWord } from '../types'

const { Title, Paragraph, Text } = Typography

interface PlaygroundPageProps {
  selectedGrade: GradeKey
  currentGrade: GradeContent
}

interface PlaygroundWord extends VocabularyWord {
  topicKey: string
  topicTitle: string
}

function shuffleItems<T>(items: T[]): T[] {
  const clonedItems = [...items]

  for (let index = clonedItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[clonedItems[index], clonedItems[swapIndex]] = [clonedItems[swapIndex], clonedItems[index]]
  }

  return clonedItems
}

function scrambleWord(word: string): string {
  if (word.length < 4) {
    return word
  }

  const letters = shuffleItems(word.split(''))
  const scrambled = letters.join('')
  return scrambled.toLowerCase() === word.toLowerCase() ? word.split('').reverse().join('') : scrambled
}

function PlaygroundPage({ selectedGrade, currentGrade }: PlaygroundPageProps) {
  const { language, gradeLabel } = useI18n()
  const [scrambleIndex, setScrambleIndex] = useState(0)
  const [scrambleAnswer, setScrambleAnswer] = useState('')
  const [scrambleChecked, setScrambleChecked] = useState(false)
  const [scrambleScore, setScrambleScore] = useState(0)
  const [meaningRound, setMeaningRound] = useState(0)
  const [selectedMeaning, setSelectedMeaning] = useState('')
  const [meaningChecked, setMeaningChecked] = useState(false)
  const [meaningScore, setMeaningScore] = useState(0)

  const copy =
    language === 'en'
      ? {
          scrambleTitle: 'Word scramble',
          scrambleCopy: 'Look at the mixed-up word, type the correct answer, then move to the next round.',
          meaningTitle: 'Meaning sprint',
          meaningCopy: 'Read the meaning and choose the matching English word as quickly as you can.',
          check: 'Check answer',
          next: 'Next round',
          playAgain: 'Play again',
          yourAnswer: 'Your answer',
          answerPlaceholder: 'Type the correct word',
          correct: 'Correct',
          tryAgain: 'Not quite right',
          answerReveal: 'Correct answer',
          topicLabel: 'Topic',
          scoreLabel: 'Score',
          roundsLabel: 'Rounds',
          readyWords: 'words ready',
          ofLabel: 'of',
          modeScramble: 'Scramble',
          modeMeaning: 'Meaning',
          progressCopy: 'Quick classroom warm-up or a short homework review.',
        }
      : {
          scrambleTitle: 'Xếp lại chữ',
          scrambleCopy: 'Nhìn từ bị đảo chữ, nhập đáp án đúng rồi chuyển sang lượt tiếp theo.',
          meaningTitle: 'Chọn từ đúng theo nghĩa',
          meaningCopy: 'Đọc nghĩa tiếng Việt và chọn nhanh từ tiếng Anh phù hợp nhất.',
          check: 'Kiểm tra',
          next: 'Lượt tiếp theo',
          playAgain: 'Chơi lại',
          yourAnswer: 'Câu trả lời của bạn',
          answerPlaceholder: 'Nhập từ đúng',
          correct: 'Chính xác rồi',
          tryAgain: 'Chưa đúng, thử lại nhé',
          answerReveal: 'Đáp án đúng',
          topicLabel: 'Chủ điểm',
          scoreLabel: 'Điểm',
          roundsLabel: 'Lượt chơi',
          readyWords: 'từ sẵn sàng',
          ofLabel: 'trên',
          modeScramble: 'Đảo chữ',
          modeMeaning: 'Theo nghĩa',
          progressCopy: 'Phù hợp để khởi động tiết học hoặc ôn nhanh cuối buổi.',
        }

  const words = useMemo<PlaygroundWord[]>(
    () =>
      currentGrade.vocabularyTopics.flatMap((topic) =>
        topic.words.map((word) => ({
          ...word,
          topicKey: topic.key,
          topicTitle: topic.title,
        })),
      ),
    [currentGrade],
  )

  const scrambleRounds = useMemo(
    () =>
      shuffleItems(words)
        .filter((word) => word.word.trim().length >= 3)
        .slice(0, 8)
        .map((word) => ({
          ...word,
          scrambled: scrambleWord(word.word),
        })),
    [words],
  )

  const meaningRounds = useMemo(
    () =>
      shuffleItems(words)
        .slice(0, 8)
        .map((word) => {
          const distractors = shuffleItems(words.filter((item) => item.word !== word.word))
            .slice(0, 3)
            .map((item) => item.word)

          return {
            ...word,
            options: shuffleItems([word.word, ...distractors]),
          }
        }),
    [words],
  )

  const currentScramble = scrambleRounds[scrambleIndex] ?? null
  const currentMeaning = meaningRounds[meaningRound] ?? null
  const totalRounds = Math.max(scrambleRounds.length, meaningRounds.length, 1)

  const checkScramble = () => {
    if (!currentScramble || scrambleChecked) {
      return
    }

    const isCorrect = scrambleAnswer.trim().toLowerCase() === currentScramble.word.trim().toLowerCase()
    if (isCorrect) {
      setScrambleScore((score) => score + 1)
    }
    setScrambleChecked(true)
  }

  const nextScramble = () => {
    const isLast = scrambleIndex >= scrambleRounds.length - 1
    if (isLast) {
      setScrambleIndex(0)
      setScrambleAnswer('')
      setScrambleChecked(false)
      setScrambleScore(0)
      return
    }

    setScrambleIndex((index) => index + 1)
    setScrambleAnswer('')
    setScrambleChecked(false)
  }

  const checkMeaning = () => {
    if (!currentMeaning || meaningChecked || !selectedMeaning) {
      return
    }

    if (selectedMeaning === currentMeaning.word) {
      setMeaningScore((score) => score + 1)
    }
    setMeaningChecked(true)
  }

  const nextMeaning = () => {
    const isLast = meaningRound >= meaningRounds.length - 1
    if (isLast) {
      setMeaningRound(0)
      setSelectedMeaning('')
      setMeaningChecked(false)
      setMeaningScore(0)
      return
    }

    setMeaningRound((round) => round + 1)
    setSelectedMeaning('')
    setMeaningChecked(false)
  }

  return (
    <Space orientation="vertical" size={20} className="full-width">
      <div className="playground-hero-meta">
        <Tag color="cyan" variant="filled">
          {gradeLabel(selectedGrade)}
        </Tag>
        <Tag color="geekblue" variant="filled">
          {words.length} {copy.readyWords}
        </Tag>
        <Tag color="green" variant="filled">
          {copy.progressCopy}
        </Tag>
      </div>

      <Row gutter={[18, 18]}>
        <Col xs={24} xl={12}>
          <Card className="content-card playground-card" variant="borderless">
            <Space orientation="vertical" size={18} className="full-width">
              <div className="playground-card-head">
                <div className="settings-heading">
                  <PlayCircleOutlined />
                  <Title level={4}>{copy.scrambleTitle}</Title>
                </div>
                <Tag color="blue" variant="filled">
                  {copy.modeScramble}
                </Tag>
              </div>

              <Paragraph className="settings-copy">{copy.scrambleCopy}</Paragraph>

              {currentScramble ? (
                <>
                  <div className="playground-scorebar">
                    <div className="playground-scorebox">
                      <Text className="page-kicker">{copy.scoreLabel}</Text>
                      <Title level={3}>
                        {scrambleScore}/{scrambleRounds.length}
                      </Title>
                    </div>
                    <div className="playground-scorebox">
                      <Text className="page-kicker">{copy.roundsLabel}</Text>
                      <Title level={3}>
                        {scrambleIndex + 1} {copy.ofLabel} {scrambleRounds.length}
                      </Title>
                    </div>
                  </div>

                  <div className="playground-word-card">
                    <Text className="page-kicker">{copy.topicLabel}</Text>
                    <Text strong>{currentScramble.topicTitle}</Text>
                    <div className="playground-word-scramble">{currentScramble.scrambled}</div>
                  </div>

                  <div className="playground-answer-block">
                    <Text className="page-kicker">{copy.yourAnswer}</Text>
                    <Input
                      value={scrambleAnswer}
                      onChange={(event) => setScrambleAnswer(event.target.value)}
                      placeholder={copy.answerPlaceholder}
                      disabled={scrambleChecked}
                    />
                  </div>

                  {scrambleChecked ? (
                    <div className={`playground-feedback ${scrambleAnswer.trim().toLowerCase() === currentScramble.word.toLowerCase() ? 'is-correct' : 'is-wrong'}`}>
                      <Space size={10} align="start">
                        {scrambleAnswer.trim().toLowerCase() === currentScramble.word.toLowerCase() ? (
                          <CheckCircleOutlined />
                        ) : (
                          <BulbOutlined />
                        )}
                        <div>
                          <Text strong>
                            {scrambleAnswer.trim().toLowerCase() === currentScramble.word.toLowerCase()
                              ? copy.correct
                              : copy.tryAgain}
                          </Text>
                          <Paragraph className="settings-copy">
                            {copy.answerReveal}: <strong>{currentScramble.word}</strong>
                          </Paragraph>
                        </div>
                      </Space>
                    </div>
                  ) : null}

                  <div className="playground-actions">
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={checkScramble}
                      disabled={!scrambleAnswer.trim() || scrambleChecked}
                    >
                      {copy.check}
                    </Button>
                    <Button icon={scrambleIndex >= scrambleRounds.length - 1 ? <ReloadOutlined /> : <RightOutlined />} onClick={nextScramble}>
                      {scrambleIndex >= scrambleRounds.length - 1 ? copy.playAgain : copy.next}
                    </Button>
                  </div>
                </>
              ) : (
                <Paragraph className="settings-copy">{language === 'en' ? 'Not enough words yet.' : 'Chưa đủ từ để chơi.'}</Paragraph>
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card className="content-card playground-card" variant="borderless">
            <Space orientation="vertical" size={18} className="full-width">
              <div className="playground-card-head">
                <div className="settings-heading">
                  <TrophyOutlined />
                  <Title level={4}>{copy.meaningTitle}</Title>
                </div>
                <Tag color="gold" variant="filled">
                  {copy.modeMeaning}
                </Tag>
              </div>

              <Paragraph className="settings-copy">{copy.meaningCopy}</Paragraph>

              {currentMeaning ? (
                <>
                  <div className="playground-scorebar">
                    <div className="playground-scorebox">
                      <Text className="page-kicker">{copy.scoreLabel}</Text>
                      <Title level={3}>
                        {meaningScore}/{meaningRounds.length}
                      </Title>
                    </div>
                    <div className="playground-scorebox">
                      <Text className="page-kicker">{copy.roundsLabel}</Text>
                      <Title level={3}>
                        {meaningRound + 1} {copy.ofLabel} {meaningRounds.length}
                      </Title>
                    </div>
                  </div>

                  <Progress percent={Math.round(((meaningRound + 1) / totalRounds) * 100)} showInfo={false} strokeColor="#2a9d8f" />

                  <div className="playground-word-card">
                    <Text className="page-kicker">{copy.topicLabel}</Text>
                    <Text strong>{currentMeaning.topicTitle}</Text>
                    <div className="playground-meaning-card">{currentMeaning.meaning}</div>
                  </div>

                  <Radio.Group
                    value={selectedMeaning}
                    onChange={(event) => setSelectedMeaning(event.target.value)}
                    className="playground-options"
                    disabled={meaningChecked}
                  >
                    {currentMeaning.options.map((option) => {
                      const isCorrect = option === currentMeaning.word
                      const isSelected = selectedMeaning === option
                      const optionState =
                        meaningChecked && isCorrect
                          ? 'is-correct'
                          : meaningChecked && isSelected && !isCorrect
                            ? 'is-wrong'
                            : ''

                      return (
                        <Radio.Button value={option} key={option} className={`playground-option ${optionState}`.trim()}>
                          {option}
                        </Radio.Button>
                      )
                    })}
                  </Radio.Group>

                  {meaningChecked ? (
                    <div className={`playground-feedback ${selectedMeaning === currentMeaning.word ? 'is-correct' : 'is-wrong'}`}>
                      <Space size={10} align="start">
                        {selectedMeaning === currentMeaning.word ? <CheckCircleOutlined /> : <BulbOutlined />}
                        <div>
                          <Text strong>{selectedMeaning === currentMeaning.word ? copy.correct : copy.tryAgain}</Text>
                          <Paragraph className="settings-copy">
                            {copy.answerReveal}: <strong>{currentMeaning.word}</strong>
                          </Paragraph>
                        </div>
                      </Space>
                    </div>
                  ) : null}

                  <div className="playground-actions">
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={checkMeaning}
                      disabled={!selectedMeaning || meaningChecked}
                    >
                      {copy.check}
                    </Button>
                    <Button icon={meaningRound >= meaningRounds.length - 1 ? <ReloadOutlined /> : <RightOutlined />} onClick={nextMeaning}>
                      {meaningRound >= meaningRounds.length - 1 ? copy.playAgain : copy.next}
                    </Button>
                  </div>
                </>
              ) : (
                <Paragraph className="settings-copy">{language === 'en' ? 'Not enough words yet.' : 'Chưa đủ từ để chơi.'}</Paragraph>
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  )
}

export default PlaygroundPage
