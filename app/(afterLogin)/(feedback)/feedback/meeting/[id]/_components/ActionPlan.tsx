import { Button, Card } from 'antd';
import ActionPlanCard from './ActionPlanCard';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import AddActionPlanDrawer from './AddActionPlan';
import { useGetMeetingActionPlan } from '@/store/server/features/CFR/meeting/action-plan/queries';
// import { useGetMeetingActionPlan } from '@/store/server/features/CFR/meeting/queries';

// components/MeetingDetail/ActionPlan.tsx
interface ActionPlanProps {
  meetingId: string; // Replace 'any' with the actual type if available
  loading: boolean;
  canEdit: boolean;
  meeting: any;
}

export default function ActionPlan({
  meetingId,
  loading,
  canEdit,
  meeting,
}: ActionPlanProps) {
  const { data: meetingActionPlan, isLoading } =
    useGetMeetingActionPlan(meetingId);
  const { openAddActionPlan, setOpenAddActionPlan } = useMeetingStore();
  return (
    <Card
      bodyStyle={{ padding: 0 }}
      loading={loading || isLoading}
      className="border-none p-4"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Action Plan</h2>
          {canEdit && (
            <Button onClick={() => setOpenAddActionPlan(true)} type="default">
              + Add New
            </Button>
          )}
        </div>
        {meeting?.actionPlans?.length <= 0 ? (
          <div className="text-center text-xl font-semibold">
            No Action Plan for This Meeting
          </div>
        ) : (
          meetingActionPlan?.items.map((item: any, index: number) => (
            <ActionPlanCard canEdit={canEdit} key={index} {...item} />
          ))
        )}

        <AddActionPlanDrawer
          meetingId={meetingId}
          visible={openAddActionPlan}
          onClose={() => setOpenAddActionPlan(false)}
        />
      </div>
    </Card>
  );
}
