import React from "react";
import { Button, Select, DatePicker, Card, List, Typography } from "antd";
import { CheckOutlined, CloseOutlined, PlusOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface TaskCardProps {
  description: string;
}

const data: string[] = [
  "Learning Product design course curriculum Learning Product design course curriculum",
  "Learning Product design course curriculum Learning Product design course curriculum",
  "Learning Product design course curriculum Learning Product design course curriculum",
];

const TaskCard: React.FC<TaskCardProps> = ({ description }) => (
  <Card bodyStyle={{ padding: 0 }} className="p-4">
    <div className="flex justify-between">
    <span className="text-gray-300">date here</span>
    <span className="text-gray-300">User name here</span>
   
    </div>
     <div className="text-black font-semibold">Software Department</div>
     <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
    <Text>{description}</Text>
     <div className="flex gap-2">
      <Button type="primary" icon={<CheckOutlined />} />
      <Button type="primary" className="bg-red-500" icon={<CloseOutlined />} />
     </div>
    
    </div>
    <Button type="link" icon={<PlusOutlined />}>Add new</Button>
  </Card>
);

const TaskList: React.FC = () => (
  <Card>
    <Title level={5}>Software Department</Title>
    <List
      dataSource={data}
      renderItem={(item: string) => (
        <List.Item>
          <Text>• {item}</Text>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <Button type="primary" icon={<CheckOutlined />} />
            <Button type="primary" danger icon={<CloseOutlined />} />
          </div>
        </List.Item>
      )}
    />
    <Button type="link" icon={<PlusOutlined />}>Add new</Button>
  </Card>
);

const Department: React.FC = () => {
  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <Select placeholder="Select Department" style={{ width: 200 }} />
        <DatePicker picker="week" />
        <Button type="primary" icon={<PlusOutlined />}>Add one thing</Button>
      </div>
      <TaskCard description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed rutrum purus massa, et egestas enim volutpat ut. Aliquam vel tempus velit." />
      <TaskList />
    </div>
  );
};

export default Department;
