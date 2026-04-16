import { useState } from 'react'
import { ReloadOutlined, RightOutlined } from '@ant-design/icons'
import { Button, Card, Radio, Space, Tag, Typography } from 'antd'
import { useI18n } from '../../../i18n'
import { buildChoiceQuestions } from '../utils'
import type { ChoiceQuestion, PracticeChoiceSessionProps } from '../types'

const { Title, Paragraph, Text } = Typography

export function PracticeChoiceSession({
  selectedGrade,
  vocabularyPool,
  selectedMode,
}: PracticeChoiceSessionProps) {
  const { t, gradeLabel } = useI18n()
  const [questions, setQuestions] = useState<ChoiceQuestion[]>(() =>
    buildChoiceQuestions(vocabularyPool, selectedMode),
  )
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
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

  const handleAnswer = (value: string) => {
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
    <Card className="content-card practice-quiz-card" variant="borderless">
      {!currentQuestion ? (
        <Space orientation="vertical" size={12} className="full-width">
          <Title level={4} className="practice-empty-title">
            {t('common.noData')}
          </Title>
          <Paragraph className="practice-empty-copy">{t('practice.quizNeedMore')}</Paragraph>
        </Space>
      ) : (
        <Space orientation="vertical" size={18} className="full-width">
          <div className="practice-quiz-head">
            <div>
              <Text className="page-kicker">
                {t('practice.question', { count: questionIndex + 1 })}
              </Text>
              <Title level={3} className="practice-word-title">
                {selectedMode === 'fill' ? t('practice.fillTitle') : currentQuestion.word}
              </Title>
            </div>
            <div className="practice-question-meta">
              <Tag color="cyan">{gradeLabel(selectedGrade)}</Tag>
              <Tag color="orange">{currentQuestion.topicTitle}</Tag>
            </div>
          </div>

          {selectedMode !== 'fill' ? (
            <div className="practice-pronunciation">
              <Text>{currentQuestion.ipa || t('lessons.noIpa')}</Text>
            </div>
          ) : null}

          <div className="practice-question-panel">
            {selectedMode === 'fill' ? (
              <>
                <Text className="page-kicker">{t('practice.sentenceLabel')}</Text>
                <Paragraph className="practice-sentence-prompt">{currentQuestion.prompt}</Paragraph>
              </>
            ) : (
              <Paragraph className="practice-question-copy">{t('practice.chooseMeaning')}</Paragraph>
            )}
          </div>

          <Radio.Group
            value={selectedAnswer}
            onChange={(event) => handleAnswer(event.target.value)}
            className="practice-options"
          >
            <Space orientation="vertical" size={12} className="full-width">
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
                          {currentQuestion.optionDetails[option] || t('common.noData')}
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
              <Space orientation="vertical" size={6} className="full-width">
                <Text strong>{isCorrect ? t('practice.correct') : t('practice.wrong')}</Text>
                {!isCorrect ? (
                  <Text>
                    {t('practice.correctAnswer', {
                      answer:
                        selectedMode === 'meaning'
                          ? `${currentQuestion.correctAnswer} - ${currentQuestion.meaning}`
                          : currentQuestion.correctAnswer,
                    })}
                  </Text>
                ) : null}
                <Text type="secondary">
                  {t('practice.fullExample', { value: currentQuestion.example })}
                </Text>
                <Text type="secondary">
                  {t('practice.vietnameseMeaning', { value: currentQuestion.meaning })}
                </Text>
                <Text type="secondary">
                  {t('practice.currentScore', { score, total: questions.length })}
                </Text>
              </Space>
            </div>
          ) : null}

          <div className="practice-actions">
            <Button icon={<ReloadOutlined />} onClick={resetSession}>
              {t('practice.resetQuestionSet')}
            </Button>
            <Button
              type="primary"
              icon={<RightOutlined />}
              iconPlacement="end"
              onClick={handleNextQuestion}
              disabled={!showResult}
            >
              {questionIndex >= questions.length - 1 ? t('practice.restart') : t('practice.nextQuestion')}
            </Button>
          </div>
        </Space>
      )}
    </Card>
  )
}
