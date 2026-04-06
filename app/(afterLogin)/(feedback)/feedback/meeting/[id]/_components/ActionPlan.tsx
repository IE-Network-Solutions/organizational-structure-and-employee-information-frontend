import type { ReactNode } from 'react';
import { Button, Card, Spin } from 'antd';
import ActionPlanCard from './ActionPlanCard';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import AddActionPlanModal from './AddActionPlan';
import { useGetMeetingActionPlan } from '@/store/server/features/CFR/meeting/action-plan/queries';

interface ActionPlanProps {
  meetingId: string;
  loading: boolean;
  canEdit: boolean;
  /** Same shell as Agenda / Attendees on meeting detail panel. */
  variant?: 'default' | 'panel';
}

export default function ActionPlan({
  meetingId,
  loading: meetingLoading,
  canEdit,
  variant = 'default',
}: ActionPlanProps) {
  const { data: meetingActionPlan, isLoading } =
    useGetMeetingActionPlan(meetingId);
  const { openAddActionPlan, setOpenAddActionPlan } = useMeetingStore();

  const items = meetingActionPlan?.items ?? [];
  const hasItems = items.length > 0;
  const showLoading = meetingLoading || isLoading;

  const actionPlanModal = (
    <AddActionPlanModal
      meetingId={meetingId}
      visible={openAddActionPlan}
      onClose={() => setOpenAddActionPlan(false)}
      data-cy="feedback-meeting-components-actionplan-modal"
    />
  );

  if (variant === 'panel') {
    const panelFixedHeight = !hasItems;
    const panelShellClass = [
      'box-border flex w-full max-w-full min-w-0 shrink-0 flex-col gap-[9px] rounded-[8px] border border-solid border-[#D9D9D9] bg-white pt-2 pr-3 pb-2 pl-3 opacity-100',
      panelFixedHeight ? 'h-[81px] overflow-hidden' : 'min-h-[81px]',
    ].join(' ');

    let panelBody: ReactNode;
    if (showLoading) {
      panelBody = (
        <div
          className="flex min-h-0 flex-1 items-center justify-center"
          data-cy="feedback-meeting-actionplan-panel-loading"
        >
          <Spin
            size="small"
            data-cy="feedback-meeting-components-actionplan-spin"
          />
        </div>
      );
    } else if (!hasItems) {
      panelBody = (
        <div
          className="flex min-h-0 flex-1 flex-col items-center justify-center px-1"
          data-cy="feedback-meeting-actionplan-panel-empty-wrap"
        >
          <p
            className="m-0 text-center text-[14px] font-bold text-black/70"
            data-cy="feedback-meeting-components-actionplan-div-empty"
            id="feedback-meeting-components-actionplan-div-empty"
          >
            You have no action plans
          </p>
        </div>
      );
    } else {
      panelBody = (
        <div
          className="flex min-h-0 flex-1 flex-col gap-[9px] overflow-y-auto scrollbar-none"
          data-cy="feedback-meeting-components-actionplan-div-list"
          id="feedback-meeting-components-actionplan-div-list"
        >
          {items.map((item: any, index: number) => (
            <ActionPlanCard
              canEdit={canEdit}
              key={item.id ?? index}
              {...item}
              data-cy={`feedback-meeting-components-actionplan-item-${index}`}
              id={`feedback-meeting-components-actionplan-item-${index}`}
            />
          ))}
        </div>
      );
    }

    return (
      <>
        <div
          className={panelShellClass}
          data-cy="feedback-meeting-action-plan-panel"
          id="feedback-meeting-action-plan-panel"
        >
          <div
            className="flex h-[24px] w-full shrink-0 items-center justify-between"
            data-cy="feedback-meeting-actionplan-panel-header-row"
          >
            <h2
              className="m-0 text-[14px] font-normal leading-none text-black"
              data-cy="feedback-meeting-components-actionplan-heading"
              id="feedback-meeting-components-actionplan-heading"
            >
              Action Plan
            </h2>
            {canEdit ? (
              <Button
                type="primary"
                size="small"
                onClick={() => setOpenAddActionPlan(true)}
                className="box-border inline-flex !h-[22px] min-h-0 min-w-[52px] items-center justify-center rounded-md px-3 py-0 text-xs font-normal leading-none shadow-none"
                data-cy="feedback-meeting-components-actionplan-button-add"
                id="feedback-meeting-components-actionplan-button-add"
              >
                Create
              </Button>
            ) : null}
          </div>
          {panelBody}
        </div>
        {actionPlanModal}
      </>
    );
  }

  return (
    <Card
      bodyStyle={{ padding: 0 }}
      loading={showLoading}
      className="border-none p-0 shadow-none"
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
        {!showLoading && items.length <= 0 ? (
          <div
            className="text-center text-xl font-bold text-black/70"
            data-cy="feedback-meeting-components-actionplan-div-empty"
            id="feedback-meeting-components-actionplan-div-empty"
          >
            You have no action plans
          </div>
        ) : !showLoading ? (
          items.map((item: any, index: number) => (
            <ActionPlanCard
              canEdit={canEdit}
              key={item.id ?? index}
              {...item}
              data-cy={`feedback-meeting-components-actionplan-item-${index}`}
              id={`feedback-meeting-components-actionplan-item-${index}`}
            />
          ))
        ) : null}

        {actionPlanModal}
      </div>
    </Card>
  );
}
