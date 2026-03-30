import { randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import express from 'express'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const port = 3001
const ipaCacheFilePath = path.join(__dirname, 'server-data', 'ipa-cache.json')

const gradeFileMap = {
  'Lớp 6': {
    filePath: path.join(__dirname, 'src/data/grades/grade6.js'),
    variableName: 'grade6',
  },
  'Lớp 7': {
    filePath: path.join(__dirname, 'src/data/grades/grade7.js'),
    variableName: 'grade7',
  },
  'Lớp 8': {
    filePath: path.join(__dirname, 'src/data/grades/grade8.js'),
    variableName: 'grade8',
  },
  'Lớp 9': {
    filePath: path.join(__dirname, 'src/data/grades/grade9.js'),
    variableName: 'grade9',
  },
}

const app = express()

app.use(express.json())
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }

  return next()
})

function getGradeConfig(grade) {
  return gradeFileMap[grade] || null
}

async function loadGradeData(grade) {
  const gradeConfig = getGradeConfig(grade)
  if (!gradeConfig) {
    return null
  }

  const moduleUrl = `${pathToFileURL(gradeConfig.filePath).href}?t=${Date.now()}`
  const gradeModule = await import(moduleUrl)

  return {
    gradeConfig,
    gradeData: structuredClone(gradeModule.default),
  }
}

function normalizeWord(entry) {
  if (typeof entry === 'string') {
    return {
      id: randomUUID(),
      word: entry,
      ipa: 'Dang cap nhat',
      meaning: 'Dang cap nhat',
      example: 'Vi du se duoc bo sung sau.',
    }
  }

  return {
    id: entry.id || randomUUID(),
    word: entry.word?.trim() || '',
    ipa: entry.ipa?.trim() || '',
    meaning: entry.meaning?.trim() || '',
    example: entry.example?.trim() || '',
  }
}

function normalizeTopic(topic) {
  return {
    key: topic.key,
    title: topic.title,
    words: (topic.words || []).map(normalizeWord),
  }
}

function normalizeTopics(topics = []) {
  return topics.map(normalizeTopic)
}

function cleanWordPayload(payload) {
  return {
    topicKey: payload.topicKey?.trim() || '',
    word: payload.word?.trim() || '',
    ipa: payload.ipa?.trim() || '',
    meaning: payload.meaning?.trim() || '',
    example: payload.example?.trim() || '',
  }
}

function findTopic(topics, topicKey) {
  return topics.find((topic) => topic.key === topicKey)
}

function serializeModule(variableName, data) {
  return `const ${variableName} = ${JSON.stringify(data, null, 2)}\n\nexport default ${variableName}\n`
}

async function saveGradeData(gradeConfig, gradeData) {
  const moduleSource = serializeModule(gradeConfig.variableName, gradeData)
  await writeFile(gradeConfig.filePath, moduleSource, 'utf8')
}

async function loadIpaCache() {
  try {
    const source = await readFile(ipaCacheFilePath, 'utf8')
    return JSON.parse(source)
  } catch {
    return {}
  }
}

async function saveIpaCache(cache) {
  await mkdir(path.dirname(ipaCacheFilePath), { recursive: true })
  await writeFile(ipaCacheFilePath, JSON.stringify(cache, null, 2), 'utf8')
}

function normalizeCacheKey(word) {
  return String(word || '').trim().toLowerCase()
}

function extractIpaFromDictionaryPayload(payload) {
  if (!Array.isArray(payload)) {
    return ''
  }

  for (const entry of payload) {
    if (Array.isArray(entry.phonetics)) {
      const textPhonetic = entry.phonetics.find((phonetic) => phonetic?.text?.trim())
      if (textPhonetic?.text?.trim()) {
        return textPhonetic.text.trim()
      }
    }

    if (typeof entry.phonetic === 'string' && entry.phonetic.trim()) {
      return entry.phonetic.trim()
    }
  }

  return ''
}

async function lookupIpa(word, cache) {
  const cacheKey = normalizeCacheKey(word)

  if (!cacheKey) {
    return ''
  }

  if (typeof cache[cacheKey] === 'string') {
    return cache[cacheKey]
  }

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
    if (!response.ok) {
      cache[cacheKey] = ''
      return ''
    }

    const payload = await response.json()
    const ipa = extractIpaFromDictionaryPayload(payload)
    cache[cacheKey] = ipa
    return ipa
  } catch {
    return ''
  }
}

app.get('/api/vocabulary/:grade', async (req, res) => {
  try {
    const loaded = await loadGradeData(req.params.grade)

    if (!loaded) {
      return res.status(404).json({ message: 'Khong tim thay khoi lop.' })
    }

    const topics = normalizeTopics(loaded.gradeData.vocabularyTopics || [])

    return res.json({
      topics,
      filePath: loaded.gradeConfig.filePath,
    })
  } catch (error) {
    return res.status(500).json({ message: 'Khong doc duoc du lieu.', error: error.message })
  }
})

