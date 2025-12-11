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
      data-cy="feedback-meeting-components-meetingobjectives-card"
      id="feedback-meeting-components-meetingobjectives-card"
    >
      <h2
        className="text-lg font-semibold mb-2"
        data-cy="feedback-meeting-components-meetingobjectives-heading"
        id="feedback-meeting-components-meetingobjectives-heading"
      >
        Meeting Objectives
      </h2>
      <p
        className="text-[#323B49]"
        data-cy="feedback-meeting-components-meetingobjectives-text"
        id="feedback-meeting-components-meetingobjectives-text"
      >
        {objective}
      </p>
    </Card>
  );
}
