import { Button } from "antd";
import ActionPlanCard from "./ActionPlanCard";

// components/MeetingDetail/ActionPlan.tsx
export default function ActionPlan() {
  const sampleData = [
  {
    issue: 'This is an issue that is created from the issue field while creating a new action plan.',
    description: 'This is an issue that is created from the issue field when creating a new plan.',
    deadline: 'May 10, 2025',
    status: 'Unresolved' as const,
    priority: 'High' as const,
    responsiblePeople: ['Alice', 'Bob', 'Cathy', 'Dan'],
  },
  {
    issue: 'This is an issue that is created from the issue field while creating a new action plan.',
    description: 'This is an issue that is created from the issue field when creating a new plan.',
    deadline: 'May 10, 2025',
    status: 'Resolved' as const,
    priority: 'Low' as const,
    responsiblePeople: ['Alice', 'Bob', 'Cathy', 'Dan'],
  },
];
  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Action Plan</h2>
        <Button type="primary">+ Add New</Button>
      </div>

      {sampleData.map((item, index) => (
        <ActionPlanCard key={index} {...item} />
      ))}
    </div>
  );
}
