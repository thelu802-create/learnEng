import { PlusOutlined } from "@ant-design/icons";
import { Button, Space } from "antd";
import type { ReactNode } from "react";
import { PageHeading } from "./PageHeading";

export function CrudToolbar({
  title,
  subtitle,
  buttonLabel,
  onAdd,
  extra,
}: {
  title: string;
  subtitle: string;
  buttonLabel: string;
  onAdd: () => void;
  extra?: ReactNode;
}) {
  return (
    <div className="toolbar">
      <PageHeading title={title} subtitle={subtitle} />
      <Space>
        {extra}
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          {buttonLabel}
        </Button>
      </Space>
    </div>
  );
}
