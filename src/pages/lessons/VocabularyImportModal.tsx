import { DownloadOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, Modal, Space, Switch, Typography } from 'antd'
import type { VocabularyImportModalProps } from './types'

const { Paragraph, Text } = Typography

function VocabularyImportModal({
  open,
  onCancel,
  onSubmit,
  confirmLoading,
  copy,
  autoFillIpa,
  onAutoFillIpaChange,
  onDownloadCsv,
  onDownloadExcel,
  onFileSelect,
  importFileName,
  importRowsCount,
}: VocabularyImportModalProps) {
  return (
    <Modal
      title={copy.importTitle}
      open={open}
      onCancel={onCancel}
      onOk={onSubmit}
      okText={copy.importRun}
      confirmLoading={confirmLoading}
    >
      <Space direction="vertical" size={14} className="full-width">
        <Paragraph className="settings-copy">{copy.importCopy}</Paragraph>
        <Text type="secondary">{copy.importHint}</Text>

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

        <div className="vocabulary-import-actions">
          <Button icon={<DownloadOutlined />} onClick={onDownloadCsv}>
            {copy.downloadTemplateCsv}
          </Button>
          <Button icon={<DownloadOutlined />} onClick={onDownloadExcel}>
            {copy.downloadTemplateExcel}
          </Button>
          <label className="vocabulary-import-upload">
            <input
              type="file"
              accept=".csv,text/csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) {
                  void onFileSelect(file)
                }
                event.currentTarget.value = ''
              }}
            />
            <UploadOutlined />
            <span>{copy.fileButton}</span>
          </label>
        </div>

        {importFileName ? (
          <div className="vocabulary-import-summary">
            <Text strong>{copy.importSelectedFile}:</Text> <Text>{importFileName}</Text>
          </div>
        ) : null}

        {importRowsCount > 0 ? (
          <div className="vocabulary-import-summary">
            <Text>{copy.importRowsReady.replace('{count}', String(importRowsCount))}</Text>
          </div>
        ) : null}
      </Space>
    </Modal>
  )
}

export default VocabularyImportModal
