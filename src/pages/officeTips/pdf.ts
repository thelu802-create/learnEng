import { jsPDF } from 'jspdf'
import plannerPdfFontUrl from '../../assets/fonts/BeVietnamPro-Regular.ttf?url'
import type { ShortcutViewItem, ToolSection } from './types'

const OFFICE_TIPS_PDF_FONT_FILE = 'BeVietnamPro-Regular.ttf'
const OFFICE_TIPS_PDF_FONT_NAME = 'BeVietnamPro'
const OFFICE_TIPS_REPORT_BRAND = 'English Path'

let officeTipsPdfFontPromise: Promise<string> | null = null

async function getOfficeTipsPdfFont(): Promise<string> {
  if (!officeTipsPdfFontPromise) {
    officeTipsPdfFontPromise = fetch(plannerPdfFontUrl)
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

  return officeTipsPdfFontPromise
}

interface ExportOfficeTipsPdfOptions {
  language: 'en' | 'vi'
  activeSection: ToolSection
  filteredShortcuts: ShortcutViewItem[]
  searchAllTools: boolean
  labels: {
    pdfTitle: string
    pdfTipsTitle: string
    pdfShortcutsTitle: string
    pdfGeneratedAt: string
    favoriteLabel: string
  }
}

export async function exportOfficeTipsPdf({
  language,
  activeSection,
  filteredShortcuts,
  searchAllTools,
  labels,
}: ExportOfficeTipsPdfOptions) {
  const fontBinary = await getOfficeTipsPdfFont()
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  doc.addFileToVFS(OFFICE_TIPS_PDF_FONT_FILE, fontBinary)
  doc.addFont(OFFICE_TIPS_PDF_FONT_FILE, OFFICE_TIPS_PDF_FONT_NAME, 'normal')
  doc.setFont(OFFICE_TIPS_PDF_FONT_NAME, 'normal')

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 14
  const marginY = 14
  const contentWidth = pageWidth - marginX * 2
  const bottomLimit = pageHeight - 14
  const generatedAt = new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date())

  const exportTitleSuffix = searchAllTools ? 'All tools' : activeSection.title
  const exportDescription = searchAllTools ? 'All tools' : activeSection.description

  let cursorY = marginY

  const ensureSpace = (neededHeight: number) => {
    if (cursorY + neededHeight <= bottomLimit) return
    doc.addPage()
    doc.setFont(OFFICE_TIPS_PDF_FONT_NAME, 'normal')
    cursorY = marginY
  }

  doc.setFillColor(23, 130, 119)
  doc.roundedRect(marginX, cursorY, contentWidth, 24, 6, 6, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.text(OFFICE_TIPS_REPORT_BRAND, marginX + 5, cursorY + 6)
  doc.setFontSize(18)
  doc.text(`${labels.pdfTitle} - ${exportTitleSuffix}`, marginX + 5, cursorY + 14)
  doc.setFontSize(10)
  doc.text(`${labels.pdfGeneratedAt}: ${generatedAt}`, marginX + 5, cursorY + 20)

  cursorY += 32
  doc.setTextColor(23, 32, 51)
  doc.setFontSize(11)
  doc.text(exportDescription, marginX, cursorY)
  cursorY += 8

  doc.setFontSize(13)
  doc.text(labels.pdfTipsTitle, marginX, cursorY)
  cursorY += 6
  doc.setFontSize(10.5)

  activeSection.tips.forEach((tip) => {
    const tipLines = doc.splitTextToSize(`- ${tip}`, contentWidth)
    ensureSpace(tipLines.length * 5 + 2)
    doc.text(tipLines, marginX, cursorY)
    cursorY += tipLines.length * 5 + 1
  })

  cursorY += 4
  ensureSpace(12)
  doc.setFontSize(13)
  doc.text(labels.pdfShortcutsTitle, marginX, cursorY)
  cursorY += 6

  filteredShortcuts.forEach((shortcut) => {
    const sourcePrefix = searchAllTools ? `${shortcut.toolTitle}: ` : ''
    const shortcutLines = doc.splitTextToSize(
      `${sourcePrefix}${shortcut.action} - ${shortcut.note}`,
      contentWidth - 44,
    )
    const blockHeight = Math.max(12, shortcutLines.length * 5 + 6)
    ensureSpace(blockHeight + 2)

    doc.setFillColor(shortcut.isFavorite ? 245 : 248, shortcut.isFavorite ? 250 : 251, shortcut.isFavorite ? 248 : 252)
    doc.roundedRect(marginX, cursorY - 4, contentWidth, blockHeight, 4, 4, 'F')
    doc.setFillColor(42, 157, 143)
    doc.roundedRect(marginX + 3, cursorY - 1.5, 34, 7, 3, 3, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.text(shortcut.combo, marginX + 20, cursorY + 3, { align: 'center' })
    doc.setTextColor(23, 32, 51)
    doc.setFontSize(10.2)
    doc.text(shortcutLines, marginX + 42, cursorY + 2)

    if (shortcut.isFavorite) {
      doc.setTextColor(22, 101, 52)
      doc.setFontSize(9)
      doc.text(`* ${labels.favoriteLabel}`, pageWidth - marginX - 4, cursorY + 3, { align: 'right' })
    }

    cursorY += blockHeight + 2
  })

  doc.save(`office-cheatsheet-${activeSection.key}.pdf`)
}
