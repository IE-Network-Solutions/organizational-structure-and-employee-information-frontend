'use client';

import { useMemo, useState } from 'react';
import { Button, Input, Modal, Select } from 'antd';
import { useWorkScheduleUiStore } from '@/store/uistate/features/timesheet/workSchedule';
import {
  useGetEligibleSwapTargets,
  useGetMockEmployees,
  useGetShiftInstances,
} from '@/store/server/features/timesheet/workSchedule/queries';
import { useCreateSwapRequest } from '@/store/server/features/timesheet/workSchedule/mutation';
import { formatTimeRange } from '@/store/server/features/timesheet/workSchedule/helpers';
import { getEmployeeDisplayName } from '@/store/server/features/timesheet/workSchedule/mockService';
import ShiftCard from '../shiftCard';
import dayjs from 'dayjs';

const RequestSwapModal = () => {
  const { isSwapModalOpen, selectedSwapRequesterShiftId, closeSwapModal } =
    useWorkScheduleUiStore();
  const { data: allInstances = [] } = useGetShiftInstances({
    includeCancelled: true,
  });
  const { data: employees = [] } = useGetMockEmployees();
  const { data: eligibleTargets = [], isLoading: isLoadingTargets } =
    useGetEligibleSwapTargets(selectedSwapRequesterShiftId);
  const { mutate: createSwap, isLoading } = useCreateSwapRequest();

  const [peerId, setPeerId] = useState<string | undefined>();
  const [targetShiftId, setTargetShiftId] = useState<string | undefined>();
  const [reason, setReason] = useState('');

  const requesterShift = allInstances.find(
    (item) => item.id === selectedSwapRequesterShiftId,
  );

  const peers = useMemo(() => {
    const ids = new Set(eligibleTargets.map((item) => item.assignedUserId));
    return employees.filter((item) => ids.has(item.id));
  }, [eligibleTargets, employees]);

  const peerShifts = eligibleTargets.filter(
    (item) => !peerId || item.assignedUserId === peerId,
  );

  const handleClose = () => {
    setPeerId(undefined);
    setTargetShiftId(undefined);
    setReason('');
    closeSwapModal();
  };

  const handleSubmit = () => {
    if (!selectedSwapRequesterShiftId || !targetShiftId) return;
    createSwap(
      {
        requesterShiftId: selectedSwapRequesterShiftId,
        targetShiftId,
        reason: reason.trim() || undefined,
      },
      { onSuccess: handleClose },
    );
  };

  return (
    <Modal
      open={isSwapModalOpen}
      onCancel={handleClose}
      width={640}
      centered
      destroyOnClose
      title={
        <div data-cy="time-attendance-my-schedule-swap-modal-header">
          <p
            className="mb-0 text-lg font-semibold text-[#4d4d4d]"
            data-cy="time-attendance-my-schedule-swap-modal-title"
          >
            Request shift swap
          </p>
          {requesterShift && (
            <p
              className="mb-0 text-sm text-gray-500 font-normal"
              data-cy="time-attendance-my-schedule-swap-modal-subtitle"
            >
              Swapping: {dayjs(requesterShift.date).format('ddd, MMM D')} (
              {formatTimeRange(
                requesterShift.startTime,
                requesterShift.endTime,
              )}
              )
            </p>
          )}
        </div>
      }
      footer={
        <div
          className="flex justify-end gap-3"
          data-cy="time-attendance-my-schedule-swap-modal-footer"
        >
          <Button className="h-10" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="primary"
            className="h-10"
            loading={isLoading}
            disabled={!targetShiftId}
            onClick={handleSubmit}
            data-cy="time-attendance-my-schedule-swap-submit"
          >
            Send Request
          </Button>
        </div>
      }
      data-cy="time-attendance-my-schedule-swap-modal"
    >
      {!requesterShift?.isSwappable ? (
        <p
          className="text-sm text-gray-500"
          data-cy="time-attendance-my-schedule-swap-not-allowed"
        >
          This shift is not swappable.
        </p>
      ) : (
        <div
          className="flex flex-col gap-4"
          data-cy="time-attendance-my-schedule-swap-form"
        >
          <div data-cy="time-attendance-my-schedule-swap-step-peer">
            <p
              className="text-sm font-medium text-[#4d4d4d] mb-2"
              data-cy="time-attendance-my-schedule-swap-step-peer-label"
            >
              Step 1 · Select peer
            </p>
            <Select
              allowClear
              placeholder="Search mock peer"
              className="w-full"
              value={peerId}
              onChange={(value) => {
                setPeerId(value);
                setTargetShiftId(undefined);
              }}
              options={peers.map((item) => ({
                value: item.id,
                label: `${getEmployeeDisplayName(item)} · ${item.jobTitle}`,
              }))}
              data-cy="time-attendance-my-schedule-swap-peer"
            />
          </div>
          <div data-cy="time-attendance-my-schedule-swap-step-shift">
            <p
              className="text-sm font-medium text-[#4d4d4d] mb-2"
              data-cy="time-attendance-my-schedule-swap-step-shift-label"
            >
              Step 2 · Select target peer shift
            </p>
            {isLoadingTargets && (
              <p
                className="text-sm text-gray-500"
                data-cy="time-attendance-my-schedule-swap-loading"
              >
                Loading eligible shifts...
              </p>
            )}
            {!isLoadingTargets && peerShifts.length === 0 && (
              <p
                className="text-sm text-gray-500"
                data-cy="time-attendance-my-schedule-swap-empty-targets"
              >
                No eligible future swappable shifts found.
              </p>
            )}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-auto"
              data-cy="time-attendance-my-schedule-swap-target-list"
            >
              {peerShifts.map((item) => (
                <div
                  key={item.id}
                  className={
                    targetShiftId === item.id
                      ? 'ring-2 ring-primary rounded-lg'
                      : ''
                  }
                  onClick={() => setTargetShiftId(item.id)}
                  data-cy={`time-attendance-my-schedule-swap-target-${item.id}`}
                >
                  <ShiftCard instance={item} showEmployee />
                </div>
              ))}
            </div>
          </div>
          <div data-cy="time-attendance-my-schedule-swap-step-reason">
            <p
              className="text-sm font-medium text-[#4d4d4d] mb-2"
              data-cy="time-attendance-my-schedule-swap-step-reason-label"
            >
              Step 3 · Reason (optional)
            </p>
            <Input.TextArea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why do you want to swap?"
              data-cy="time-attendance-my-schedule-swap-reason"
            />
          </div>
        </div>
      )}
    </Modal>
  );
};

export default RequestSwapModal;
