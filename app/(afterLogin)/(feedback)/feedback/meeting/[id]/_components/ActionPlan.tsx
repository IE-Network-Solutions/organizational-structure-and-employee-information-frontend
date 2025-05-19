import { Button } from "antd";
import ActionPlanCard from "./ActionPlanCard";
import { useMeetingStore } from "@/store/uistate/features/conversation/meeting";
import AddActionPlanDrawer from "./AddActionPlan";

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
    deadline: '2025-5-18',
    status: 'Resolved' as const,
    priority: 'Low' as const,
    responsiblePeople: ['Alice', 'Bob', 'Cathy', 'Dan'],
  },
];
const {openAddActionPlan,setOpenAddActionPlan,
setActionPlanData}=useMeetingStore();

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Action Plan</h2>
        <Button onClick={()=>setOpenAddActionPlan(true)} type="primary">+ Add New</Button>
      </div>

      {sampleData.map((item, index) => (
        <ActionPlanCard key={index} {...item} />
      ))}
      <AddActionPlanDrawer visible={openAddActionPlan} onClose={()=>setOpenAddActionPlan(false)} />
    </div>
  );
}
