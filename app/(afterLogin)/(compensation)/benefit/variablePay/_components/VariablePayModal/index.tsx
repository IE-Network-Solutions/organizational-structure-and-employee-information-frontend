'use client';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useSendToPayroll } from '@/store/server/features/payroll/payroll/mutation';
import {
  useFetchActiveFiscalYearPayPeriods,
  useGetActiveMonth,
  useGetMonthById,
  useGetPayPeriod,
  useGetSessionById,
} from '@/store/server/features/payroll/payroll/queries';
import { useVariablePayStore } from '@/store/uistate/features/compensation/benefit';
import { Modal, Select } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';

interface ModalProps {
  data: any;
}

const formatDateRange = (start?: string, end?: string) => {
  if (!start || !end) return null;
  return `${dayjs(start).format('MMM DD, YYYY')} — ${dayjs(end).format('MMM DD, YYYY')}`;
};

const VariablePayModal: React.FC<ModalProps> = ({ data }) => {
  const { openModal, setOpenModal, searchParams } = useVariablePayStore();
  const [selectedPayPeriodId, setSelectedPayPeriodId] = useState<string>();

  const { data: activeCalender } = useGetActiveFiscalYears();
  const { data: activeMonth } = useGetActiveMonth();
  const { data: payPeriodData } = useGetPayPeriod();
  const { data: activePayPeriod } = useFetchActiveFiscalYearPayPeriods(
    activeCalender?.id,
  );
  const { mutate: sendToPayroll, isLoading: isSending } = useSendToPayroll();

  // Match table month resolution (including active-month fallback)
  const selectedMonthIds = useMemo(() => {
    if (
      typeof searchParams?.selectedMonth === 'string' &&
      searchParams.selectedMonth
    ) {
      return searchParams.selectedMonth.split(',').filter(Boolean);
    }
    if (
      Array.isArray(searchParams?.selectedMonth) &&
      searchParams.selectedMonth.length > 0
    ) {
      const fromObjects = searchParams.selectedMonth
        .map((month: any) =>
          typeof month === 'string' ? month : month?.id || month?.active?.id,
        )
        .filter(Boolean);
      if (fromObjects.length > 0) return fromObjects;
    }
    return activeMonth?.id ? [activeMonth.id] : [];
  }, [searchParams?.selectedMonth, activeMonth?.id]);

  const resolvedMonthId = selectedMonthIds[0] || '';

  const appliedSessionId = useMemo(() => {
    if (
      typeof searchParams?.selectedSession === 'string' &&
      searchParams.selectedSession
    ) {
      return searchParams.selectedSession;
    }
    return (
      activeCalender?.sessions?.find((session: any) => session.active)?.id ||
      activeCalender?.sessions?.[0]?.id ||
      ''
    );
  }, [searchParams?.selectedSession, activeCalender?.sessions]);

  const { data: monthById } = useGetMonthById(resolvedMonthId as any);
  const { data: sessionById } = useGetSessionById(appliedSessionId as any);

  const monthFromCalendar = useMemo(() => {
    if (!resolvedMonthId || !activeCalender?.sessions) return null;
    for (const session of activeCalender.sessions) {
      const month = session?.months?.find(
        (m: any) => m.id === resolvedMonthId,
      );
      if (month) return month;
    }
    return null;
  }, [resolvedMonthId, activeCalender?.sessions]);

  const sessionFromCalendar = useMemo(() => {
    if (!appliedSessionId || !activeCalender?.sessions) return null;
    return (
      activeCalender.sessions.find((s: any) => s.id === appliedSessionId) ||
      null
    );
  }, [appliedSessionId, activeCalender?.sessions]);

  const vpMonthName =
    monthById?.name || monthFromCalendar?.name || activeMonth?.name;
  const vpMonthRange = formatDateRange(
    monthById?.startDate || monthFromCalendar?.startDate,
    monthById?.endDate || monthFromCalendar?.endDate,
  );
  const sessionName =
    sessionById?.name || sessionFromCalendar?.name;
  const sessionRange = formatDateRange(
    sessionById?.startDate || sessionFromCalendar?.startDate,
    sessionById?.endDate || sessionFromCalendar?.endDate,
  );

  const employeeCount = Array.isArray(data) ? data.length : 0;
  const canSend = Boolean(selectedPayPeriodId) && employeeCount > 0;

  useEffect(() => {
    if (!openModal) return;
    setSelectedPayPeriodId(
      activePayPeriod?.id ||
        payPeriodData?.find((p: any) => p.status === 'OPEN')?.id ||
        payPeriodData?.[0]?.id,
    );
  }, [openModal, activePayPeriod?.id, payPeriodData]);

  const handleClose = () => {
    setOpenModal(false);
    setSelectedPayPeriodId(undefined);
  };

  const handleSubmit = () => {
    if (!canSend) return;

    const variablePayData = data?.map(
      ({
        userId,
        VpInPercentile: vpInPercentile,
        VpScore: vpScore,
      }: {
        userId: string;
        VpInPercentile: number;
        VpScore: string;
      }) => ({
        userId: userId,
        totalPercentage: vpInPercentile,
        vpScore: (+vpScore).toFixed(2),
      }),
    );

    sendToPayroll(
      {
        payPeriodId: selectedPayPeriodId,
        variablePayData,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  };

  return (
    <Modal
      data-cy="compensation-benefit-variable-pay-modal"
      title="Send to payroll"
      centered
      open={openModal}
      onCancel={handleClose}
      okText="Send"
      onOk={handleSubmit}
      okButtonProps={{
        disabled: !canSend,
        loading: isSending,
      }}
      data-testid="variable-pay-modal"
    >
      <div
        data-testid="variable-pay-modal-content"
        id="compensation-benefit-variable-pay-modal-content"
        data-cy="compensation-benefit-variable-pay-modal-content"
      >
        Are you sure to send the below information to payroll?
        <div
          className="m-2"
          data-testid="variable-pay-modal-details"
          id="compensation-benefit-variable-pay-modal-details"
          data-cy="compensation-benefit-variable-pay-modal-details"
        >
          <div
            className="my-3"
            data-testid="pay-period-info"
            id="compensation-benefit-variable-pay-modal-pay-period"
            data-cy="compensation-benefit-variable-pay-modal-pay-period"
          >
            <label
              id="compensation-benefit-variable-pay-modal-pay-period-label"
              data-cy="compensation-benefit-variable-pay-modal-pay-period-label"
              className="mb-1 block font-semibold"
            >
              Pay Period
            </label>
            <Select
              className="w-full"
              placeholder="Select pay period"
              value={selectedPayPeriodId}
              onChange={setSelectedPayPeriodId}
              allowClear
              data-cy="compensation-benefit-variable-pay-modal-pay-period-select"
              options={payPeriodData?.map((period: any) => ({
                value: period.id,
                label: formatDateRange(period.startDate, period.endDate),
              }))}
            />
          </div>

          <div
            className="flex items-start justify-start my-2"
            data-testid="month-range-info"
            id="compensation-benefit-variable-pay-modal-month-range"
            data-cy="compensation-benefit-variable-pay-modal-month-range"
          >
            <span
              id="compensation-benefit-variable-pay-modal-month-range-label"
              data-cy="compensation-benefit-variable-pay-modal-month-range-label"
              className="font-semibold shrink-0"
            >
              VP Month:{' '}
            </span>
            <span
              data-testid="month-range-dates"
              id="compensation-benefit-variable-pay-modal-month-range-dates"
              data-cy="compensation-benefit-variable-pay-modal-month-range-dates"
            >
              {vpMonthName || vpMonthRange ? (
                <>
                  {vpMonthName || 'Selected month'}
                  {vpMonthRange ? ` (${vpMonthRange})` : ''}
                </>
              ) : (
                'Month not selected'
              )}
            </span>
          </div>

          <div
            className="flex items-start justify-start my-2"
            data-testid="session-info"
            id="compensation-benefit-variable-pay-modal-session"
            data-cy="compensation-benefit-variable-pay-modal-session"
          >
            <span
              id="compensation-benefit-variable-pay-modal-session-label"
              data-cy="compensation-benefit-variable-pay-modal-session-label"
              className="font-semibold shrink-0"
            >
              Session:{' '}
            </span>
            <span
              data-testid="session-dates"
              id="compensation-benefit-variable-pay-modal-session-dates"
              data-cy="compensation-benefit-variable-pay-modal-session-dates"
            >
              {sessionName || sessionRange ? (
                <>
                  {sessionName || 'Selected session'}
                  {sessionRange ? ` (${sessionRange})` : ''}
                </>
              ) : (
                'Session not selected'
              )}
            </span>
          </div>

          <div
            className="flex items-center justify-start my-2"
            data-cy="compensation-benefit-variable-pay-modal-employee-count"
          >
            <span className="font-semibold">Employees to send: </span>
            <span className="ml-1">{employeeCount}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default VariablePayModal;
