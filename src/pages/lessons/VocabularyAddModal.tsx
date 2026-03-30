import { Form, Input, Modal, Select, Space, Switch, Typography } from 'antd'
import type { VocabularyAddModalProps } from './types'

const { Paragraph, Text } = Typography

function VocabularyAddModal({
  open,
  onCancel,
  onSubmit,
  confirmLoading,
  copy,
  language,
  form,
  autoFillIpa,
  onAutoFillIpaChange,
  topics,
  mode,
  submitLabel,
}: VocabularyAddModalProps) {
  const validationMessages =
    language === 'en'
      ? {
          topic: 'Please choose a topic.',
          word: 'Please enter a word.',
          meaning: 'Please enter the meaning.',
        }
      : {
          topic: 'Hãy chọn chủ điểm.',
          word: 'Hãy nhập từ vựng.',
          meaning: 'Hãy nhập nghĩa.',
        }

  return (
    <Modal
      title={mode === 'edit' ? copy.updateWord : copy.addWordTitle}
      open={open}
      onCancel={onCancel}
      onOk={onSubmit}
      okText={submitLabel}
      confirmLoading={confirmLoading}
    >
      <Space direction="vertical" size={14} className="full-width">
        <Paragraph className="settings-copy">{copy.addWordCopy}</Paragraph>
        <div className="vocabulary-import-summary">
          <Space align="center" size={12}>
            <Switch checked={autoFillIpa} onChange={onAutoFillIpaChange} />
            <div>
              <Text strong>{copy.autoFillIpa}</Text>
              <div>
                <Text type="secondary">{copy.autoFillIpaHint}</Text>
              </div>
            </div>
          </Space>
        </div>

        <Form form={form} layout="vertical">
          <Form.Item
            name="topicKey"
            label={copy.fieldTopic}
            rules={[{ required: true, message: validationMessages.topic }]}
          >
            <Select
              options={topics.map((topic) => ({
                label: topic.title,
                value: topic.key,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="word"
            label={copy.fieldWord}
            rules={[{ required: true, message: validationMessages.word }]}
          >
            <Input />
          </Form.Item>

          {!autoFillIpa ? (
            <Form.Item name="ipa" label={copy.fieldIpa}>
              <Input />
            </Form.Item>
          ) : null}

          <Form.Item
            name="meaning"
            label={copy.fieldMeaning}
            rules={[{ required: true, message: validationMessages.meaning }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="example" label={copy.fieldExample}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Space>
    </Modal>
  )
}

export default VocabularyAddModal
