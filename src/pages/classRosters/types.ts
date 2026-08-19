export interface ParsedStudent {
  className: string
  studentNumber: string
  fullName: string
  gender: string
  dateOfBirth: string
  phoneNumber: string
  isIc3: boolean
  isTabn: boolean
  hasAirConditioner: boolean
  isInclusive: boolean
  note: string
  extraData: Record<string, string>
  sourceSheet: string
  sourceRow: number
}

export interface ParsedRosterSheet {
  name: string
  students: ParsedStudent[]
  warnings: string[]
}

export interface ParsedRosterWorkbook {
  fileName: string
  sheet: ParsedRosterSheet
}
