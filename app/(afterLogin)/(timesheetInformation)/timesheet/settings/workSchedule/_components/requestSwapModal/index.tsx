'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, DatePicker, Input, Modal, Select } from 'antd';
import { useWorkScheduleUiStore } from '@/store/uistate/features/timesheet/workSchedule';
import {
  useGetEligibleSwapTargets,
  useGetMockEmployees,
  useGetShiftInstances,
} from '@/store/server/features/timesheet/workSchedule/queries';
import { useCreateSwapRequest } from '@/store/server/features/timesheet/workSchedule/mutation';
import {
  DATE_FORMAT,
  formatTimeRange,
} from '@/store/server/features/timesheet/workSchedule/helpers';
import { getEmployeeDisplayName } from '@/store/server/features/timesheet/workSchedule/mockService';
import dayjs, { Dayjs } from 'dayjs';
import { ShiftInstanceView } from '@/types/timesheet/workSchedule';

const EMPTY_INSTANCES: ShiftInstanceView[] = [];
const EMPTY_EMPLOYEES: NonNullable<
  ReturnType<typeof useGetMockEmployees>['data']
> = [];
const EMPTY_TARGETS: ShiftInstanceView[] = [];

const selectClassName =
  'w-full h-10 [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!min-h-10 [&_.ant-select-selector]:!py-0 [&_.ant-select-selector]:flex [&_.ant-select-selector]:items-center';

const shiftOptionLabel = (item: ShiftInstanceView) =>
  `${formatTimeRange(item.startTime, item.endTime)} · ${
    item.shiftName || item.blueprintTitle
  }`;

