import {
  BookOutlined,
  BulbOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  PlayCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { Card, Col, Row, Space, Tag, Typography } from 'antd'
import { useI18n } from '../i18n'

const { Paragraph, Text, Title } = Typography

function HelpPage() {
  const { t } = useI18n()

  const copy = {
    quickStart: t('help.quickStart'),
    intro: t('help.intro'),
    menuGuide: t('help.menuGuide'),
    menuGuideCopy: t('help.menuGuideCopy'),
    tipsTitle: t('help.tipsTitle'),
    aboutTitle: t('help.aboutTitle'),
    step1Title: t('help.step1Title'),
    step1Copy: t('help.step1Copy'),
    step2Title: t('help.step2Title'),
    step2Copy: t('help.step2Copy'),
    step3Title: t('help.step3Title'),
    step3Copy: t('help.step3Copy'),
    step4Title: t('help.step4Title'),
    step4Copy: t('help.step4Copy'),
    step5Title: t('help.step5Title'),
    step5Copy: t('help.step5Copy'),
    lessonsTitle: t('help.lessonsTitle'),
    lessonsCopy: t('help.lessonsCopy'),
    practiceTitle: t('help.practiceTitle'),
    practiceCopy: t('help.practiceCopy'),
    plannerTitle: t('help.plannerTitle'),
    plannerCopy: t('help.plannerCopy'),
    settingsTitle: t('help.settingsTitle'),
    settingsCopy: t('help.settingsCopy'),
    teacherTip1: t('help.teacherTip1'),
    teacherTip2: t('help.teacherTip2'),
    teacherTip3: t('help.teacherTip3'),
    teacherTip4: t('help.teacherTip4'),
    teacherTip5: t('help.teacherTip5'),
    aboutCopy: t('help.aboutCopy'),
    guideTag: t('help.guideTag'),
    menuTag: t('help.menuTag'),
    tipsTag: t('help.tipsTag'),
    aboutTag: t('help.aboutTag'),
  }

  const quickSteps = [
    { icon: <BookOutlined />, title: copy.step1Title, description: copy.step1Copy },
    { icon: <BookOutlined />, title: copy.step2Title, description: copy.step2Copy },
    { icon: <BulbOutlined />, title: copy.step3Title, description: copy.step3Copy },
    { icon: <PlayCircleOutlined />, title: copy.step4Title, description: copy.step4Copy },
    { icon: <CalendarOutlined />, title: copy.step5Title, description: copy.step5Copy },
  ]

  const menuSections = [
    {
      tag: copy.guideTag,
      tagClassName: 'help-section-tag-cyan',
      icon: <BookOutlined />,
      title: copy.lessonsTitle,
      description: copy.lessonsCopy,
    },
    {
      tag: copy.menuTag,
      tagClassName: 'help-section-tag-geekblue',
      icon: <PlayCircleOutlined />,
      title: copy.practiceTitle,
      description: copy.practiceCopy,
    },
    {
      tag: copy.menuTag,
      tagClassName: 'help-section-tag-green',
      icon: <CalendarOutlined />,
      title: copy.plannerTitle,
      description: copy.plannerCopy,
    },
    {
      tag: copy.menuTag,
      tagClassName: 'help-section-tag-gold',
      icon: <SettingOutlined />,
      title: copy.settingsTitle,
      description: copy.settingsCopy,
    },
  ]

  const teacherTips = [copy.teacherTip1, copy.teacherTip2, copy.teacherTip3, copy.teacherTip4, copy.teacherTip5]

  return (
    <Space orientation="vertical" size={20} className="full-width">
      <Row gutter={[18, 18]}>
        <Col xs={24} xl={14}>
          <Card className="content-card help-guide-card" variant="borderless">
            <Space orientation="vertical" size={16} className="full-width">
              <div className="section-heading">
                <Title level={3}>{copy.quickStart}</Title>
                <Paragraph>{copy.intro}</Paragraph>
              </div>

              <div className="help-step-list">
                {quickSteps.map((step, index) => (
                  <div className="help-step-item" key={step.title}>
                    <div className="help-step-icon">{step.icon}</div>
                    <div>
                      <div className="help-step-head">
                        <Tag variant="filled" className="help-step-badge">
                          {t('help.stepLabel', { count: index + 1 })}
                        </Tag>
                        <Text strong>{step.title}</Text>
                      </div>
                      <Paragraph className="settings-copy">{step.description}</Paragraph>
                    </div>
                  </div>
                ))}
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Space orientation="vertical" size={16} className="full-width help-side-stack">
            <Card className="content-card help-section-card" variant="borderless">
              <Space orientation="vertical" size={12} className="full-width">
                <Tag variant="filled" className="help-section-tag help-section-tag-blue">
                  {copy.menuTag}
                </Tag>
                <div className="settings-heading">
                  <InfoCircleOutlined />
                  <Title level={4}>{copy.menuGuide}</Title>
                </div>
                <Paragraph className="settings-copy help-section-copy">{copy.menuGuideCopy}</Paragraph>
              </Space>
            </Card>

            {menuSections.map((section) => (
              <Card className="content-card help-section-card" variant="borderless" key={section.title}>
                <Space orientation="vertical" size={12} className="full-width">
                  <Tag variant="filled" className={`help-section-tag ${section.tagClassName}`}>
                    {section.tag}
                  </Tag>
                  <div className="settings-heading">
                    {section.icon}
                    <Title level={4}>{section.title}</Title>
                  </div>
                  <Paragraph className="settings-copy help-section-copy">{section.description}</Paragraph>
                </Space>
              </Card>
            ))}

            <Card className="content-card help-section-card help-tips-card" variant="borderless">
              <Space orientation="vertical" size={12} className="full-width">
                <Tag variant="filled" className="help-section-tag help-section-tag-purple">
                  {copy.tipsTag}
                </Tag>
                <div className="settings-heading">
                  <BulbOutlined />
                  <Title level={4}>{copy.tipsTitle}</Title>
                </div>
                <div className="help-tips-list">
                  {teacherTips.map((tip) => (
                    <div className="help-tip-item" key={tip}>
                      <CheckCircleOutlined />
                      <Paragraph className="settings-copy">{tip}</Paragraph>
                    </div>
                  ))}
                </div>
              </Space>
            </Card>

            <Card className="content-card help-section-card" variant="borderless">
              <Space orientation="vertical" size={12} className="full-width">
                <Tag variant="filled" className="help-section-tag help-section-tag-volcano">
                  {copy.aboutTag}
                </Tag>
                <div className="settings-heading">
                  <InfoCircleOutlined />
                  <Title level={4}>{copy.aboutTitle}</Title>
                </div>
                <Paragraph className="settings-copy help-section-copy">{copy.aboutCopy}</Paragraph>
                <Paragraph className="settings-copy settings-about-note">{t('common.appOwner')}</Paragraph>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
    </Space>
  )
}

export default HelpPage
