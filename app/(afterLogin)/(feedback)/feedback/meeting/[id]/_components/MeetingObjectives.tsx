import { Card } from 'antd';

// components/MeetingDetail/MeetingObjectives.tsx
type MeetingObjectivesProps = {
  objective: string;
  loading: boolean;
};

export default function MeetingObjectives({
  objective,
  loading,
}: MeetingObjectivesProps) {
  return (
    <Card
      bodyStyle={{ padding: 0 }}
      loading={loading}
      className="border-none p-4"
    >
      <h2 className="text-lg font-sem ibold mb-2">Meeting Objectives</h2>
      <p className="text-gray-600">{objective}</p>
    </Card>
  );
}
