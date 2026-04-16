import test from 'node:test'
import assert from 'node:assert/strict'
import { buildChoiceQuestions, buildMatchRounds, mapVocabularyPool } from './utils.ts'
import type { PracticeVocabularyWord } from './types.ts'
import type { VocabularyTopic } from '../../types.ts'

const baseWords: PracticeVocabularyWord[] = [
  {
    word: 'apple',
    ipa: '/ap/',
    meaning: 'qua tao',
    example: 'I eat an apple every day.',
    topicKey: 'food',
    topicTitle: 'Food',
  },
  {
    word: 'banana',
    ipa: '/ba/',
    meaning: 'qua chuoi',
    example: 'The banana is yellow.',
    topicKey: 'food',
    topicTitle: 'Food',
  },
  {
    word: 'carrot',
    ipa: '/ca/',
    meaning: 'ca rot',
    example: 'A carrot grows underground.',
    topicKey: 'food',
    topicTitle: 'Food',
  },
  {
    word: 'dragonfruit',
    ipa: '/dr/',
    meaning: 'thanh long',
    example: 'Dragonfruit is popular in Vietnam.',
    topicKey: 'food',
    topicTitle: 'Food',
  },
]

test('mapVocabularyPool flattens topics and keeps topic metadata', () => {
  const topics: VocabularyTopic[] = [
    {
      key: 'food',
      title: 'Food',
      words: [
        { word: 'apple', ipa: '/ap/', meaning: 'qua tao', example: 'I eat an apple every day.' },
        { word: 'banana', ipa: '/ba/', meaning: 'qua chuoi', example: 'The banana is yellow.' },
      ],
    },
    {
      key: 'school',
      title: 'School',
      words: [
        { word: 'desk', ipa: '/de/', meaning: 'ban hoc', example: 'The desk is clean.' },
      ],
    },
  ]

  const result = mapVocabularyPool(topics, 'all')

  assert.equal(result.length, 3)
  assert.deepEqual(
    result.map((word) => [word.word, word.topicKey, word.topicTitle]),
    [
      ['apple', 'food', 'Food'],
      ['banana', 'food', 'Food'],
      ['desk', 'school', 'School'],
    ],
  )
})

test('buildChoiceQuestions returns empty when there are fewer than four words', () => {
  const result = buildChoiceQuestions(baseWords.slice(0, 3), 'meaning')
  assert.deepEqual(result, [])
})

test('buildChoiceQuestions in fill mode blanks the target word and keeps ipa details', () => {
  const result = buildChoiceQuestions(baseWords, 'fill')

  assert.equal(result.length, 4)
  for (const question of result) {
    assert.equal(question.mode, 'fill')
    assert.match(question.prompt, /_____/)
    assert.ok(question.options.includes(question.correctAnswer))
    assert.equal(question.optionDetails[question.correctAnswer].length > 0, true)
  }
})

test('buildChoiceQuestions skips fill questions when the example does not contain the word', () => {
  const words = [
    ...baseWords,
    {
      word: 'pear',
      ipa: '/pe/',
      meaning: 'qua le',
      example: 'This fruit is sweet.',
      topicKey: 'food',
      topicTitle: 'Food',
    },
  ]

  const result = buildChoiceQuestions(words, 'fill')
  assert.equal(result.length, 4)
  assert.ok(result.every((question) => question.word !== 'pear'))
})

test('buildMatchRounds creates groups of four with matching option pools', () => {
  const words = [
    ...baseWords,
    {
      word: 'egg',
      ipa: '/eg/',
      meaning: 'trung',
      example: 'An egg is on the table.',
      topicKey: 'food',
      topicTitle: 'Food',
    },
    {
      word: 'fish',
      ipa: '/fi/',
      meaning: 'ca',
      example: 'The fish swims fast.',
      topicKey: 'food',
      topicTitle: 'Food',
    },
    {
      word: 'grape',
      ipa: '/gr/',
      meaning: 'nho',
      example: 'A grape is small.',
      topicKey: 'food',
      topicTitle: 'Food',
    },
    {
      word: 'honey',
      ipa: '/ho/',
      meaning: 'mat ong',
      example: 'Honey tastes sweet.',
      topicKey: 'food',
      topicTitle: 'Food',
    },
  ]

  const rounds = buildMatchRounds(words)

  assert.equal(rounds.length, 2)
  for (const round of rounds) {
    assert.equal(round.pairs.length, 4)
    assert.equal(round.options.length, 4)
    assert.deepEqual(
      [...round.options].sort(),
      round.pairs.map((pair) => pair.meaning).sort(),
    )
  }
})
