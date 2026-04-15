import { App as AntdApp, Button, Card, Input, Space, Tag, Typography } from 'antd'
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  DesktopOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FilePptOutlined,
  FileWordOutlined,
  GoogleOutlined,
  KeyOutlined,
  SearchOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons'
import { jsPDF } from 'jspdf'
import { useCallback, useEffect, useMemo, useState } from 'react'
import plannerPdfFontUrl from '../assets/fonts/BeVietnamPro-Regular.ttf?url'
import { useI18n } from '../i18n'

const { Text } = Typography

type ToolKey = 'word' | 'excel' | 'powerpoint' | 'windows' | 'google'

const OFFICE_TIPS_ACTIVE_TOOL_KEY = 'english-path-office-tips-active-tool'
const OFFICE_TIPS_FAVORITES_KEY = 'english-path-office-tips-favorites'
const OFFICE_TIPS_PDF_FONT_FILE = 'BeVietnamPro-Regular.ttf'
const OFFICE_TIPS_PDF_FONT_NAME = 'BeVietnamPro'
const OFFICE_TIPS_REPORT_BRAND = 'English Path'

let officeTipsPdfFontPromise: Promise<string> | null = null

interface ShortcutItem {
  combo: string
  action: string
  note: string
}

interface ToolSection {
  key: ToolKey
  title: string
  description: string
  tips: string[]
  shortcuts: ShortcutItem[]
}

type FavoriteShortcutMap = Record<ToolKey, string[]>
type ShortcutViewItem = ShortcutItem & {
  toolKey: ToolKey
  toolTitle: string
  isFavorite: boolean
}

function getDefaultFavorites(): FavoriteShortcutMap {
  return {
    word: [],
    excel: [],
    powerpoint: [],
    windows: [],
    google: [],
  }
}

function getInitialTool(): ToolKey {
  if (typeof window === 'undefined') return 'word'

  const savedValue = window.localStorage.getItem(OFFICE_TIPS_ACTIVE_TOOL_KEY)
  if (savedValue === 'word' || savedValue === 'excel' || savedValue === 'powerpoint' || savedValue === 'windows' || savedValue === 'google') {
    return savedValue
  }

  return 'word'
}

function getInitialFavorites(): FavoriteShortcutMap {
  if (typeof window === 'undefined') return getDefaultFavorites()

  try {
    const raw = window.localStorage.getItem(OFFICE_TIPS_FAVORITES_KEY)
    if (!raw) return getDefaultFavorites()

    const parsed = JSON.parse(raw) as Partial<FavoriteShortcutMap>
    return {
      word: Array.isArray(parsed.word) ? parsed.word : [],
      excel: Array.isArray(parsed.excel) ? parsed.excel : [],
      powerpoint: Array.isArray(parsed.powerpoint) ? parsed.powerpoint : [],
      windows: Array.isArray(parsed.windows) ? parsed.windows : [],
      google: Array.isArray(parsed.google) ? parsed.google : [],
    }
  } catch {
    return getDefaultFavorites()
  }
}

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

