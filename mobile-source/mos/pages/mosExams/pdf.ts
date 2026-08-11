import { jsPDF } from 'jspdf'
import pdfFontUrl from '../../assets/fonts/BeVietnamPro-Regular.ttf?url'
import type { MosMockExam } from './types'

const MOS_EXAM_PDF_FONT_FILE = 'BeVietnamPro-Regular.ttf'
const MOS_EXAM_PDF_FONT_NAME = 'BeVietnamPro'

let mosExamPdfFontPromise: Promise<string> | null = null

async function getMosExamPdfFont(): Promise<string> {
  if (!mosExamPdfFontPromise) {
    mosExamPdfFontPromise = fetch(pdfFontUrl)
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load PDF font')
        return response.arrayBuffer()
      })
      .then((buffer) => {
        const bytes = new Uint8Array(buffer)
        let binary = ''
        const chunkSize = 0x8000
        for (let index = 0; index < bytes.length; index += chunkSize) {
          binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
        }
        return binary
      })
  }

  return mosExamPdfFontPromise
}

export async function exportMosMockExamPdf(exam: MosMockExam) {
  const fontBinary = await getMosExamPdfFont()
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  doc.addFileToVFS(MOS_EXAM_PDF_FONT_FILE, fontBinary)
  doc.addFont(MOS_EXAM_PDF_FONT_FILE, MOS_EXAM_PDF_FONT_NAME, 'normal')
  doc.setFont(MOS_EXAM_PDF_FONT_NAME, 'normal')

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 14
  const bottomLimit = pageHeight - 14
  const contentWidth = pageWidth - marginX * 2
  let cursorY = 14

  const ensureSpace = (neededHeight: number) => {
    if (cursorY + neededHeight <= bottomLimit) return
    doc.addPage()
    doc.setFont(MOS_EXAM_PDF_FONT_NAME, 'normal')
    cursorY = 14
  }

  const drawWrapped = (text: string, x: number, maxWidth: number, lineHeight: number) => {
    const lines = doc.splitTextToSize(text, maxWidth)
    doc.text(lines, x, cursorY)
    cursorY += lines.length * lineHeight
  }

  doc.setFillColor(29, 127, 115)
  doc.roundedRect(marginX, cursorY, contentWidth, 28, 4, 4, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.text(`MOS ${exam.app} Mock Exam`, marginX + 5, cursorY + 6)
  doc.setFontSize(16)
  doc.text(`${exam.code} - ${exam.title}`, marginX + 5, cursorY + 15)
  doc.setFontSize(9)
  doc.text(`Thời gian: ${exam.durationMinutes} phút | Điểm đạt gợi ý: ${exam.passingScore}/1000`, marginX + 5, cursorY + 22)
  cursorY += 36

  doc.setTextColor(23, 32, 51)
  doc.setFontSize(12)
  doc.text('Bối cảnh', marginX, cursorY)
  cursorY += 6
  doc.setFontSize(9.5)
  drawWrapped(exam.scenario, marginX, contentWidth, 5)
  cursorY += 3

  const metaBlocks = [
    ['File đầu vào', exam.starterFiles.join(', ')],
    ['File cần nộp', exam.deliverables.join(', ')],
    ['Ghi chú nguồn', exam.sourceNote],
  ] as const

  metaBlocks.forEach(([label, value]) => {
    ensureSpace(14)
    doc.setFillColor(248, 251, 252)
    doc.roundedRect(marginX, cursorY - 3, contentWidth, 10, 3, 3, 'F')
    doc.setFontSize(8.5)
    doc.setTextColor(80, 94, 108)
    doc.text(label, marginX + 4, cursorY + 1.5)
    doc.setTextColor(23, 32, 51)
    const valueLines = doc.splitTextToSize(value, contentWidth - 42).slice(0, 2)
    doc.text(valueLines, marginX + 42, cursorY + 1.5)
    cursorY += Math.max(10, valueLines.length * 4.5 + 4)
  })

  cursorY += 4
  exam.tasks.forEach((task, index) => {
    const instructionLines = doc.splitTextToSize(task.instruction, contentWidth - 8)
    const checklistLines = task.checklist.flatMap((item) => doc.splitTextToSize(`□ ${item}`, contentWidth - 14))
    const neededHeight = 21 + instructionLines.length * 4.5 + checklistLines.length * 4.3
    ensureSpace(neededHeight)

    doc.setDrawColor(221, 229, 235)
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(marginX, cursorY, contentWidth, neededHeight - 4, 4, 4, 'FD')
    cursorY += 6
    doc.setFontSize(10.5)
    doc.setTextColor(23, 32, 51)
    doc.text(`${index + 1}. ${task.title}`, marginX + 4, cursorY)
    doc.setFontSize(8)
    doc.setTextColor(29, 127, 115)
    doc.text(`${task.points} điểm | ${task.skill}`, pageWidth - marginX - 4, cursorY, { align: 'right' })
    cursorY += 6

    doc.setFontSize(9)
    doc.setTextColor(52, 64, 84)
    doc.text(instructionLines, marginX + 4, cursorY)
    cursorY += instructionLines.length * 4.5 + 3

    doc.setFontSize(8.5)
    doc.setTextColor(80, 94, 108)
    doc.text(checklistLines, marginX + 7, cursorY)
    cursorY += checklistLines.length * 4.3 + 8
  })

  doc.save(`${exam.code.toLowerCase()}-${exam.id}.pdf`)
}
