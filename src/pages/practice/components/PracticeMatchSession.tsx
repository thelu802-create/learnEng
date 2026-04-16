import { useState } from 'react'
import { ReloadOutlined, RightOutlined } from '@ant-design/icons'
import { Button, Card, Select, Space, Tag, Typography } from 'antd'
import { useI18n } from '../../../i18n'
import { buildMatchRounds } from '../utils'
import type { MatchRound, PracticeMatchSessionProps } from '../types'

const { Title, Paragraph, Text } = Typography

export function PracticeMatchSession({ selectedGrade, vocabularyPool }: PracticeMatchSessionProps) {
  const { t, gradeLabel } = useI18n()
  const [rounds, setRounds] = useState<MatchRound[]>(() => buildMatchRounds(vocabularyPool))
  const [roundIndex, setRoundIndex] = useState(0)
  const [selectedPairs, setSelectedPairs] = useState<Record<string, string>>({})
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

  const handleSelectMeaning = (word: string, meaning: string) => {
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
    <Card className="content-card practice-quiz-card" variant="borderless">
      {!currentRound ? (
        <Space orientation="vertical" size={12} className="full-width">
          <Title level={4} className="practice-empty-title">
            {t('common.noData')}
          </Title>
          <Paragraph className="practice-empty-copy">{t('practice.matchNeedMore')}</Paragraph>
        </Space>
      ) : (
        <Space orientation="vertical" size={18} className="full-width">
          <div className="practice-quiz-head">
            <div>
              <Text className="page-kicker">{t('practice.round', { count: roundIndex + 1 })}</Text>
              <Title level={3} className="practice-word-title">
                {t('practice.matchTitle')}
              </Title>
            </div>
            <div className="practice-question-meta">
              <Tag color="cyan">{gradeLabel(selectedGrade)}</Tag>
              <Tag color="orange">{currentRound.topicTitle}</Tag>
            </div>
          </div>

          <div className="practice-question-panel">
            <Text className="page-kicker">{t('practice.instructions')}</Text>
            <Paragraph className="practice-question-copy">{t('practice.matchInstructions')}</Paragraph>
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
                      <Text className="practice-match-ipa">
                        {pair.ipa || t('lessons.noIpa')}
                      </Text>
                    </div>
                  </div>

                  <Select
                    value={selectedPairs[pair.word]}
                    placeholder={t('practice.meaningPlaceholder')}
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
              <Space orientation="vertical" size={6} className="full-width">
                <Text strong>
                  {roundScore === 4
                    ? t('practice.matchPerfect')
                    : t('practice.matchScore', { score: roundScore })}
                </Text>
                {currentRound.pairs.map((pair) => (
                  <Text key={pair.word} type="secondary">
                    {pair.word}: {pair.meaning}
                  </Text>
                ))}
                <Text type="secondary">
                  {t('practice.totalScore', { score, total: totalPossibleScore })}
                </Text>
              </Space>
            </div>
          ) : null}

          <div className="practice-actions">
            <Button icon={<ReloadOutlined />} onClick={resetSession}>
              {t('practice.resetMatchSet')}
            </Button>
            <Space>
              <Button
                type="default"
                onClick={handleCheckRound}
                disabled={!allPairsSelected || showResult}
              >
                {t('practice.checkScore')}
              </Button>
              <Button
                type="primary"
                icon={<RightOutlined />}
                iconPlacement="end"
                onClick={handleNextRound}
                disabled={!showResult}
              >
                {roundIndex >= rounds.length - 1 ? t('practice.restart') : t('practice.nextRound')}
              </Button>
            </Space>
          </div>
        </Space>
      )}
    </Card>
  )
}
