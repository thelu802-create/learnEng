import { Space, Tag } from "antd";

export function ObjectiveTags({ objectives }: { objectives: string[] }) {
  return (
    <Space size={[4, 6]} wrap>
      {objectives.map((objective) => (
        <Tag key={objective}>{objective}</Tag>
      ))}
    </Space>
  );
}