const RequestSwapModal = () => {
  const {
    isSwapModalOpen,
    selectedSwapRequesterShiftId,
    selectedSwapTargetShiftId,
    demoPersonaId,
    setSelectedSwapRequesterShiftId,
    closeSwapModal,
  } = useWorkScheduleUiStore();
  const { data: allInstancesData } = useGetShiftInstances({
    includeCancelled: true,
  });
  const allInstances = allInstancesData ?? EMPTY_INSTANCES;
  const { data: employeesData } = useGetMockEmployees();
  const employees = employeesData ?? EMPTY_EMPLOYEES;
  const { data: eligibleTargetsData, isLoading: isLoadingTargets } =
    useGetEligibleSwapTargets(selectedSwapRequesterShiftId);
  const eligibleTargets = eligibleTargetsData ?? EMPTY_TARGETS;
  const { mutate: createSwap, isLoading } = useCreateSwapRequest();

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [peerId, setPeerId] = useState<string | undefined>();
  const [targetShiftId, setTargetShiftId] = useState<string | undefined>();
  const [reason, setReason] = useState('');

  const today = dayjs().format(DATE_FORMAT);

  const mySwappableShifts = useMemo(() => {
    return allInstances
      .filter(
        (item) =>
          item.assignedUserId === demoPersonaId &&
          item.isSwappable &&
          !item.isCancelled &&
          item.date >= today,
      )
      .sort((a, b) => {
        const byDate = a.date.localeCompare(b.date);
        if (byDate !== 0) return byDate;
        return a.startTime.localeCompare(b.startTime);
      });
  }, [allInstances, demoPersonaId, today]);

  const availableDates = useMemo(() => {
    return new Set(mySwappableShifts.map((item) => item.date));
  }, [mySwappableShifts]);

  const shiftsOnSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const key = selectedDate.format(DATE_FORMAT);
    return mySwappableShifts.filter((item) => item.date === key);
  }, [mySwappableShifts, selectedDate]);

  const requesterShift = allInstances.find(
    (item) => item.id === selectedSwapRequesterShiftId,
  );

  useEffect(() => {
    if (!isSwapModalOpen) {
      setSelectedDate(null);
      setPeerId(undefined);
      setTargetShiftId(undefined);
      setReason('');
      return;
    }

    if (!selectedSwapRequesterShiftId) return;

    const preset = allInstances.find(
      (item) => item.id === selectedSwapRequesterShiftId,
    );
    if (preset) {
      setSelectedDate(dayjs(preset.date, DATE_FORMAT));
    }
  }, [isSwapModalOpen, selectedSwapRequesterShiftId, allInstances]);

  useEffect(() => {
    if (!isSwapModalOpen || !selectedSwapTargetShiftId) return;

    const presetTarget = eligibleTargets.find(
      (item) => item.id === selectedSwapTargetShiftId,
    );
    if (presetTarget) {
      setPeerId(presetTarget.assignedUserId);
      setTargetShiftId(presetTarget.id);
    } else {
      setTargetShiftId(selectedSwapTargetShiftId);
    }
  }, [isSwapModalOpen, selectedSwapTargetShiftId, eligibleTargets]);

  const peers = useMemo(() => {
    const ids = new Set(eligibleTargets.map((item) => item.assignedUserId));
    return employees.filter((item) => ids.has(item.id));
  }, [eligibleTargets, employees]);

  const peerShifts = eligibleTargets.filter(
    (item) => !peerId || item.assignedUserId === peerId,
  );

  const handleDateChange = (value: Dayjs | null) => {
    setSelectedDate(value);
    setSelectedSwapRequesterShiftId(null);
    setPeerId(undefined);
    setTargetShiftId(undefined);
  };

  const handleOwnShiftChange = (shiftId: string | undefined) => {
    setSelectedSwapRequesterShiftId(shiftId ?? null);
    setPeerId(undefined);
    setTargetShiftId(undefined);
  };

  const handleClose = () => {
    setSelectedDate(null);
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

  const hasRequesterShift = Boolean(selectedSwapRequesterShiftId);
  const requesterNotSwappable =
    hasRequesterShift && requesterShift && !requesterShift.isSwappable;

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
      {requesterNotSwappable ? (
        <p
          className="text-sm text-gray-500"
          data-cy="time-attendance-my-schedule-swap-not-allowed"
        >
          This shift is not swappable.
        </p>
      ) : mySwappableShifts.length === 0 ? (
        <p
          className="text-sm text-gray-500"
          data-cy="time-attendance-my-schedule-swap-empty-own"
        >
          No future swappable shifts found.
        </p>
      ) : (
        <div
          className="flex flex-col gap-3"
          data-cy="time-attendance-my-schedule-swap-form"
        >
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            data-cy="time-attendance-my-schedule-swap-row-own"
          >
            <div data-cy="time-attendance-my-schedule-swap-step-date">
              <p
                className="text-sm font-medium text-[#4d4d4d] mb-1.5"
                data-cy="time-attendance-my-schedule-swap-step-date-label"
              >
                Date
              </p>
              <DatePicker
                className="w-full h-10"
                value={selectedDate}
                format="ddd, MMM D, YYYY"
                placeholder="Select date"
                allowClear
                disabledDate={(current) =>
                  !current || !availableDates.has(current.format(DATE_FORMAT))
                }
                onChange={handleDateChange}
                data-cy="time-attendance-my-schedule-swap-date"
              />
            </div>

            <div data-cy="time-attendance-my-schedule-swap-step-own">
              <p
                className="text-sm font-medium text-[#4d4d4d] mb-1.5"
                data-cy="time-attendance-my-schedule-swap-step-own-label"
              >
                Your shift
              </p>
              <Select
                allowClear
                className={selectClassName}
                placeholder={
                  selectedDate ? 'Select your shift' : 'Select a date first'
                }
                disabled={!selectedDate}
                value={selectedSwapRequesterShiftId ?? undefined}
                onChange={handleOwnShiftChange}
                options={shiftsOnSelectedDate.map((item) => ({
                  value: item.id,
                  label: shiftOptionLabel(item),
                }))}
                data-cy="time-attendance-my-schedule-swap-own"
              />
            </div>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            data-cy="time-attendance-my-schedule-swap-row-peer"
          >
            <div data-cy="time-attendance-my-schedule-swap-step-peer">
              <p
                className="text-sm font-medium text-[#4d4d4d] mb-1.5"
                data-cy="time-attendance-my-schedule-swap-step-peer-label"
              >
                Peer
              </p>
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                className={selectClassName}
                placeholder={
                  hasRequesterShift ? 'Select peer' : 'Select your shift first'
                }
                disabled={!hasRequesterShift}
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
                className="text-sm font-medium text-[#4d4d4d] mb-1.5"
                data-cy="time-attendance-my-schedule-swap-step-shift-label"
              >
                Peer shift
              </p>
              <Select
                allowClear
                className={selectClassName}
                placeholder={
                  peerId
                    ? isLoadingTargets
                      ? 'Loading eligible shifts...'
                      : 'Select peer shift'
                    : 'Select a peer first'
                }
                disabled={!peerId || isLoadingTargets}
                value={targetShiftId}
                onChange={setTargetShiftId}
                notFoundContent={
                  !isLoadingTargets && peerShifts.length === 0
                    ? 'No eligible future swappable shifts found.'
                    : undefined
                }
                options={peerShifts.map((item) => ({
                  value: item.id,
                  label: `${dayjs(item.date).format('ddd, MMM D')} · ${shiftOptionLabel(item)}`,
                }))}
                data-cy="time-attendance-my-schedule-swap-target"
              />
            </div>
          </div>

          <div data-cy="time-attendance-my-schedule-swap-step-reason">
            <p
              className="text-sm font-medium text-[#4d4d4d] mb-1.5"
              data-cy="time-attendance-my-schedule-swap-step-reason-label"
            >
              Reason (optional)
            </p>
            <Input.TextArea
              rows={2}
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
