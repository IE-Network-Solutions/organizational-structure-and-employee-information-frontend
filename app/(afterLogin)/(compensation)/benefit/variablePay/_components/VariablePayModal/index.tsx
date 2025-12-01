'use client';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useSendToPayroll } from '@/store/server/features/payroll/payroll/mutation';
import {
  useFetchActiveFiscalYearPayPeriods,
  useGetMonthById,
  useGetSessionById,
} from '@/store/server/features/payroll/payroll/queries';
import { useVariablePayStore } from '@/store/uistate/features/compensation/benefit';
import { Modal } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

interface ModalProps {
  data: any;
}

const VariablePayModal: React.FC<ModalProps> = ({ data }) => {
  const { openModal, setOpenModal, searchParams } = useVariablePayStore();
  const handleClose = () => {
    setOpenModal(false);
  };
  const { data: activeCalender } = useGetActiveFiscalYears();

  const { data: activePayPeriod } = useFetchActiveFiscalYearPayPeriods(
    activeCalender?.id,
  );

  const { mutate: sendToPayroll } = useSendToPayroll();

  const activeMonthId = Array.isArray(searchParams?.selectedMonth)
    ? searchParams.selectedMonth.find((month) => month?.active)?.id ||
      searchParams.selectedMonth[0]?.id
    : searchParams?.selectedMonth;

  const { data: monthById } = useGetMonthById(activeMonthId || '');
  const { data: sessionById } = useGetSessionById(
    searchParams?.selectedSession || '',
  );

  const handleSubmit = () => {
    const payPeriodId = activePayPeriod?.id;

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

    const mergedData = {
      payPeriodId,
      variablePayData,
    };

    sendToPayroll(mergedData);
    setOpenModal(false);
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
              className="flex items-center justify-start my-2"
              data-testid="pay-period-info"
              id="compensation-benefit-variable-pay-modal-pay-period"
              data-cy="compensation-benefit-variable-pay-modal-pay-period"
            >
              <span id="compensation-benefit-variable-pay-modal-pay-period-label" data-cy="compensation-benefit-variable-pay-modal-pay-period-label" className="font-semibold">Active Pay Period: </span>
              <span
                data-testid="pay-period-dates"
                id="compensation-benefit-variable-pay-modal-pay-period-dates"
                data-cy="compensation-benefit-variable-pay-modal-pay-period-dates"
              >
                {' '}
                {activePayPeriod
                  ? ` ${dayjs(activePayPeriod?.startDate).format('MMM DD, YYYY')} — ${dayjs(activePayPeriod?.endDate).format('MMM DD, YYYY')}`
                  : 'No Active pay period'}
              </span>
            </div>
            <div
              className="flex items-center justify-start my-2"
              data-testid="month-range-info"
              id="compensation-benefit-variable-pay-modal-month-range"
              data-cy="compensation-benefit-variable-pay-modal-month-range"
            >
              <span id="compensation-benefit-variable-pay-modal-month-range-label" data-cy="compensation-benefit-variable-pay-modal-month-range-label" className="font-semibold">Selected Month Range: </span>
              <span
                data-testid="month-range-dates"
                id="compensation-benefit-variable-pay-modal-month-range-dates"
                data-cy="compensation-benefit-variable-pay-modal-month-range-dates"
              >
                {monthById
                  ? ` ${dayjs(monthById?.startDate).format('MMM DD, YYYY')} — ${dayjs(monthById?.endDate).format('MMM DD, YYYY')}`
                  : 'Month not selected'}
              </span>
            </div>
            <div
              className="flex items-center justify-start my-2"
              data-testid="session-info"
              id="compensation-benefit-variable-pay-modal-session"
              data-cy="compensation-benefit-variable-pay-modal-session"
            >
              <span id="compensation-benefit-variable-pay-modal-session-label" data-cy="compensation-benefit-variable-pay-modal-session-label" className="font-semibold">Selected Session: </span>
              <span
                data-testid="session-dates"
                id="compensation-benefit-variable-pay-modal-session-dates"
                data-cy="compensation-benefit-variable-pay-modal-session-dates"
              >
                {sessionById
                  ? ` ${dayjs(sessionById?.startDate).format('MMM DD, YYYY')} — ${dayjs(sessionById?.endDate).format('MMM DD, YYYY')}`
                  : 'Session not selected'}
              </span>
            </div>
          </div>
        </div>
      </Modal>
  );
};

export default VariablePayModal;
