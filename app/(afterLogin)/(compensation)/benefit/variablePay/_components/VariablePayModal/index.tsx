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
        id,
        VpInPercentile: vpInPercentile,
        VpScore: vpScore,
      }: {
        id: string;
        VpInPercentile: number;
        VpScore: string;
      }) => ({
        userId: id,
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
      title="Send to payroll"
      centered
      open={openModal}
      onCancel={handleClose}
      okText="Send"
      onOk={handleSubmit}
    >
      Are you sure to send the below information to payroll?
      <div className="m-2">
        <div className="flex items-center justify-start my-2">
          <span className="font-semibold">Active Pay Period: </span>
          <span className="">
            {' '}
            {activePayPeriod
              ? ` ${dayjs(activePayPeriod?.startDate).format('MMM DD, YYYY')} — ${dayjs(activePayPeriod?.endDate).format('MMM DD, YYYY')}`
              : 'No Active pay period'}
          </span>
        </div>
        <div className="flex items-center justify-start my-2">
          <span className="font-semibold">Selected Month Range: </span>
          <span className="">
            {monthById
              ? ` ${dayjs(monthById?.startDate).format('MMM DD, YYYY')} — ${dayjs(monthById?.endDate).format('MMM DD, YYYY')}`
              : 'Month not selected'}
          </span>
        </div>
        <div className="flex items-center justify-start my-2">
          <span className="font-semibold">Selected Session: </span>
          <span className="">
            {sessionById
              ? ` ${dayjs(sessionById?.startDate).format('MMM DD, YYYY')} — ${dayjs(sessionById?.endDate).format('MMM DD, YYYY')}`
              : 'Session not selected'}
          </span>
        </div>
      </div>
    </Modal>
  );
};

export default VariablePayModal;
