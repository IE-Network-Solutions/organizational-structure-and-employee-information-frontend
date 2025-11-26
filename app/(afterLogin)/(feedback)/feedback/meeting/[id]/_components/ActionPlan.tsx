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
}

export default function ActionPlan({
  meetingId,
  loading,
  canEdit,
}: ActionPlanProps) {
  const { data: meetingActionPlan, isLoading } =
    useGetMeetingActionPlan(meetingId);
  const { openAddActionPlan, setOpenAddActionPlan } = useMeetingStore();
  return (
    <Card
      bodyStyle={{ padding: 0 }}
      loading={loading || isLoading}
      className="border-none p-4"
      data-cy="feedback-meeting-components-actionplan-card"
      id="feedback-meeting-components-actionplan-card"
    >
      <div
        className="space-y-4"
        data-cy="feedback-meeting-components-actionplan-div"
        id="feedback-meeting-components-actionplan-div"
      >
        <div
          className="flex justify-between items-center"
          data-cy="feedback-meeting-components-actionplan-div-header"
          id="feedback-meeting-components-actionplan-div-header"
        >
          <h2
            className="text-lg font-semibold"
            data-cy="feedback-meeting-components-actionplan-heading"
            id="feedback-meeting-components-actionplan-heading"
          >
            Action Plan
          </h2>
          {canEdit && (
            <Button
              onClick={() => setOpenAddActionPlan(true)}
              type="default"
              className="h-10"
              data-cy="feedback-meeting-components-actionplan-button-add"
              id="feedback-meeting-components-actionplan-button-add"
            >
              + Add New
            </Button>
          )}
        </div>
        {meetingActionPlan?.items?.length <= 0 ? (
          <div
            className="text-center text-xl font-bold text-[#687588]"
            data-cy="feedback-meeting-components-actionplan-div-empty"
            id="feedback-meeting-components-actionplan-div-empty"
          >
            You have no action plans
          </div>
        ) : (
          meetingActionPlan?.items.map((item: any, index: number) => (
            <ActionPlanCard canEdit={canEdit} key={index} {...item} data-cy={`feedback-meeting-components-actionplan-item-${index}`} id={`feedback-meeting-components-actionplan-item-${index}`} />
          ))
        )}

        <AddActionPlanDrawer
          meetingId={meetingId}
          visible={openAddActionPlan}
          onClose={() => setOpenAddActionPlan(false)}
          data-cy="feedback-meeting-components-actionplan-drawer"
        />
      </div>
    </Card>
  );
}
