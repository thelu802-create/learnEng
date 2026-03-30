import * as XLSX from 'xlsx'
import type { VocabularyWord } from '../../types'
import type { ImportVocabularyRow, SpreadsheetRow } from './types'

export function matchesVocabulary(word: VocabularyWord, keyword: string): boolean {
  const normalizedKeyword = keyword.trim().toLowerCase()

  if (!normalizedKeyword) {
    return true
  }

  return [word.word, word.meaning, word.example]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(normalizedKeyword))
}

export function normalizeWordKey(value: string): string {
  return value.trim().toLowerCase()
}

export function slugifyTopicKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = []
  let current = ''
  let isQuoted = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const nextChar = line[index + 1]

    if (char === '"') {
      if (isQuoted && nextChar === '"') {
        current += '"'
        index += 1
      } else {
        isQuoted = !isQuoted
      }
      continue
    }

    if (char === ',' && !isQuoted) {
      cells.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  cells.push(current.trim())
  return cells.map((cell) => cell.replace(/\r/g, '').trim())
}

export function parseVocabularyCsv(csvText: string): ImportVocabularyRow[] {
  const lines = csvText
    .replace(/^\uFEFF/, '')
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    throw new Error('CSV file must contain at least one data row.')
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase())
  const requiredHeaders = ['topic_key', 'word', 'meaning']

  for (const requiredHeader of requiredHeaders) {
    if (!headers.includes(requiredHeader)) {
      throw new Error(`Missing required column: ${requiredHeader}`)
    }
  }

  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line)
    const getCell = (name: string) => {
      const columnIndex = headers.indexOf(name)
      return columnIndex >= 0 ? cells[columnIndex] ?? '' : ''
    }

    return {
      topicKey: slugifyTopicKey(getCell('topic_key')),
      topicTitle: getCell('topic_title'),
      word: getCell('word'),
      ipa: getCell('ipa'),
      meaning: getCell('meaning'),
      example: getCell('example'),
    }
  })
}

export function normalizeSpreadsheetRows(rows: SpreadsheetRow[]): ImportVocabularyRow[] {
  return rows
    .map((row) => ({
      topicKey: slugifyTopicKey(String(row.topic_key ?? '')),
      topicTitle: String(row.topic_title ?? '').trim(),
      word: String(row.word ?? '').trim(),
      ipa: String(row.ipa ?? '').trim(),
      meaning: String(row.meaning ?? '').trim(),
      example: String(row.example ?? '').trim(),
    }))
    .filter((row) => row.topicKey || row.word || row.meaning || row.example || row.ipa)
}

export function readSpreadsheetRows(buffer: ArrayBuffer): SpreadsheetRow[] {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const firstSheetName = workbook.SheetNames[0]

  if (!firstSheetName) {
    throw new Error('Workbook has no sheets.')
  }

  const worksheet = workbook.Sheets[firstSheetName]
  return XLSX.utils.sheet_to_json<SpreadsheetRow>(worksheet, {
    defval: '',
  })
}

export function downloadCsvFile(fileName: string, content: string) {
  const bom = '\uFEFF'
  const blob = new Blob([bom, content], { type: 'text/csv;charset=utf-8;' })
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(objectUrl)
}

export function downloadXlsxFile(
  fileName: string,
  rows: Array<Record<string, string>>,
  sheetName: string,
) {
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, fileName)
}
