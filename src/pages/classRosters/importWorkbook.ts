import * as XLSX from 'xlsx'
import type { ParsedRosterSheet, ParsedRosterWorkbook, ParsedStudent } from './types'

type CellValue = string | number | boolean | Date | null | undefined

const HEADER_ALIASES = {
  studentNumber: ['stt', 'số thứ tự'],
  className: ['lớp', 'lop'],
  fullName: ['họ tên', 'họ và tên', 'ho ten', 'tên học sinh'],
  gender: ['giới tính', 'gioi tinh'],
  dateOfBirth: ['ngày sinh', 'ngay sinh'],
  phoneNumber: ['số điện thoại', 'sđt', 'sdt', 'điện thoại'],
  ic3: ['ic3'],
  tabn: ['tabn'],
  airConditioner: ['máy lạnh', 'may lanh'],
  inclusive: ['học sinh hoà nhập', 'học sinh hòa nhập', 'hòa nhập', 'hoà nhập'],
  note: ['ghi chú', 'ghi chu'],
} as const

function cleanCell(value: CellValue): string {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function findColumn(headers: string[], aliases: readonly string[]): number {
  const normalizedAliases = aliases.map(normalizeText)
  return headers.findIndex((header) => {
    const normalizedHeader = normalizeText(header)
    return normalizedAliases.some(
      (alias) => normalizedHeader === alias || normalizedHeader.startsWith(`${alias} `),
    )
  })
}

function isMarked(value: string): boolean {
  const normalized = normalizeText(value)
  return ['x', '1', 'co', 'yes', 'true'].includes(normalized)
}

function normalizeDate(value: string): string {
  if (!value) return ''
  const parts = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4})$/)
  if (!parts) return value

  const yearNumber = Number(parts[3])
  const year = parts[3].length === 2 ? (yearNumber >= 50 ? 1900 + yearNumber : 2000 + yearNumber) : yearNumber
  return `${String(parts[1]).padStart(2, '0')}/${String(parts[2]).padStart(2, '0')}/${year}`
}

function parseSheet(name: string, worksheet: XLSX.WorkSheet): ParsedRosterSheet {
  const rows = XLSX.utils.sheet_to_json<CellValue[]>(worksheet, {
    header: 1,
    defval: '',
    raw: false,
    dateNF: 'dd/mm/yyyy',
  })
  const warnings: string[] = []
  const students: ParsedStudent[] = []
  let headers: string[] = []
  let indexes: Record<keyof typeof HEADER_ALIASES, number> | null = null

  rows.forEach((row, rowIndex) => {
    const cells = row.map(cleanCell)
    const candidateNameIndex = findColumn(cells, HEADER_ALIASES.fullName)
    const candidateClassIndex = findColumn(cells, HEADER_ALIASES.className)

    if (candidateNameIndex >= 0 && candidateClassIndex >= 0) {
      headers = cells
      indexes = {
        studentNumber: findColumn(headers, HEADER_ALIASES.studentNumber),
        className: candidateClassIndex,
        fullName: candidateNameIndex,
        gender: findColumn(headers, HEADER_ALIASES.gender),
        dateOfBirth: findColumn(headers, HEADER_ALIASES.dateOfBirth),
        phoneNumber: findColumn(headers, HEADER_ALIASES.phoneNumber),
        ic3: findColumn(headers, HEADER_ALIASES.ic3),
        tabn: findColumn(headers, HEADER_ALIASES.tabn),
        airConditioner: findColumn(headers, HEADER_ALIASES.airConditioner),
        inclusive: findColumn(headers, HEADER_ALIASES.inclusive),
        note: findColumn(headers, HEADER_ALIASES.note),
      }
      return
    }

    if (!indexes || cells.every((cell) => !cell)) return

    const valueAt = (index: number) => (index >= 0 ? cells[index] ?? '' : '')
    const className = valueAt(indexes.className)
    const fullName = valueAt(indexes.fullName)
    if (!className && !fullName) return
    if (!className || !fullName) {
      warnings.push(`Dòng ${rowIndex + 1}: thiếu ${!className ? 'lớp' : 'họ tên'}, đã bỏ qua.`)
      return
    }

    const knownIndexes = new Set(Object.values(indexes).filter((index) => index >= 0))
    const extraData = headers.reduce<Record<string, string>>((result, header, index) => {
      const value = cells[index] ?? ''
      if (header && value && !knownIndexes.has(index)) result[header] = value
      return result
    }, {})

    students.push({
      className,
      studentNumber: valueAt(indexes.studentNumber),
      fullName,
      gender: valueAt(indexes.gender),
      dateOfBirth: normalizeDate(valueAt(indexes.dateOfBirth)),
      phoneNumber: valueAt(indexes.phoneNumber),
      isIc3: isMarked(valueAt(indexes.ic3)),
      isTabn: isMarked(valueAt(indexes.tabn)),
      hasAirConditioner: isMarked(valueAt(indexes.airConditioner)),
      isInclusive: isMarked(valueAt(indexes.inclusive)),
      note: valueAt(indexes.note),
      extraData,
      sourceSheet: name,
      sourceRow: rowIndex + 1,
    })
  })

  if (!students.length && !indexes) warnings.push('Không tìm thấy dòng tiêu đề có cột Lớp và Họ Tên.')
  return { name, students, warnings }
}

export async function parseRosterWorkbook(file: File): Promise<ParsedRosterWorkbook> {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true })
  const parsedSheets = workbook.SheetNames.map((name) => parseSheet(name, workbook.Sheets[name]))
  const sheet = parsedSheets.find((item) => item.students.length > 0) ?? parsedSheets[0]

  if (!sheet) {
    throw new Error('Workbook does not contain a worksheet.')
  }

  return {
    fileName: file.name,
    sheet,
  }
}