function OfficeTipsPage() {
  const { message } = AntdApp.useApp()
  const { language, t } = useI18n()
  const [activeTool, setActiveTool] = useState<ToolKey>(getInitialTool)
  const [searchValue, setSearchValue] = useState('')
  const [favoriteShortcuts, setFavoriteShortcuts] = useState<FavoriteShortcutMap>(getInitialFavorites)
  const [searchAllTools, setSearchAllTools] = useState(false)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(OFFICE_TIPS_ACTIVE_TOOL_KEY, activeTool)
    }
  }, [activeTool])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(OFFICE_TIPS_FAVORITES_KEY, JSON.stringify(favoriteShortcuts))
    }
  }, [favoriteShortcuts])

  const labels = {
    subnavTitle: t('officeTips.subnavTitle'),
    searchPlaceholder: t('officeTips.searchPlaceholder'),
    emptySearch: t('officeTips.emptySearch'),
    shortcutLabel: t('officeTips.shortcutLabel'),
    tipLabel: t('officeTips.tipLabel'),
    favoriteLabel: t('officeTips.favoriteLabel'),
    shortcutSectionTitle: t('officeTips.shortcutSectionTitle'),
    tipsSectionTitle: t('officeTips.tipsSectionTitle'),
    exportAction: t('officeTips.exportAction'),
    exportSuccess: t('officeTips.exportSuccess'),
    exportError: t('officeTips.exportError'),
    favoriteAdded: t('officeTips.favoriteAdded'),
    favoriteRemoved: t('officeTips.favoriteRemoved'),
    currentToolScope: t('officeTips.currentToolScope'),
    allToolsScope: t('officeTips.allToolsScope'),
    favoritesOnly: t('officeTips.favoritesOnly'),
    pdfTitle: t('officeTips.pdfTitle'),
    pdfTipsTitle: t('officeTips.pdfTipsTitle'),
    pdfShortcutsTitle: t('officeTips.pdfShortcutsTitle'),
    pdfGeneratedAt: t('officeTips.pdfGeneratedAt'),
  }
  const toolsVi: ToolSection[] = [
    {
      key: 'word',
      title: 'Word',
      description: 'H\u1ee3p khi b\u1ea1n c\u1ea7n tr\u00ecnh b\u00e0y v\u0103n b\u1ea3n g\u1ecdn h\u01a1n v\u00e0 s\u1eeda t\u00e0i li\u1ec7u nhanh h\u01a1n.',
      tips: [
        'D\u00f9ng Heading style \u0111\u1ec3 gi\u1eef ti\u00eau \u0111\u1ec1 v\u00e0 c\u00e1c ph\u1ea7n trong gi\u00e1o \u00e1n lu\u00f4n \u0111\u1ed3ng b\u1ed9.',
        'D\u00f9ng Format Painter khi nhi\u1ec1u c\u00e2u h\u1ecfi ho\u1eb7c ti\u00eau \u0111\u1ec1 c\u1ea7n c\u00f9ng m\u1ed9t ki\u1ec3u tr\u00ecnh b\u00e0y.',
        'D\u00f9ng ng\u1eaft trang thay v\u00ec xu\u1ed1ng nhi\u1ec1u d\u00f2ng tr\u1ed1ng n\u1ebfu b\u1ea1n mu\u1ed1n file in ra s\u1ea1ch h\u01a1n.',
      ],
      shortcuts: [
        { combo: 'Ctrl + B', action: 'In \u0111\u1eadm \u0111o\u1ea1n \u0111ang ch\u1ecdn', note: 'Nh\u1ea5n m\u1ea1nh ti\u00eau \u0111\u1ec1 ho\u1eb7c h\u01b0\u1edbng d\u1eabn ch\u00ednh' },
        { combo: 'Ctrl + I', action: 'In nghi\u00eang \u0111o\u1ea1n \u0111ang ch\u1ecdn', note: 'H\u1ee3p cho v\u00ed d\u1ee5 ho\u1eb7c ghi ch\u00fa ph\u1ee5' },
        { combo: 'Ctrl + U', action: 'G\u1ea1ch ch\u00e2n \u0111o\u1ea1n \u0111ang ch\u1ecdn', note: 'L\u00e0m ch\u1ed7 tr\u1ed1ng ho\u1eb7c nh\u1ea5n n\u1ed9i dung c\u1ea7n ch\u00fa \u00fd' },
        { combo: 'Ctrl + Shift + > / <', action: 'T\u0103ng ho\u1eb7c gi\u1ea3m c\u1ee1 ch\u1eef', note: 'Ch\u1ec9nh nhanh m\u00e0 kh\u00f4ng c\u1ea7n m\u1edf menu' },
        { combo: 'Ctrl + E / L / R', action: 'C\u0103n gi\u1eefa, tr\u00e1i ho\u1eb7c ph\u1ea3i', note: 'D\u1ecdn b\u1ed1 c\u1ee5c v\u0103n b\u1ea3n nhanh' },
        { combo: 'Ctrl + K', action: 'Ch\u00e8n li\u00ean k\u1ebft', note: 'G\u1eafn nhanh link t\u00e0i li\u1ec7u ho\u1eb7c ngu\u1ed3n tham kh\u1ea3o' },
        { combo: 'Ctrl + Shift + C / V', action: 'Sao ch\u00e9p v\u00e0 d\u00e1n \u0111\u1ecbnh d\u1ea1ng', note: 'Gi\u1eef \u0111\u00fang style ch\u1eef \u0111ang d\u00f9ng' },
        { combo: 'Ctrl + H', action: 'M\u1edf Find and Replace', note: 'S\u1eeda t\u1eeb l\u1eb7p l\u1ea1i ho\u1eb7c chu\u1ea9n h\u00f3a nhanh' },
        { combo: 'Shift + F3', action: '\u0110\u1ed5i ki\u1ec3u ch\u1eef hoa th\u01b0\u1eddng', note: 'R\u1ea5t ti\u1ec7n khi s\u1eeda ti\u00eau \u0111\u1ec1' },
        { combo: 'Ctrl + M / Ctrl + Shift + M', action: 'T\u0103ng ho\u1eb7c gi\u1ea3m th\u1ee5t l\u1ec1 \u0111o\u1ea1n', note: 'Ch\u1ec9nh b\u1ed1 c\u1ee5c t\u00e0i li\u1ec7u nhanh' },
        { combo: 'Ctrl + Enter', action: 'Ch\u00e8n ng\u1eaft trang', note: 'T\u00e1ch trang s\u1ea1ch cho phi\u1ebfu h\u1ecdc t\u1eadp' },
        { combo: 'F7', action: 'Ki\u1ec3m tra ch\u00ednh t\u1ea3 v\u00e0 ng\u1eef ph\u00e1p', note: 'N\u00ean ch\u1ea1y tr\u01b0\u1edbc khi g\u1eedi file' },
      ],
    },
    {
      key: 'excel',
      title: 'Excel',
      description: 'H\u1ee3p khi b\u1ea1n c\u1ea7n di chuy\u1ec3n nhanh h\u01a1n v\u00e0 r\u00e0 d\u1eef li\u1ec7u b\u1ea3ng t\u00ednh r\u00f5 h\u01a1n.',
      tips: [
        '\u0110\u1ed5i v\u00f9ng d\u1eef li\u1ec7u th\u00e0nh Table khi b\u1ea1n mu\u1ed1n c\u00f3 filter \u1ed5n \u0111\u1ecbnh v\u00e0 c\u00f4ng th\u1ee9c d\u1ec5 qu\u1ea3n l\u00fd h\u01a1n.',
        'Freeze h\u00e0ng \u0111\u1ea7u ti\u00ean tr\u01b0\u1edbc khi nh\u1eadp ho\u1eb7c r\u00e0 nhi\u1ec1u d\u00f2ng d\u1eef li\u1ec7u h\u1ecdc sinh.',
        'D\u00f9ng Conditional Formatting \u0111\u1ec3 nh\u00ecn nhanh b\u00e0i ch\u01b0a n\u1ed9p ho\u1eb7c \u0111i\u1ec3m th\u1ea5p.',
      ],
      shortcuts: [
        { combo: 'Ctrl + Shift + L', action: 'B\u1eadt ho\u1eb7c t\u1eaft b\u1ed9 l\u1ecdc', note: 'R\u00e0 \u0111i\u1ec3m ho\u1eb7c \u0111i\u1ec3m danh nhanh h\u01a1n' },
        { combo: 'Alt + =', action: 'T\u00ednh t\u1ed5ng nhanh AutoSum', note: 'R\u1ea5t ti\u1ec7n cho c\u1ed9t \u0111i\u1ec3m' },
        { combo: 'Ctrl + 1', action: 'M\u1edf Format Cells', note: 'Ch\u1ec9nh s\u1ed1, ng\u00e0y, vi\u1ec1n v\u00e0 c\u0103n l\u1ec1 nhanh' },
        { combo: 'Ctrl + ;', action: 'Ch\u00e8n ng\u00e0y hi\u1ec7n t\u1ea1i', note: 'D\u00f9ng cho log ho\u1eb7c \u0111i\u1ec3m danh' },
        { combo: 'Ctrl + Space', action: 'Ch\u1ecdn c\u1ea3 c\u1ed9t', note: 'Ti\u1ec7n tr\u01b0\u1edbc khi format ho\u1eb7c x\u00f3a d\u1eef li\u1ec7u' },
        { combo: 'Shift + Space', action: 'Ch\u1ecdn c\u1ea3 h\u00e0ng', note: 'S\u1eeda nhanh m\u1ed9t d\u00f2ng d\u1eef li\u1ec7u' },
        { combo: 'Ctrl + Arrow', action: 'Nh\u1ea3y t\u1edbi m\u00e9p v\u00f9ng d\u1eef li\u1ec7u', note: 'Di chuy\u1ec3n nhanh trong b\u1ea3ng l\u1edbn' },
        { combo: 'Ctrl + Shift + +', action: 'Ch\u00e8n th\u00eam h\u00e0ng ho\u1eb7c \u00f4', note: 'Th\u00eam d\u1eef li\u1ec7u nhanh m\u00e0 kh\u00f4ng c\u1ea7n d\u00f9ng ribbon' },
        { combo: 'Ctrl + -', action: 'X\u00f3a h\u00e0ng ho\u1eb7c \u00f4 \u0111ang ch\u1ecdn', note: 'D\u1ecdn sheet nhanh h\u01a1n khi r\u00e0 l\u1ea1i' },
        { combo: 'Ctrl + D / R', action: 'Fill down ho\u1eb7c fill right', note: 'Sao ch\u00e9p c\u00f4ng th\u1ee9c ho\u1eb7c gi\u00e1 tr\u1ecb r\u1ea5t nhanh' },
        { combo: 'F4', action: 'L\u1eb7p l\u1ea1i thao t\u00e1c g\u1ea7n nh\u1ea5t', note: 'R\u1ea5t h\u1eefu \u00edch khi format l\u1eb7p l\u1ea1i' },
        { combo: 'Ctrl + `', action: 'Hi\u1ec7n ho\u1eb7c \u1ea9n c\u00f4ng th\u1ee9c', note: 'Ki\u1ec3m tra c\u00f4ng th\u1ee9c to\u00e0n sheet nhanh h\u01a1n' },
      ],
    },
    {
      key: 'powerpoint',
      title: 'PowerPoint',
      description: 'H\u1ee3p khi b\u1ea1n mu\u1ed1n l\u00e0m slide s\u1ea1ch h\u01a1n v\u00e0 ch\u1ec9nh b\u00e0i tr\u00ecnh chi\u1ebfu nhanh h\u01a1n.',
      tips: [
        'D\u00f9ng Slide Master tr\u01b0\u1edbc khi format nhi\u1ec1u slide \u0111\u1ec3 to\u00e0n b\u1ed9 deck \u0111\u1ed3ng nh\u1ea5t h\u01a1n.',
        'Gi\u1eef m\u1ed9t nh\u1ecbp tr\u00ecnh b\u00e0y \u1ed5n \u0111\u1ecbnh cho ti\u00eau \u0111\u1ec1, n\u1ed9i dung v\u00e0 kho\u1ea3ng c\u00e1ch h\u00ecnh \u1ea3nh \u0111\u1ec3 slide b\u1edbt r\u1ed1i.',
        'Nh\u00e2n b\u1ea3n m\u1ed9t layout t\u1ed1t tr\u01b0\u1edbc r\u1ed3i thay n\u1ed9i dung thay v\u00ec d\u1ef1ng l\u1ea1i t\u1eeb \u0111\u1ea7u.',
      ],
      shortcuts: [
        { combo: 'Ctrl + M', action: 'Ch\u00e8n slide m\u1edbi', note: 'Th\u00eam nhanh slide k\u1ebf ti\u1ebfp' },
        { combo: 'Ctrl + D', action: 'Nh\u00e2n \u0111\u00f4i \u0111\u1ed1i t\u01b0\u1ee3ng ho\u1eb7c slide', note: 'R\u1ea5t ti\u1ec7n khi l\u1eb7p l\u1ea1i b\u1ed1 c\u1ee5c' },
        { combo: 'F5', action: 'Ch\u1ea1y tr\u00ecnh chi\u1ebfu t\u1eeb \u0111\u1ea7u', note: 'M\u1edf slide nhanh \u0111\u1ec3 d\u1ea1y ho\u1eb7c ki\u1ec3m tra' },
        { combo: 'Shift + F5', action: 'Ch\u1ea1y t\u1eeb slide hi\u1ec7n t\u1ea1i', note: 'Ti\u1ec7n khi t\u1eadp trung th\u1eed m\u1ed9t ph\u1ea7n' },
        { combo: 'Ctrl + G / Ctrl + Shift + G', action: 'Nh\u00f3m ho\u1eb7c t\u00e1ch nh\u00f3m \u0111\u1ed1i t\u01b0\u1ee3ng', note: 'Di chuy\u1ec3n layout nh\u01b0 m\u1ed9t kh\u1ed1i' },
        { combo: 'Ctrl + Shift + C / V', action: 'Sao ch\u00e9p v\u00e0 d\u00e1n \u0111\u1ecbnh d\u1ea1ng', note: 'Gi\u1eef style gi\u1eefa c\u00e1c slide \u0111\u1ed3ng nh\u1ea5t' },
        { combo: 'Alt + Shift + Left / Right', action: 'T\u0103ng ho\u1eb7c gi\u1ea3m c\u1ea5p bullet', note: 'S\u1eeda outline nhanh h\u01a1n' },
        { combo: 'B / W', action: 'Chuy\u1ec3n m\u00e0n h\u00ecnh \u0111en ho\u1eb7c tr\u1eafng', note: 'T\u1ea1m \u1ea9n slide \u0111\u1ec3 t\u1eadp trung gi\u1ea3i th\u00edch' },
        { combo: 'Ctrl + K', action: 'Ch\u00e8n li\u00ean k\u1ebft', note: 'G\u1eafn video, t\u00e0i li\u1ec7u ho\u1eb7c ho\u1ea1t \u0111\u1ed9ng' },
        { combo: 'Ctrl + Shift + > / <', action: 'T\u0103ng ho\u1eb7c gi\u1ea3m c\u1ee1 ch\u1eef', note: 'Ch\u1ec9nh ph\u00e2n c\u1ea5p ch\u1eef tr\u00ean slide nhanh' },
        { combo: 'Ctrl + Enter', action: 'Nh\u1ea3y sang placeholder k\u1ebf ti\u1ebfp', note: '\u0110i\u1ec1n ti\u00eau \u0111\u1ec1 v\u00e0 n\u1ed9i dung nhanh h\u01a1n' },
      ],
    },
    {
      key: 'windows',
      title: 'Windows',
      description: 'H\u1ee3p khi b\u1ea1n mu\u1ed1n chuy\u1ec3n \u1ee9ng d\u1ee5ng nhanh h\u01a1n v\u00e0 \u0111i\u1ec1u khi\u1ec3n desktop g\u1ecdn h\u01a1n.',
      tips: [
        'D\u00f9ng ph\u00edm chia \u0111\u00f4i c\u1eeda s\u1ed5 tr\u01b0\u1edbc gi\u1edd d\u1ea1y \u0111\u1ec3 t\u00e0i li\u1ec7u v\u00e0 n\u1ed9i dung l\u1edbp h\u1ecdc lu\u00f4n n\u1eb1m c\u1ea1nh nhau.',
        'D\u00f9ng ph\u00edm ch\u1ee5p m\u00e0n h\u00ecnh thay v\u00ec m\u1edf th\u00eam c\u00f4ng c\u1ee5 khi ch\u1ec9 c\u1ea7n ghi ch\u00fa nhanh m\u1ed9t v\u00f9ng.',
        'Ghim c\u00e1c \u1ee9ng d\u1ee5ng hay d\u00f9ng v\u00e0o taskbar \u0111\u1ec3 vi\u1ec7c m\u1edf g\u1ea7n nh\u01b0 t\u1ee9c th\u1eddi.',
      ],
      shortcuts: [
        { combo: 'Win + V', action: 'M\u1edf l\u1ecbch s\u1eed clipboard', note: 'D\u00f9ng l\u1ea1i \u0111o\u1ea1n copy ho\u1eb7c link r\u1ea5t nhanh' },
        { combo: 'Win + Shift + S', action: 'Ch\u1ee5p nhanh m\u1ed9t v\u00f9ng m\u00e0n h\u00ecnh', note: 'Ti\u1ec7n khi l\u1ea5y \u1ea3nh minh h\u1ecda ho\u1eb7c ghi ch\u00fa' },
        { combo: 'Win + .', action: 'M\u1edf b\u1ea3ng emoji v\u00e0 k\u00fd hi\u1ec7u', note: 'Th\u00eam k\u00fd hi\u1ec7u nhanh khi so\u1ea1n t\u00e0i li\u1ec7u' },
        { combo: 'Win + E', action: 'M\u1edf File Explorer', note: 'V\u00e0o file ngay l\u1eadp t\u1ee9c' },
        { combo: 'Win + D', action: 'Hi\u1ec7n ho\u1eb7c \u1ea9n desktop', note: 'D\u1ecdn m\u00e0n h\u00ecnh nhanh' },
        { combo: 'Win + Left / Right', action: 'Ghim c\u1eeda s\u1ed5 sang tr\u00e1i ho\u1eb7c ph\u1ea3i', note: 'R\u1ea5t h\u1ee3p \u0111\u1ec3 l\u00e0m vi\u1ec7c song song' },
        { combo: 'Alt + Tab', action: 'Chuy\u1ec3n gi\u1eefa c\u00e1c \u1ee9ng d\u1ee5ng \u0111ang m\u1edf', note: '\u0110\u1ed5i app nhanh khi \u0111ang d\u1ea1y' },
        { combo: 'Ctrl + Shift + Esc', action: 'M\u1edf Task Manager', note: 'Ki\u1ec3m tra ho\u1eb7c t\u1eaft app b\u1ecb treo nhanh' },
        { combo: 'Win + L', action: 'Kh\u00f3a m\u00e1y', note: 'B\u1ea3o v\u1ec7 phi\u00ean l\u00e0m vi\u1ec7c ngay l\u1eadp t\u1ee9c' },
        { combo: 'Win + P', action: 'M\u1edf t\u00f9y ch\u1ecdn tr\u00ecnh chi\u1ebfu m\u00e0n h\u00ecnh', note: '\u0110\u1ed5i ch\u1ebf \u0111\u1ed9 m\u00e1y chi\u1ebfu ho\u1eb7c m\u00e0n h\u00ecnh ph\u1ee5' },
        { combo: 'Win + Tab', action: 'M\u1edf Task View', note: 'Xem to\u00e0n b\u1ed9 c\u1eeda s\u1ed5 v\u00e0 desktop \u0111ang m\u1edf' },
        { combo: 'Win + Ctrl + D', action: 'T\u1ea1o desktop \u1ea3o m\u1edbi', note: 'T\u00e1ch vi\u1ec7c d\u1ea1y h\u1ecdc v\u1edbi vi\u1ec7c kh\u00e1c cho g\u1ecdn' },
      ],
    },
    {
      key: 'google',
      title: 'Google Docs / Sheets',
      description: 'H\u1ee3p khi b\u1ea1n l\u00e0m vi\u1ec7c tr\u00ean tr\u00ecnh duy\u1ec7t v\u00e0 c\u1ea7n s\u1eeda nhanh ho\u1eb7c chia s\u1ebb nhanh h\u01a1n.',
      tips: [
        'D\u00f9ng comment v\u00e0 suggestion khi c\u1ed9ng t\u00e1c \u0111\u1ec3 vi\u1ec7c xem l\u1ea1i thay \u0111\u1ed5i d\u1ec5 h\u01a1n.',
        'Gi\u1eef m\u1ed9t th\u01b0 m\u1ee5c chung cho t\u00e0i li\u1ec7u d\u1ea1y h\u1ecdc \u0111\u1ec3 b\u1edbt m\u1ea5t th\u1eddi gian t\u00ecm link trong chat ho\u1eb7c mail.',
        'D\u00f9ng tab tr\u00ecnh duy\u1ec7t c\u00f3 ch\u1ee7 \u0111\u00edch \u0111\u1ec3 kh\u00f4ng b\u1ecb lo\u1ea1n t\u00e0i li\u1ec7u.',
      ],
      shortcuts: [
        { combo: 'Ctrl + Alt + M', action: 'Ch\u00e8n comment', note: 'Ti\u1ec7n cho g\u00f3p \u00fd v\u00e0 c\u1ed9ng t\u00e1c' },
        { combo: 'Ctrl + Shift + C', action: '\u0110\u1ebfm t\u1eeb trong Google Docs', note: 'Ki\u1ec3m tra \u0111\u1ed9 d\u00e0i b\u00e0i vi\u1ebft nhanh' },
        { combo: 'Ctrl + /', action: 'M\u1edf danh s\u00e1ch ph\u00edm t\u1eaft', note: 'H\u1ecdc th\u00eam shortcut ngay trong Google app' },
        { combo: 'Ctrl + K', action: 'Ch\u00e8n li\u00ean k\u1ebft', note: 'G\u1eafn nhanh t\u00e0i li\u1ec7u chia s\u1ebb ho\u1eb7c link tham kh\u1ea3o' },
        { combo: 'Ctrl + Alt + Shift + H', action: 'M\u1edf l\u1ecbch s\u1eed phi\u00ean b\u1ea3n', note: 'Xem l\u1ea1i thay \u0111\u1ed5i trong file c\u1ed9ng t\u00e1c' },
        { combo: 'Ctrl + Enter', action: 'X\u00e1c nh\u1eadn d\u1eef li\u1ec7u \u00f4 trong Sheets', note: 'Nh\u1eadp li\u1ec7u nhanh h\u01a1n' },
        { combo: 'Ctrl + Shift + V', action: 'D\u00e1n ch\u1ec9 gi\u00e1 tr\u1ecb trong Sheets', note: 'Tr\u00e1nh k\u00e9o theo format kh\u00f4ng mong mu\u1ed1n' },
        { combo: 'Ctrl + Space', action: 'Ch\u1ecdn c\u1ed9t trong Sheets', note: 'Ti\u1ec7n khi format c\u1ea3 c\u1ed9t' },
        { combo: 'Shift + Space', action: 'Ch\u1ecdn h\u00e0ng trong Sheets', note: 'S\u1eeda c\u1ea3 d\u00f2ng d\u1eef li\u1ec7u nhanh' },
        { combo: 'Ctrl + Alt + Shift + =', action: 'Ch\u00e8n gi\u1edd hi\u1ec7n t\u1ea1i trong Sheets', note: 'Ti\u1ec7n cho log ho\u1eb7c d\u1ea5u m\u1ed1c th\u1eddi gian' },
        { combo: 'Alt + Shift + 5', action: 'G\u1ea1ch ngang trong Docs', note: '\u0110\u00e1nh d\u1ea5u vi\u1ec7c \u0111\u00e3 xong trong checklist' },
        { combo: 'Ctrl + Shift + 7 / 8', action: 'B\u1eadt danh s\u00e1ch s\u1ed1 ho\u1eb7c bullet', note: '\u0110\u1ed5i format ghi ch\u00fa nhanh trong Docs' },
      ],
    },
  ]

  const toolsEn: ToolSection[] = [
    {
      key: 'word',
      title: 'Word',
      description: 'Useful when you want cleaner document formatting and faster editing.',
      tips: [
        'Use Heading styles to keep titles and lesson sections consistent.',
        'Use Format Painter when several questions or headings need the same look.',
        'Use page breaks instead of empty lines when you want cleaner print output.',
      ],
      shortcuts: [
        { combo: 'Ctrl + B', action: 'Bold selected text', note: 'Emphasize titles or key instructions' },
        { combo: 'Ctrl + I', action: 'Italic selected text', note: 'Useful for examples or side notes' },
        { combo: 'Ctrl + U', action: 'Underline selected text', note: 'Highlight blanks or answer spaces' },
        { combo: 'Ctrl + Shift + > / <', action: 'Increase or decrease font size', note: 'Adjust text without opening menus' },
        { combo: 'Ctrl + E / L / R', action: 'Center, align left, or align right', note: 'Clean up layout quickly' },
        { combo: 'Ctrl + K', action: 'Insert hyperlink', note: 'Attach resource links or references' },
        { combo: 'Ctrl + Shift + C / V', action: 'Copy and paste formatting', note: 'Reuse exact text styling' },
        { combo: 'Ctrl + H', action: 'Open Find and Replace', note: 'Edit repeated words or formatting faster' },
        { combo: 'Shift + F3', action: 'Change uppercase and lowercase', note: 'Quick cleanup for headings' },
        { combo: 'Ctrl + M / Ctrl + Shift + M', action: 'Add or remove paragraph indent', note: 'Adjust document structure quickly' },
        { combo: 'Ctrl + Enter', action: 'Insert page break', note: 'Split pages cleanly for worksheets' },
        { combo: 'F7', action: 'Check spelling and grammar', note: 'Good final pass before sharing' },
      ],
    },
    {
      key: 'excel',
      title: 'Excel',
      description: 'Useful when you need faster navigation and cleaner spreadsheet review.',
      tips: [
        'Convert ranges into a Table when you want stable filters and easier formulas.',
        'Freeze the top row before entering or checking many student records.',
        'Use Conditional Formatting to surface missing work or low scores quickly.',
      ],
      shortcuts: [
        { combo: 'Ctrl + Shift + L', action: 'Turn filters on or off', note: 'Review scores or attendance faster' },
        { combo: 'Alt + =', action: 'AutoSum', note: 'Fast total for score columns' },
        { combo: 'Ctrl + 1', action: 'Open Format Cells', note: 'Change number, date, border, and alignment quickly' },
        { combo: 'Ctrl + ;', action: 'Insert current date', note: 'Useful for logs or attendance' },
        { combo: 'Ctrl + Space', action: 'Select the whole column', note: 'Helpful before formatting or deleting data' },
        { combo: 'Shift + Space', action: 'Select the whole row', note: 'Edit a full record faster' },
        { combo: 'Ctrl + Arrow', action: 'Jump to the edge of a data region', note: 'Navigate large sheets quickly' },
        { combo: 'Ctrl + Shift + +', action: 'Insert a new row or cells', note: 'Add data without using the ribbon' },
        { combo: 'Ctrl + -', action: 'Delete selected row or cells', note: 'Clean sheets faster during review' },
        { combo: 'Ctrl + D / R', action: 'Fill down or fill right', note: 'Repeat formulas or values quickly' },
        { combo: 'F4', action: 'Repeat the last action', note: 'Very useful for repeated formatting' },
        { combo: 'Ctrl + `', action: 'Show or hide formulas', note: 'Check formulas in one sweep' },
      ],
    },
    {
      key: 'powerpoint',
      title: 'PowerPoint',
      description: 'Useful when you want cleaner slides and faster presentation editing.',
      tips: [
        'Use Slide Master before formatting many slides so the whole deck stays consistent.',
        'Keep one visual rhythm for titles, body text, and image spacing to reduce clutter.',
        'Duplicate a strong layout first, then swap the content instead of rebuilding each slide.',
      ],
      shortcuts: [
        { combo: 'Ctrl + M', action: 'Insert a new slide', note: 'Quickly add the next slide' },
        { combo: 'Ctrl + D', action: 'Duplicate selected object or slide', note: 'Great for repeated layouts' },
        { combo: 'F5', action: 'Start slideshow from the beginning', note: 'Launch the presentation quickly' },
        { combo: 'Shift + F5', action: 'Start slideshow from the current slide', note: 'Useful when rehearsing one section' },
        { combo: 'Ctrl + G / Ctrl + Shift + G', action: 'Group or ungroup objects', note: 'Move layouts as one block' },
        { combo: 'Ctrl + Shift + C / V', action: 'Copy and paste formatting', note: 'Keep slide styling consistent' },
        { combo: 'Alt + Shift + Left / Right', action: 'Promote or demote bullet level', note: 'Fix outline structure faster' },
        { combo: 'B / W', action: 'Switch to a black or white screen', note: 'Temporarily hide slides while explaining' },
        { combo: 'Ctrl + K', action: 'Insert hyperlink', note: 'Attach videos, docs, or activities' },
        { combo: 'Ctrl + Shift + > / <', action: 'Increase or decrease font size', note: 'Adjust slide hierarchy quickly' },
        { combo: 'Ctrl + Enter', action: 'Move to the next placeholder', note: 'Fill title and content blocks faster' },
      ],
    },
    {
      key: 'windows',
      title: 'Windows',
      description: 'Useful when you want to move between apps faster and keep the desktop under control.',
      tips: [
        'Use split-screen shortcuts before class so materials and lesson content stay visible side by side.',
        'Use screenshot shortcuts instead of opening extra tools when you only need a quick capture.',
        'Pin your most-used apps to the taskbar so launching them feels instant.',
      ],
      shortcuts: [
        { combo: 'Win + V', action: 'Open clipboard history', note: 'Reuse copied text or links quickly' },
        { combo: 'Win + Shift + S', action: 'Capture part of the screen', note: 'Useful for quick references or screenshots' },
        { combo: 'Win + .', action: 'Open emoji and symbols panel', note: 'Insert symbols quickly while typing' },
        { combo: 'Win + E', action: 'Open File Explorer', note: 'Reach files instantly' },
        { combo: 'Win + D', action: 'Show or hide the desktop', note: 'Clear the screen quickly' },
        { combo: 'Win + Left / Right', action: 'Snap a window left or right', note: 'Great for side-by-side work' },
        { combo: 'Alt + Tab', action: 'Switch between open apps', note: 'Change apps quickly during class' },
        { combo: 'Ctrl + Shift + Esc', action: 'Open Task Manager', note: 'Check or close a frozen app quickly' },
        { combo: 'Win + L', action: 'Lock the computer', note: 'Secure your session instantly' },
        { combo: 'Win + P', action: 'Open projection settings', note: 'Change projector or second-screen mode' },
        { combo: 'Win + Tab', action: 'Open Task View', note: 'Review open windows and desktops' },
        { combo: 'Win + Ctrl + D', action: 'Create a new virtual desktop', note: 'Separate teaching work from other tasks' },
      ],
    },
    {
      key: 'google',
      title: 'Google Docs / Sheets',
      description: 'Useful when you work in the browser and need faster editing or sharing.',
      tips: [
        'Use comments and suggestions when collaborating so changes stay easy to review.',
        'Keep one shared folder for teaching files to reduce link hunting across chat and email.',
        'Use browser tabs intentionally so your references stay organized.',
      ],
      shortcuts: [
        { combo: 'Ctrl + Alt + M', action: 'Insert comment', note: 'Useful for review notes and collaboration' },
        { combo: 'Ctrl + Shift + C', action: 'Word count in Google Docs', note: 'Check writing length quickly' },
        { combo: 'Ctrl + /', action: 'Open keyboard shortcuts list', note: 'Learn more shortcuts inside Google apps' },
        { combo: 'Ctrl + K', action: 'Insert link', note: 'Attach shared docs or references quickly' },
        { combo: 'Ctrl + Alt + Shift + H', action: 'Open version history', note: 'Review changes in shared files' },
        { combo: 'Ctrl + Enter', action: 'Confirm cell entry in Sheets', note: 'Speed up data entry' },
        { combo: 'Ctrl + Shift + V', action: 'Paste values only in Sheets', note: 'Avoid bringing unwanted formatting' },
        { combo: 'Ctrl + Space', action: 'Select a column in Sheets', note: 'Helpful before formatting a whole column' },
        { combo: 'Shift + Space', action: 'Select a row in Sheets', note: 'Edit a whole row quickly' },
        { combo: 'Ctrl + Alt + Shift + =', action: 'Insert current time in Sheets', note: 'Useful for logs or timestamps' },
        { combo: 'Alt + Shift + 5', action: 'Strikethrough in Docs', note: 'Mark completed items in shared lists' },
        { combo: 'Ctrl + Shift + 7 / 8', action: 'Toggle numbered or bulleted list', note: 'Reformat notes quickly in Docs' },
      ],
    },
  ]

  const tools: ToolSection[] = language === 'en' ? toolsEn : toolsVi

  const activeSection = tools.find((tool) => tool.key === activeTool) ?? tools[0]
  const activeFavorites = favoriteShortcuts[activeTool] ?? []
  const totalFavoritesCount = useMemo(
    () => Object.values(favoriteShortcuts).reduce((total, entries) => total + entries.length, 0),
    [favoriteShortcuts],
  )

  const filteredShortcuts = useMemo<ShortcutViewItem[]>(() => {
    const keyword = searchValue.trim().toLowerCase()
    const sourceTools = searchAllTools ? tools : [activeSection]
    const collected = sourceTools.flatMap((tool) =>
      tool.shortcuts
        .filter((shortcut) =>
          !keyword
            ? true
            : [tool.title, shortcut.combo, shortcut.action, shortcut.note].some((value) =>
                value.toLowerCase().includes(keyword),
              ),
        )
        .map((shortcut) => ({
          ...shortcut,
          toolKey: tool.key,
          toolTitle: tool.title,
          isFavorite: (favoriteShortcuts[tool.key] ?? []).includes(shortcut.combo),
        })),
    )

    const baseResults = showFavoritesOnly ? collected.filter((shortcut) => shortcut.isFavorite) : collected

    return [...baseResults].sort((left, right) => {
      if (left.isFavorite !== right.isFavorite) return left.isFavorite ? -1 : 1
      if (left.toolKey !== right.toolKey) return sourceTools.findIndex((tool) => tool.key === left.toolKey) - sourceTools.findIndex((tool) => tool.key === right.toolKey)
      return left.combo.localeCompare(right.combo)
    })
  }, [activeSection, favoriteShortcuts, searchAllTools, searchValue, showFavoritesOnly, tools])

  const emptyStateCopy = useMemo(() => {
    if (showFavoritesOnly) {
      return language === 'en'
        ? 'No favorite shortcuts match this filter yet.'
        : 'Ch\u01b0a c\u00f3 ph\u00edm t\u1eaft \u01b0a d\u00f9ng ph\u00f9 h\u1ee3p v\u1edbi b\u1ed9 l\u1ecdc n\u00e0y.'
    }

    return labels.emptySearch
  }, [labels.emptySearch, language, showFavoritesOnly])

  const shortcutSectionTitle = searchAllTools
    ? `${labels.shortcutSectionTitle} - ${labels.allToolsScope}`
    : `${labels.shortcutSectionTitle} - ${activeSection.title}`

  const exportTitleSuffix = searchAllTools ? labels.allToolsScope : activeSection.title
  const exportDescription = searchAllTools ? labels.allToolsScope : activeSection.description
  const shortcutOverviewItems = [
    `${searchAllTools ? filteredShortcuts.length : activeSection.shortcuts.length} ${labels.shortcutLabel}`,
    `${activeSection.tips.length} ${labels.tipLabel}`,
    `${searchAllTools ? totalFavoritesCount : activeFavorites.length} ${labels.favoriteLabel}`,
  ]

  const getToolIcon = (toolKey: ToolKey) => {
    if (toolKey === 'word') return <FileWordOutlined />
    if (toolKey === 'excel') return <FileExcelOutlined />
    if (toolKey === 'powerpoint') return <FilePptOutlined />
    if (toolKey === 'windows') return <DesktopOutlined />
    return <GoogleOutlined />
  }

  const handleToggleFavorite = useCallback(
    (toolKey: ToolKey, combo: string) => {
      const currentItems = favoriteShortcuts[toolKey] ?? []
      const isRemoving = currentItems.includes(combo)

      setFavoriteShortcuts((current) => {
        const existingItems = current[toolKey] ?? []
        const nextItems = isRemoving
          ? existingItems.filter((item) => item !== combo)
          : [...existingItems, combo]

        return {
          ...current,
          [toolKey]: nextItems,
        }
      })

      message.success(isRemoving ? labels.favoriteRemoved : labels.favoriteAdded)
    },
    [favoriteShortcuts, labels.favoriteAdded, labels.favoriteRemoved, message],
  )

  const handleExportPdf = useCallback(async () => {
    setExportingPdf(true)

    try {
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
        const shortcutLines = doc.splitTextToSize(`${sourcePrefix}${shortcut.action} - ${shortcut.note}`, contentWidth - 44)
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
      message.success(labels.exportSuccess)
    } catch {
      message.error(labels.exportError)
    } finally {
      setExportingPdf(false)
    }
  }, [activeSection, exportDescription, exportTitleSuffix, filteredShortcuts, labels, language, message, searchAllTools])

  return (
    <Space orientation="vertical" size={20} className="full-width">
      <Card className="content-card office-switcher-card" variant="borderless">
        <div className="office-tool-switcher">
          <div className="office-tool-switcher-head">
            <Text strong>{labels.subnavTitle}</Text>
          </div>

          <div className="office-tool-switcher-tabs">
            {tools.map((tool) => {
              const isActive = tool.key === activeTool

              return (
                <button
                  key={tool.key}
                  type="button"
                  className={`office-tool-tab ${isActive ? 'office-tool-tab-active' : ''}`}
                  onClick={() => setActiveTool(tool.key)}
                >
                  <div className={`office-subnav-icon office-subnav-icon-${tool.key}`}>{getToolIcon(tool.key)}</div>
                  <div className="office-tool-tab-copy">
                    <div className="office-tool-tab-topline">
                      <Text strong>{tool.title}</Text>
                      <Tag className="office-subnav-tag">{tool.shortcuts.length}</Tag>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      <Card className="content-card office-detail-card" variant="borderless">
        <Space orientation="vertical" size={18} className="full-width">
          <Space orientation="vertical" size={18} className="full-width">
            <div className="office-section-block">
              <div className="office-block-heading">
                <CheckCircleOutlined />
                <Text strong>{labels.tipsSectionTitle}</Text>
              </div>
              <div className="office-tip-list">
                {activeSection.tips.map((tip) => (
                  <div className="office-tip-item" key={tip}>
                    <CheckCircleOutlined />
                    <Text>{tip}</Text>
                  </div>
                ))}
              </div>
            </div>

            <div className="office-section-block">
              <div className="office-shortcut-header">
                <div className="office-block-heading office-block-heading-inline">
                  <KeyOutlined />
                  <Text strong>{shortcutSectionTitle}</Text>
                </div>
                <div className="office-shortcut-overview">
                  {shortcutOverviewItems.map((item) => (
                    <span className="office-shortcut-overview-item" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
                <div className="office-shortcut-toolbar">
                  <div className="office-filter-chips">
                    <Button
                      type={searchAllTools ? 'default' : 'primary'}
                      className={`office-filter-chip ${searchAllTools ? '' : 'office-filter-chip-active'}`}
                      onClick={() => setSearchAllTools(false)}
                    >
                      <span className="office-filter-chip-icon">
                        <KeyOutlined />
                      </span>
                      {labels.currentToolScope}
                    </Button>
                    <Button
                      type={searchAllTools ? 'primary' : 'default'}
                      className={`office-filter-chip ${searchAllTools ? 'office-filter-chip-active' : ''}`}
                      onClick={() => setSearchAllTools(true)}
                    >
                      <span className="office-filter-chip-icon">
                        <AppstoreOutlined />
                      </span>
                      {labels.allToolsScope}
                    </Button>
                    <Button
                      type={showFavoritesOnly ? 'primary' : 'default'}
                      className={`office-filter-chip office-filter-chip-favorite ${showFavoritesOnly ? 'office-filter-chip-active' : ''}`}
                      onClick={() => setShowFavoritesOnly((current) => !current)}
                    >
                      <span className="office-filter-chip-icon">
                        {showFavoritesOnly ? <StarFilled /> : <StarOutlined />}
                      </span>
                      {labels.favoritesOnly}
                    </Button>
                  </div>
                  <div className="office-toolbar-search-row">
                    <Input
                      allowClear
                      value={searchValue}
                      onChange={(event) => setSearchValue(event.target.value)}
                      prefix={<SearchOutlined />}
                      placeholder={labels.searchPlaceholder}
                      className="office-search-input"
                    />
                    <Button
                      type="primary"
                      icon={<FilePdfOutlined />}
                      onClick={handleExportPdf}
                      loading={exportingPdf}
                      className="office-toolbar-button"
                    >
                      {labels.exportAction}
                    </Button>
                  </div>
                </div>
              </div>

              {filteredShortcuts.length ? (
                <div className="office-shortcut-list">
                  {filteredShortcuts.map((shortcut) => {
                    return (
                      <div
                        className={`office-shortcut-item ${shortcut.isFavorite ? 'office-shortcut-item-favorite' : ''}`}
                        key={`${shortcut.toolKey}-${shortcut.combo}`}
                      >
                        <div className={`office-shortcut-combo office-shortcut-combo-${shortcut.toolKey}`}>
                          {shortcut.combo}
                        </div>
                        <div className="office-shortcut-copy">
                          <div className="office-shortcut-title-row">
                            <Text strong>{shortcut.action}</Text>
                            <Tag className={`office-source-tag office-source-tag-${shortcut.toolKey}`}>{shortcut.toolTitle}</Tag>
                          </div>
                          <Text>{shortcut.note}</Text>
                        </div>
                        <div className="office-shortcut-actions">
                          <Button
                            type="text"
                            icon={shortcut.isFavorite ? <StarFilled /> : <StarOutlined />}
                            className={`office-action-button ${shortcut.isFavorite ? 'office-action-button-favorite' : ''}`}
                            onClick={() => handleToggleFavorite(shortcut.toolKey, shortcut.combo)}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="office-empty-search">
                  <SearchOutlined />
                  <Text>{emptyStateCopy}</Text>
                </div>
              )}
            </div>
          </Space>
        </Space>
      </Card>
    </Space>
  )
}

export default OfficeTipsPage




