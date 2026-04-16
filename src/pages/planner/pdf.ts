import { jsPDF } from 'jspdf'
import plannerPdfFontUrl from '../../assets/fonts/BeVietnamPro-Regular.ttf?url'
import {
  getTaskDueDate,
  type PlannerTask,
  type PlannerTaskPriority,
} from '../../lib/plannerStorage'
import type { WeeklyOverview } from './types'
import { formatDateInputValue, formatPlannerShortDate } from './utils'

const PLANNER_PDF_FONT_FILE = 'BeVietnamPro-Regular.ttf'
const PLANNER_PDF_FONT_NAME = 'BeVietnamPro'
const PLANNER_REPORT_BRAND = 'English Path'

let plannerPdfFontPromise: Promise<string> | null = null

async function getPlannerPdfFont(): Promise<string> {
  if (!plannerPdfFontPromise) {
    plannerPdfFontPromise = fetch(plannerPdfFontUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to load PDF font')
        }
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

  return plannerPdfFontPromise
}

interface ExportPlannerWeeklyPdfOptions {
  language: 'en' | 'vi'
  userEmail?: string
  tasks: PlannerTask[]
  weeklyOverview: WeeklyOverview
  weeklyNote: string
  priorityOptions: Array<{ value: PlannerTaskPriority; label: string }>
  repeatOptions: Array<{ value: string; label: string }>
  t: (key: string, params?: Record<string, string | number>) => string
}

export async function exportPlannerWeeklyPdf({
  language,
  userEmail,
  tasks,
  weeklyOverview,
  weeklyNote,
  priorityOptions,
  repeatOptions,
  t,
}: ExportPlannerWeeklyPdfOptions) {
  const fontBinary = await getPlannerPdfFont()
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  doc.addFileToVFS(PLANNER_PDF_FONT_FILE, fontBinary)
  doc.addFont(PLANNER_PDF_FONT_FILE, PLANNER_PDF_FONT_NAME, 'normal')
  doc.setFont(PLANNER_PDF_FONT_NAME, 'normal')

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 10
  const topY = 10
  const headerHeight = 22
  const summaryY = 38
  const summaryHeight = 18
  const summaryGap = 4
  const summaryWidth = (pageWidth - marginX * 2 - summaryGap * 3) / 4
  const sectionMetaY = 64
  const sectionTitleY = 71
  const gridY = 80
  const bottomMargin = 10
  const columnCount = 3
  const cardGapX = 5
  const cardGapY = 5
  const rowCount = Math.ceil(weeklyOverview.days.length / columnCount)
  const cardWidth = (pageWidth - marginX * 2 - cardGapX * (columnCount - 1)) / columnCount
  const footerGap = 6
  const footerHeight = 22
  const cardHeight =
    (pageHeight - gridY - bottomMargin - footerHeight - footerGap - cardGapY * (rowCount - 1)) /
    rowCount
  const footerY = gridY + rowCount * cardHeight + (rowCount - 1) * cardGapY + footerGap
  const footerWidth = (pageWidth - marginX * 2 - cardGapX) / 2
  const ownerLabel = userEmail ?? '-'
  const generatedAt = new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date())
  const weeklyRangeText = `${t('planner.weekRange')} ${formatPlannerShortDate(
    weeklyOverview.weekStart,
    language,
  )} - ${formatPlannerShortDate(weeklyOverview.weekEnd, language)}`
  const focusLabel = weeklyOverview.busiestDay
    ? `${weeklyOverview.busiestDay.label} ${weeklyOverview.busiestDay.dayNumber}`
    : t('planner.weekNoTasks')
  const priorityLabelMap = new Map(priorityOptions.map((option) => [option.value, option.label]))
  const repeatLabelMap = new Map(repeatOptions.map((option) => [option.value, option.label]))
  const weekTasks = tasks.filter(
    (task) =>
      task.dueDate >= formatDateInputValue(weeklyOverview.weekStart) &&
      task.dueDate <= formatDateInputValue(weeklyOverview.weekEnd),
  )
  const repeatingHighlights = weekTasks.filter((task) => task.repeatPattern).slice(0, 3)
  const quickSummaryLines = [
    `${t('planner.overdue')}: ${weeklyOverview.overdue}`,
    `${t('planner.pdfFocusLabel')}: ${focusLabel}`,
    repeatingHighlights.length > 0
      ? `${t('planner.pdfRepeatHighlights')}: ${repeatingHighlights.map((task) => task.title).join(', ')}`
      : `${t('planner.pdfRepeatHighlights')}: ${t('planner.printNoTasks')}`,
  ]

  doc.setFillColor(15, 118, 110)
  doc.roundedRect(marginX, topY, pageWidth - marginX * 2, headerHeight, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(7.8)
  doc.text(PLANNER_REPORT_BRAND, marginX + 5, topY + 4.8)
  doc.setFontSize(17)
  doc.text(t('planner.printTitle'), marginX + 5, topY + 11.2)
  doc.setFontSize(9)
  doc.text(weeklyRangeText, marginX + 5, topY + 17)
  doc.text(t('planner.pdfGeneratedAt', { value: generatedAt }), pageWidth - marginX - 5, topY + 8.2, {
    align: 'right',
  })
  doc.text(`${t('planner.pdfFocusLabel')}: ${focusLabel}`, pageWidth - marginX - 5, topY + 14.6, {
    align: 'right',
  })
  doc.setTextColor(20, 20, 20)

  const summaryCards = [
    {
      label: t('planner.weekTotal'),
      value: String(weeklyOverview.total),
      fill: [232, 244, 242] as const,
      text: [20, 20, 20] as const,
    },
    {
      label: t('planner.weekCompleted'),
      value: String(weeklyOverview.completed),
      fill: [228, 245, 234] as const,
      text: [30, 96, 53] as const,
    },
    {
      label: t('planner.weekPending'),
      value: String(weeklyOverview.pending),
      fill: [255, 244, 229] as const,
      text: [154, 52, 18] as const,
    },
    {
      label: t('planner.overdue'),
      value: String(weeklyOverview.overdue),
      fill: [253, 237, 237] as const,
      text: [185, 28, 28] as const,
    },
  ]

  summaryCards.forEach((item, index) => {
    const x = marginX + index * (summaryWidth + summaryGap)
    doc.setFillColor(item.fill[0], item.fill[1], item.fill[2])
    doc.roundedRect(x, summaryY, summaryWidth, summaryHeight, 3, 3, 'F')
    doc.setFontSize(8)
    doc.setTextColor(90, 90, 90)
    doc.text(item.label, x + 4, summaryY + 6)
    doc.setFontSize(16)
    doc.setTextColor(item.text[0], item.text[1], item.text[2])
    doc.text(item.value, x + 4, summaryY + 13)
  })
  doc.setTextColor(20, 20, 20)

  doc.setFontSize(9)
  doc.setTextColor(96, 108, 118)
  doc.text(`${t('planner.pdfOwnerLabel')}: ${ownerLabel}`, marginX, sectionMetaY)
  doc.setFontSize(12)
  doc.setTextColor(20, 20, 20)
  doc.text(t('planner.pdfScheduleLabel'), marginX, sectionTitleY)
  doc.setDrawColor(220, 229, 233)
  doc.line(marginX, sectionTitleY + 3, pageWidth - marginX, sectionTitleY + 3)

  weeklyOverview.days.forEach((day, index) => {
    const row = Math.floor(index / columnCount)
    const columnIndex = index % columnCount
    const x = marginX + columnIndex * (cardWidth + cardGapX)
    const y = gridY + row * (cardHeight + cardGapY)
    const dayTasks = tasks
      .filter((task) => task.dueDate === day.key)
      .sort((left, right) => {
        if (left.completed !== right.completed) return left.completed ? 1 : -1
        return getTaskDueDate(left).getTime() - getTaskDueDate(right).getTime()
      })
    const completedCount = dayTasks.filter((task) => task.completed).length
    const headerFill = day.isToday ? ([226, 245, 241] as const) : ([245, 247, 249] as const)
    const borderColor = day.isToday ? ([42, 157, 143] as const) : ([220, 224, 230] as const)

    doc.setFillColor(253, 253, 252)
    doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'F')
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2])
    doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3)
    doc.setFillColor(headerFill[0], headerFill[1], headerFill[2])
    doc.roundedRect(x, y, cardWidth, 11, 3, 3, 'F')
    doc.rect(x, y + 8, cardWidth, 3, 'F')

    doc.setFontSize(8)
    doc.setTextColor(day.isToday ? 29 : 90, day.isToday ? 127 : 90, day.isToday ? 115 : 90)
    doc.text(day.label, x + 4, y + 5)
    doc.setFontSize(10.5)
    doc.setTextColor(20, 20, 20)
    doc.text(`${day.dayNumber}`, x + 4, y + 9.4)
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(x + cardWidth - 25, y + 2.2, 21, 6.2, 2, 2, 'F')
    doc.setDrawColor(230, 235, 238)
    doc.roundedRect(x + cardWidth - 25, y + 2.2, 21, 6.2, 2, 2)
    doc.setFontSize(6.3)
    doc.setTextColor(90, 90, 90)
    doc.text(
      dayTasks.length === 0 ? t('planner.printNoTasks') : `${completedCount}/${dayTasks.length}`,
      x + cardWidth - 14.5,
      y + 6.4,
      { align: 'center' },
    )

    let cursorY = y + 16
    const contentWidth = cardWidth - 8
    const maxY = y + cardHeight - 4

    if (dayTasks.length === 0) {
      doc.setFontSize(7.2)
      doc.setTextColor(140, 140, 140)
      doc.text(t('planner.printNoTasks'), x + cardWidth / 2, y + cardHeight / 2 + 1, {
        align: 'center',
      })
      return
    }

    for (let taskIndex = 0; taskIndex < dayTasks.length; taskIndex += 1) {
      const task = dayTasks[taskIndex]
      const titleLines = doc.splitTextToSize(task.title, contentWidth).slice(0, 2)
      const metaParts = [
        task.dueTime || null,
        task.repeatPattern
          ? `${t('planner.pdfRepeatLabel')}: ${repeatLabelMap.get(task.repeatPattern) ?? task.repeatPattern}`
          : null,
      ].filter(Boolean)
      const metaLine = metaParts.join(' · ')
      const metaLines = metaLine ? doc.splitTextToSize(metaLine, contentWidth).slice(0, 2) : []
      const noteSource = task.note.trim()
      const noteLines = noteSource
        ? doc.splitTextToSize(`${t('planner.pdfNoteLabel')}: ${noteSource}`, contentWidth).slice(0, 1)
        : []
      const lineHeight = 3.4
      const blockHeight =
        titleLines.length * lineHeight +
        metaLines.length * 2.9 +
        noteLines.length * 2.8 +
        3.6

      if (cursorY + blockHeight > maxY) {
        const remaining = dayTasks.length - taskIndex
        doc.setFontSize(7.2)
        doc.setTextColor(140, 140, 140)
        doc.text(`+${remaining} ${t('planner.moreTasks')}`, x + 4, maxY)
        break
      }

      doc.setFontSize(7.3)
      doc.setTextColor(task.completed ? 125 : 28, task.completed ? 125 : 28, task.completed ? 125 : 28)
      doc.text(titleLines, x + 4, cursorY)
      cursorY += titleLines.length * lineHeight

      const priorityLabel = priorityLabelMap.get(task.priority) ?? task.priority
      const priorityColors =
        task.priority === 'high'
          ? { fill: [253, 237, 237] as const, text: [185, 28, 28] as const }
          : task.priority === 'medium'
            ? { fill: [255, 244, 229] as const, text: [180, 83, 9] as const }
            : { fill: [232, 244, 252] as const, text: [30, 64, 175] as const }
      const priorityWidth = Math.min(contentWidth, Math.max(18, priorityLabel.length * 2.5 + 8))
      doc.setFillColor(priorityColors.fill[0], priorityColors.fill[1], priorityColors.fill[2])
      doc.roundedRect(x + 4, cursorY - 0.8, priorityWidth, 5, 1.8, 1.8, 'F')
      doc.setFontSize(6.1)
      doc.setTextColor(priorityColors.text[0], priorityColors.text[1], priorityColors.text[2])
      doc.text(priorityLabel, x + 7, cursorY + 2.2)
      cursorY += 5.6

      if (metaLines.length > 0) {
        doc.setFontSize(6.2)
        doc.setTextColor(96, 108, 118)
        doc.text(metaLines, x + 4, cursorY)
        cursorY += metaLines.length * 2.9
      }

      if (noteLines.length > 0) {
        doc.setFontSize(6)
        doc.setTextColor(120, 120, 120)
        doc.text(noteLines, x + 4, cursorY)
        cursorY += noteLines.length * 2.8
      }

      doc.setDrawColor(240, 242, 245)
      doc.line(x + 4, cursorY + 0.5, x + cardWidth - 4, cursorY + 0.5)
      cursorY += 2.2
    }
  })

  doc.setFillColor(250, 251, 252)
  doc.roundedRect(marginX, footerY, footerWidth, footerHeight, 3, 3, 'F')
  doc.roundedRect(marginX + footerWidth + cardGapX, footerY, footerWidth, footerHeight, 3, 3, 'F')
  doc.setDrawColor(225, 231, 235)
  doc.roundedRect(marginX, footerY, footerWidth, footerHeight, 3, 3)
  doc.roundedRect(marginX + footerWidth + cardGapX, footerY, footerWidth, footerHeight, 3, 3)

  doc.setFontSize(9.2)
  doc.setTextColor(20, 20, 20)
  doc.text(t('planner.weeklyNotesTitle'), marginX + 4, footerY + 6)
  doc.text(t('planner.pdfQuickSummaryTitle'), marginX + footerWidth + cardGapX + 4, footerY + 6)

  doc.setFontSize(7)
  doc.setTextColor(96, 108, 118)
  const weeklyNoteLines = weeklyNote.trim()
    ? doc.splitTextToSize(weeklyNote.trim(), footerWidth - 8).slice(0, 4)
    : [t('planner.weeklyNotesPlaceholder')]
  doc.text(weeklyNoteLines, marginX + 4, footerY + 11)

  const quickSummaryWrapped = quickSummaryLines.flatMap((line) =>
    doc.splitTextToSize(`- ${line}`, footerWidth - 8).slice(0, 2),
  )
  doc.text(quickSummaryWrapped.slice(0, 6), marginX + footerWidth + cardGapX + 4, footerY + 11)

  doc.save(`planner-week-${formatDateInputValue(weeklyOverview.weekStart)}.pdf`)
}
