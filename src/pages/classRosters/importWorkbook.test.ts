import assert from 'node:assert/strict'
import test from 'node:test'
import * as XLSX from 'xlsx'
import { parseRosterWorkbook } from './importWorkbook.ts'

test('parses repeated headers and preserves extra columns', async () => {
  const rows = [
    ['STT', 'Lớp', 'Họ Tên', 'Giới tính', 'Ngày sinh', 'Số điện thoại', 'IC3', 'Ghi chú', 'Nhóm Zalo'],
    ['1', '6/1', 'Nguyễn Văn A', 'Nam', '4/10/15', '0901234567', 'x', '', 'Đã vào'],
    ['STT', 'Lớp', 'Họ Tên', 'Giới tính', 'Ngày sinh', 'Số điện thoại', 'IC3', 'Ghi chú', 'Nhóm Zalo'],
    ['1', '6/2', 'Trần Thị B', 'Nữ', '01/02/2015', '0912345678', '', 'Ghi chú', ''],
  ]
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), 'Danh sách')
  const bytes = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
  const file = new File([bytes], 'lop.xlsx')
  const parsed = await parseRosterWorkbook(file)

  assert.equal(parsed.sheet.students.length, 2)
  assert.equal(parsed.sheet.students[0].dateOfBirth, '04/10/2015')
  assert.equal(parsed.sheet.students[0].phoneNumber, '0901234567')
  assert.equal(parsed.sheet.students[0].isIc3, true)
  assert.deepEqual(parsed.sheet.students[0].extraData, { 'Nhóm Zalo': 'Đã vào' })
})
