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
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useI18n } from '../../i18n'
import { toolsEn, toolsVi } from './data'
import { exportOfficeTipsPdf } from './pdf'
import {
  getInitialFavorites,
  getInitialTool,
  OFFICE_TIPS_ACTIVE_TOOL_KEY,
  OFFICE_TIPS_FAVORITES_KEY,
} from './storage'
import { useOfficeTips } from './hooks/useOfficeTips'
import type { FavoriteShortcutMap, ToolKey } from './types'

const { Text } = Typography

function OfficeTipsPage() {
  const { message } = AntdApp.useApp()
  const { language, t } = useI18n()
  const [activeTool, setActiveTool] = useState<ToolKey>(getInitialTool)
  const [searchValue, setSearchValue] = useState('')
  const [favoriteShortcuts, setFavoriteShortcuts] = useState<FavoriteShortcutMap>(getInitialFavorites)
  const [searchAllTools, setSearchAllTools] = useState(false)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const deferredSearchValue = useDeferredValue(searchValue)

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

  const labels = useMemo(
    () => ({
      subnavTitle: t('officeTips.subnavTitle'),
      searchPlaceholder: t('officeTips.searchPlaceholder'),
      emptySearch: t('officeTips.emptySearch'),
      emptyFavorites: t('officeTips.emptyFavorites'),
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
    }),
    [t],
  )
  const tools = useMemo(() => (language === 'en' ? toolsEn : toolsVi), [language])
  const {
    activeSection,
    filteredShortcuts,
    emptyStateCopy,
    shortcutSectionTitle,
    shortcutOverviewItems,
    handleToggleFavorite,
  } = useOfficeTips({
    tools,
    activeTool,
    searchValue: deferredSearchValue,
    favoriteShortcuts,
    setFavoriteShortcuts,
    searchAllTools,
    showFavoritesOnly,
    labels,
    message,
  })

  const getToolIcon = (toolKey: ToolKey) => {
    if (toolKey === 'word') return <FileWordOutlined />
    if (toolKey === 'excel') return <FileExcelOutlined />
    if (toolKey === 'powerpoint') return <FilePptOutlined />
    if (toolKey === 'windows') return <DesktopOutlined />
    return <GoogleOutlined />
  }

  const handleExportPdf = useCallback(async () => {
    setExportingPdf(true)

    try {
      await exportOfficeTipsPdf({
        language,
        activeSection,
        filteredShortcuts,
        searchAllTools,
        labels: {
          pdfTitle: labels.pdfTitle,
          pdfTipsTitle: labels.pdfTipsTitle,
          pdfShortcutsTitle: labels.pdfShortcutsTitle,
          pdfGeneratedAt: labels.pdfGeneratedAt,
          favoriteLabel: labels.favoriteLabel,
        },
      })
      message.success(labels.exportSuccess)
    } catch {
      message.error(labels.exportError)
    } finally {
      setExportingPdf(false)
    }
  }, [activeSection, filteredShortcuts, labels, language, message, searchAllTools])

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





