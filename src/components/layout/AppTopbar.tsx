import {
  FontSizeOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  MenuOutlined,
  MoonOutlined,
  SettingOutlined,
  SunOutlined,
} from '@ant-design/icons'
import { Button, Divider, Drawer, Segmented, Tooltip, Typography } from 'antd'
import { useState } from 'react'
import { useI18n } from '../../i18n'
import type { FontSizeMode, GradeKey, ThemeMode } from '../../types'

const { Paragraph, Text, Title } = Typography

interface AppTopbarProps {
  selectedGrade: GradeKey
  gradeOptions: GradeKey[]
  onGradeChange: (grade: GradeKey) => void
  onOpenMobileMenu: () => void
  themeMode: ThemeMode
  onThemeChange: (themeMode: ThemeMode) => void
  fontSizeMode: FontSizeMode
  onFontSizeChange: (fontSizeMode: FontSizeMode) => void
}

function AppTopbar({
  selectedGrade,
  gradeOptions,
  onGradeChange,
  onOpenMobileMenu,
  themeMode,
  onThemeChange,
  fontSizeMode,
  onFontSizeChange,
}: AppTopbarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { language, setLanguage, t, gradeLabel } = useI18n()

  const settingsCopy =
    language === 'en'
      ? {
          settingsTitle: 'Quick settings',
          settingsSubtitle:
            'Adjust the learning experience in the way that feels most comfortable.',
          languageCopy: 'Choose the display language for the whole application.',
          themeTitle: 'Theme',
          themeCopy: 'Switch appearance with one tap.',
          fontSizeTitle: 'Font size',
          fontSizeCopy: 'Adjust text size for a more comfortable reading experience.',
          aboutTitle: 'About app',
          aboutCopy:
            'English Path brings lessons, vocabulary lookup, and practice into one focused interface for lower secondary students.',
          aboutOwnerPrefix: 'Crafted for teaching by',
          aboutOwnerName: 'Nguyen The Lu',
          settingsLabel: 'Settings',
          lightMode: 'Light mode',
          darkMode: 'Dark mode',
          fontSizeSmall: 'Small',
          fontSizeMedium: 'Default',
          fontSizeLarge: 'Large',
        }
      : {
          settingsTitle: 'Cài đặt nhanh',
          settingsSubtitle: 'Tùy chỉnh trải nghiệm học tập theo cách bạn thấy thoải mái nhất.',
          languageCopy: 'Chọn ngôn ngữ hiển thị cho toàn bộ ứng dụng.',
          themeTitle: 'Giao diện',
          themeCopy: 'Chuyển nhanh giữa chế độ sáng và tối.',
          fontSizeTitle: 'Cỡ chữ',
          fontSizeCopy: 'Điều chỉnh kích thước chữ để đọc thoải mái hơn.',
          aboutTitle: 'Về ứng dụng',
          aboutCopy:
            'English Path gom bài học, tra từ vựng và luyện tập trong một giao diện gọn, dễ dùng cho học sinh THCS.',
          aboutOwner: `Phát triển bởi ${t('common.appOwner')}.`,
          settingsLabel: 'Cài đặt',
          lightMode: 'Chế độ sáng',
          darkMode: 'Chế độ tối',
          fontSizeSmall: 'Nhỏ',
          fontSizeMedium: 'Vừa',
          fontSizeLarge: 'Lớn',
        }

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <Button
            type="default"
            icon={<MenuOutlined />}
            className="mobile-menu-trigger"
            onClick={onOpenMobileMenu}
            aria-label={language === 'en' ? 'Open navigation menu' : 'Mở menu điều hướng'}
          />
          <div>
            <Text className="page-kicker">{t('common.gradeLabel')}</Text>
            <Title level={4} className="page-title">
              {gradeLabel(selectedGrade)}
            </Title>
          </div>
        </div>

        <div className="topbar-actions">
          <div className="grade-picker">
            <Text className="grade-picker-label">{t('common.chooseGrade')}</Text>
            <Segmented
              options={gradeOptions.map((grade) => ({
                label: gradeLabel(grade),
                value: grade,
              }))}
              value={selectedGrade}
              onChange={(value) => onGradeChange(value as GradeKey)}
              className="grade-switcher"
            />
          </div>

          <Tooltip title={settingsCopy.settingsLabel}>
            <Button
              type="default"
              icon={<SettingOutlined />}
              className={`settings-trigger settings-trigger-icon ${isSettingsOpen ? 'is-open' : ''}`}
              onClick={() => setIsSettingsOpen(true)}
              aria-label={settingsCopy.settingsLabel}
            />
          </Tooltip>
        </div>
      </header>

      <Drawer
        title={settingsCopy.settingsTitle}
        placement="right"
        width={380}
        styles={{ body: { paddingBottom: 32 } }}
        onClose={() => setIsSettingsOpen(false)}
        open={isSettingsOpen}
        className="settings-drawer"
      >
        <div className="settings-stack">
          <div className="settings-section">
            <Text className="settings-eyebrow">{settingsCopy.settingsTitle}</Text>
            <Paragraph className="settings-copy">{settingsCopy.settingsSubtitle}</Paragraph>
          </div>

          <div className="settings-section">
            <div className="settings-heading">
              <GlobalOutlined />
              <Title level={5}>{t('common.language')}</Title>
            </div>
            <Paragraph className="settings-copy">{settingsCopy.languageCopy}</Paragraph>
            <Segmented
              block
              options={[
                { label: 'VI', value: 'vi' },
                { label: 'EN', value: 'en' },
              ]}
              value={language}
              onChange={(value) => setLanguage(value as 'vi' | 'en')}
              className="settings-segmented"
            />
          </div>

          <Divider />

          <div className="settings-section">
            <div className="settings-heading">
              <FontSizeOutlined />
              <Title level={5}>{settingsCopy.fontSizeTitle}</Title>
            </div>
            <Paragraph className="settings-copy">{settingsCopy.fontSizeCopy}</Paragraph>
            <Segmented
              block
              options={[
                { label: 'A-', value: 'sm' },
                { label: 'A', value: 'md' },
                { label: 'A+', value: 'lg' },
              ]}
              value={fontSizeMode}
              onChange={(value) => onFontSizeChange(value as FontSizeMode)}
              className="settings-segmented font-size-segmented"
            />
            <div className="font-size-hints" aria-hidden="true">
              <span>{settingsCopy.fontSizeSmall}</span>
              <span>{settingsCopy.fontSizeMedium}</span>
              <span>{settingsCopy.fontSizeLarge}</span>
            </div>
          </div>

          <Divider />

          <div className="settings-section">
            <div className="settings-heading">
              <SettingOutlined />
              <Title level={5}>{settingsCopy.themeTitle}</Title>
            </div>
            <Paragraph className="settings-copy">{settingsCopy.themeCopy}</Paragraph>

            <div className="theme-toggle-grid" role="group" aria-label={settingsCopy.themeTitle}>
              <Tooltip title={settingsCopy.lightMode}>
                <button
                  type="button"
                  className={`theme-toggle-button ${themeMode === 'light' ? 'is-active is-light' : ''}`}
                  onClick={() => onThemeChange('light')}
                  aria-label={settingsCopy.lightMode}
                  aria-pressed={themeMode === 'light'}
                >
                  <SunOutlined />
                </button>
              </Tooltip>

              <Tooltip title={settingsCopy.darkMode}>
                <button
                  type="button"
                  className={`theme-toggle-button ${themeMode === 'dark' ? 'is-active is-dark' : ''}`}
                  onClick={() => onThemeChange('dark')}
                  aria-label={settingsCopy.darkMode}
                  aria-pressed={themeMode === 'dark'}
                >
                  <MoonOutlined />
                </button>
              </Tooltip>
            </div>
          </div>

          <Divider />

          <div className="settings-section">
            <div className="settings-heading">
              <InfoCircleOutlined />
              <Title level={5}>{settingsCopy.aboutTitle}</Title>
            </div>
            <Paragraph className="settings-copy">{settingsCopy.aboutCopy}</Paragraph>
            <Paragraph className="settings-copy settings-about-note">
              {language === 'en' ? 'Crafted for teaching by ' : 'Phát triển và biên soạn bởi '}
              <span className="settings-about-owner-name">
                {language === 'en' ? 'Nguyen The Lu' : 'Nguyễn Thế Lữ'}
              </span>
            </Paragraph>
          </div>
        </div>
      </Drawer>
    </>
  )
}

export default AppTopbar
