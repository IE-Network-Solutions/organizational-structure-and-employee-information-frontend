'use client';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useSendToPayroll } from '@/store/server/features/payroll/payroll/mutation';
import {
  useFetchActiveFiscalYearPayPeriods,
  useGetActiveMonth,
  useGetPayPeriod,
  useGetVariablePay,
} from '@/store/server/features/payroll/payroll/queries';
import { useVariablePayStore } from '@/store/uistate/features/compensation/benefit';
import { Modal, Select, Spin } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';

const formatDateRange = (start?: string, end?: string) => {
  if (!start || !end) return null;
  return `${dayjs(start).format('MMM DD, YYYY')} — ${dayjs(end).format('MMM DD, YYYY')}`;
};

const resolveInitialMonthId = (
  searchParams: { selectedMonth?: string | any[] },
  activeMonthId?: string,
) => {
  if (
    typeof searchParams?.selectedMonth === 'string' &&
    searchParams.selectedMonth
  ) {
    return searchParams.selectedMonth.split(',').filter(Boolean)[0] || '';
  }
  if (
    Array.isArray(searchParams?.selectedMonth) &&
    searchParams.selectedMonth.length > 0
  ) {
    const first = searchParams.selectedMonth[0];
    if (typeof first === 'string') return first;
    return first?.id || first?.active?.id || '';
  }
  return activeMonthId || '';
};

const resolveSessionIdForMonth = (
  sessions: any[] | undefined,
  monthId: string,
  fallbackSessionId?: string,
) => {
  if (monthId && sessions?.length) {
    const match = sessions.find((session: any) =>
      session?.months?.some((month: any) => month?.id === monthId),
    );
    if (match?.id) return match.id;
  }
  return fallbackSessionId || '';
};