app.post('/api/vocabulary/:grade/words', async (req, res) => {
  try {
    const loaded = await loadGradeData(req.params.grade)

    if (!loaded) {
      return res.status(404).json({ message: 'Khong tim thay khoi lop.' })
    }

    const payload = cleanWordPayload(req.body)
    if (!payload.topicKey || !payload.word || !payload.meaning) {
      return res.status(400).json({ message: 'Can topicKey, word va meaning.' })
    }

    loaded.gradeData.vocabularyTopics = normalizeTopics(loaded.gradeData.vocabularyTopics || [])
    const topic = findTopic(loaded.gradeData.vocabularyTopics, payload.topicKey)

    if (!topic) {
      return res.status(404).json({ message: 'Khong tim thay chu de tu vung.' })
    }

    const newWord = {
      id: randomUUID(),
      word: payload.word,
      ipa: payload.ipa,
      meaning: payload.meaning,
      example: payload.example,
    }

    topic.words.push(newWord)
    await saveGradeData(loaded.gradeConfig, loaded.gradeData)

    return res.status(201).json({
      topics: loaded.gradeData.vocabularyTopics,
      word: newWord,
      filePath: loaded.gradeConfig.filePath,
    })
  } catch (error) {
    return res.status(500).json({ message: 'Khong luu duoc tu vung.', error: error.message })
  }
})

app.put('/api/vocabulary/:grade/words/:wordId', async (req, res) => {
  try {
    const loaded = await loadGradeData(req.params.grade)

    if (!loaded) {
      return res.status(404).json({ message: 'Khong tim thay khoi lop.' })
    }

    const payload = cleanWordPayload(req.body)
    if (!payload.topicKey || !payload.word || !payload.meaning) {
      return res.status(400).json({ message: 'Can topicKey, word va meaning.' })
    }

    loaded.gradeData.vocabularyTopics = normalizeTopics(loaded.gradeData.vocabularyTopics || [])
    const topics = loaded.gradeData.vocabularyTopics

    let currentTopic = null
    let currentIndex = -1

    for (const topic of topics) {
      const wordIndex = topic.words.findIndex((item) => item.id === req.params.wordId)
      if (wordIndex >= 0) {
        currentTopic = topic
        currentIndex = wordIndex
        break
      }
    }

    if (!currentTopic || currentIndex < 0) {
      return res.status(404).json({ message: 'Khong tim thay tu vung can sua.' })
    }

    const targetTopic = findTopic(topics, payload.topicKey)
    if (!targetTopic) {
      return res.status(404).json({ message: 'Khong tim thay chu de dich.' })
    }

    const updatedWord = {
      id: req.params.wordId,
      word: payload.word,
      ipa: payload.ipa,
      meaning: payload.meaning,
      example: payload.example,
    }

    currentTopic.words.splice(currentIndex, 1)
    targetTopic.words.push(updatedWord)

    await saveGradeData(loaded.gradeConfig, loaded.gradeData)

    return res.json({
      topics,
      word: updatedWord,
      filePath: loaded.gradeConfig.filePath,
    })
  } catch (error) {
    return res.status(500).json({ message: 'Khong cap nhat duoc tu vung.', error: error.message })
  }
})

app.delete('/api/vocabulary/:grade/words/:wordId', async (req, res) => {
  try {
    const loaded = await loadGradeData(req.params.grade)

    if (!loaded) {
      return res.status(404).json({ message: 'Khong tim thay khoi lop.' })
    }

    loaded.gradeData.vocabularyTopics = normalizeTopics(loaded.gradeData.vocabularyTopics || [])
    const topics = loaded.gradeData.vocabularyTopics

    let deleted = false

    for (const topic of topics) {
      const nextWords = topic.words.filter((item) => item.id !== req.params.wordId)
      if (nextWords.length !== topic.words.length) {
        topic.words = nextWords
        deleted = true
        break
      }
    }

    if (!deleted) {
      return res.status(404).json({ message: 'Khong tim thay tu vung can xoa.' })
    }

    await saveGradeData(loaded.gradeConfig, loaded.gradeData)

    return res.json({
      topics,
      filePath: loaded.gradeConfig.filePath,
    })
  } catch (error) {
    return res.status(500).json({ message: 'Khong xoa duoc tu vung.', error: error.message })
  }
})

app.get('/api/vocabulary/:grade/source', async (req, res) => {
  try {
    const gradeConfig = getGradeConfig(req.params.grade)

    if (!gradeConfig) {
      return res.status(404).json({ message: 'Khong tim thay khoi lop.' })
    }

    const source = await readFile(gradeConfig.filePath, 'utf8')
    return res.json({ filePath: gradeConfig.filePath, source })
  } catch (error) {
    return res.status(500).json({ message: 'Khong doc duoc file nguon.', error: error.message })
  }
})

app.post('/api/ipa/lookup', async (req, res) => {
  try {
    const words = Array.isArray(req.body?.words) ? req.body.words : []
    const uniqueWords = [...new Set(words.map((word) => String(word || '').trim()).filter(Boolean))]

    if (uniqueWords.length === 0) {
      return res.json({ ipaMap: {} })
    }

    const cache = await loadIpaCache()
    const ipaMap = {}

    for (const word of uniqueWords) {
      ipaMap[word] = await lookupIpa(word, cache)
    }

    await saveIpaCache(cache)
    return res.json({ ipaMap })
  } catch (error) {
    return res.status(500).json({ message: 'Khong tra duoc phien am.', error: error.message })
  }
})

app.listen(port, () => {
  console.log(`Vocabulary server running at http://localhost:${port}`)
})