const VariablePayModal: React.FC = () => {
  const { openModal, setOpenModal, searchParams } = useVariablePayStore();
  const [selectedPayPeriodId, setSelectedPayPeriodId] = useState<string>();
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [selectedMonthId, setSelectedMonthId] = useState<string>('');

  const { data: activeCalender } = useGetActiveFiscalYears();
  const { data: activeMonth } = useGetActiveMonth();
  const { data: payPeriodData } = useGetPayPeriod();
  const { data: activePayPeriod } = useFetchActiveFiscalYearPayPeriods(
    activeCalender?.id,
  );
  const { mutate: sendToPayroll, isLoading: isSending } = useSendToPayroll();

  const sessionOptions = useMemo(
    () =>
      activeCalender?.sessions?.map((session: any) => ({
        label: session?.name,
        value: session?.id,
        months: session?.months || [],
        startDate: session?.startDate,
        endDate: session?.endDate,
      })) || [],
    [activeCalender?.sessions],
  );

  const selectedSession = sessionOptions.find(
    (session) => session.value === selectedSessionId,
  );

  const monthOptions = useMemo<
    {
      label: string;
      value: string;
      startDate?: string;
      endDate?: string;
    }[]
  >(
    () =>
      selectedSession?.months?.map((month: any) => ({
        label: month?.name,
        value: month?.id,
        startDate: month?.startDate,
        endDate: month?.endDate,
      })) || [],
    [selectedSession?.months],
  );

  const selectedMonth = monthOptions.find(
    (month) => month.value === selectedMonthId,
  );

  const variablePayFilterPayload = useMemo(
    () => ({
      monthIds: selectedMonthId ? [selectedMonthId] : [],
    }),
    [selectedMonthId],
  );

  const { data: monthVariablePay, isFetching: isFetchingVp } =
    useGetVariablePay(variablePayFilterPayload, { enabled: openModal });

  const employeesToSend = useMemo(() => {
    if (!selectedMonthId || !Array.isArray(monthVariablePay?.items)) return [];
    return monthVariablePay.items.map((variablePay: any) => ({
      userId: variablePay?.userId,
      totalPercentage: variablePay?.vpScoring?.totalPercentage,
      vpScore: (+variablePay?.vpScore || 0).toFixed(2),
    }));
  }, [monthVariablePay?.items, selectedMonthId]);

  const employeeCount = employeesToSend.length;
  const canSend =
    Boolean(selectedPayPeriodId) &&
    Boolean(selectedMonthId) &&
    employeeCount > 0 &&
    !isFetchingVp;

  useEffect(() => {
    if (!openModal) return;

    const initialMonthId = resolveInitialMonthId(searchParams, activeMonth?.id);
    const fallbackSessionId =
      (typeof searchParams?.selectedSession === 'string' &&
        searchParams.selectedSession) ||
      activeCalender?.sessions?.find((session: any) => session.active)?.id ||
      activeCalender?.sessions?.[0]?.id ||
      '';

    setSelectedMonthId(initialMonthId);
    setSelectedSessionId(
      resolveSessionIdForMonth(
        activeCalender?.sessions,
        initialMonthId,
        fallbackSessionId,
      ),
    );
    setSelectedPayPeriodId(
      activePayPeriod?.id ||
        payPeriodData?.find((p: any) => p.status === 'OPEN')?.id ||
        payPeriodData?.[0]?.id,
    );
  }, [
    openModal,
    searchParams,
    activeMonth?.id,
    activeCalender?.sessions,
    activePayPeriod?.id,
    payPeriodData,
  ]);

  const handleClose = () => {
    setOpenModal(false);
    setSelectedPayPeriodId(undefined);
    setSelectedSessionId('');
    setSelectedMonthId('');
  };

  const handleSessionChange = (sessionId?: string) => {
    setSelectedSessionId(sessionId || '');
    setSelectedMonthId('');
  };

  const handleSubmit = () => {
    if (!canSend) return;

    sendToPayroll(
      {
        payPeriodId: selectedPayPeriodId,
        variablePayData: employeesToSend,
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
            className="my-3"
            data-testid="session-info"
            id="compensation-benefit-variable-pay-modal-session"
            data-cy="compensation-benefit-variable-pay-modal-session"
          >
            <label
              id="compensation-benefit-variable-pay-modal-session-label"
              data-cy="compensation-benefit-variable-pay-modal-session-label"
              className="mb-1 block font-semibold"
            >
              Session
            </label>
            <Select
              className="w-full"
              placeholder="Select session"
              value={selectedSessionId || undefined}
              onChange={handleSessionChange}
              allowClear
              data-cy="compensation-benefit-variable-pay-modal-session-select"
              options={sessionOptions.map((session) => ({
                value: session.value,
                label: session.startDate
                  ? `${session.label} (${formatDateRange(session.startDate, session.endDate)})`
                  : session.label,
              }))}
            />
          </div>

          <div
            className="my-3"
            data-testid="month-range-info"
            id="compensation-benefit-variable-pay-modal-month-range"
            data-cy="compensation-benefit-variable-pay-modal-month-range"
          >
            <label
              id="compensation-benefit-variable-pay-modal-month-range-label"
              data-cy="compensation-benefit-variable-pay-modal-month-range-label"
              className="mb-1 block font-semibold"
            >
              VP Month
            </label>
            <Select
              className="w-full"
              placeholder="Select month"
              value={selectedMonthId || undefined}
              onChange={(value) => setSelectedMonthId(value || '')}
              allowClear
              disabled={!selectedSessionId}
              data-cy="compensation-benefit-variable-pay-modal-month-select"
              options={monthOptions.map((month) => ({
                value: month.value,
                label: month.startDate
                  ? `${month.label} (${formatDateRange(month.startDate, month.endDate)})`
                  : month.label,
              }))}
            />
            {selectedMonth?.startDate ? (
              <p
                className="mt-1 mb-0 text-xs text-gray-500"
                data-cy="compensation-benefit-variable-pay-modal-month-range-dates"
              >
                {formatDateRange(
                  selectedMonth.startDate,
                  selectedMonth.endDate,
                )}
              </p>
            ) : null}
          </div>

          <div
            className="flex items-center justify-start my-2"
            data-cy="compensation-benefit-variable-pay-modal-employee-count"
          >
            <span
              className="font-semibold"
              data-cy="compensation-benefit-variable-pay-modal-employee-count-label"
            >
              Employees to send:{' '}
            </span>
            {isFetchingVp && selectedMonthId ? (
              <Spin
                size="small"
                className="ml-2"
                data-cy="compensation-benefit-variable-pay-modal-employee-count-loading"
              />
            ) : (
              <span
                className="ml-1"
                data-cy="compensation-benefit-variable-pay-modal-employee-count-value"
              >
                {employeeCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default VariablePayModal;
