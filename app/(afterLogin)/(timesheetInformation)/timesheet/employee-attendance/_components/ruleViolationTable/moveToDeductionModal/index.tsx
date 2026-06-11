import { useEffect, useMemo, useState } from 'react';
import { Modal, Select, Button, Typography } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useGetPayPeriod } from '@/store/server/features/payroll/payroll/queries';
import { useAddAttendanceViolationsToDeduction } from '@/store/server/features/timesheet/attendance/mutation';

const { Text, Title } = Typography;

interface MoveToDeductionModalProps {
  open: boolean;
  violationIds: string[];
  onClose: () => void;
  onSuccess: () => void;
}

const MoveToDeductionModal = ({
  open,
  violationIds,
  onClose,
  onSuccess,
}: MoveToDeductionModalProps) => {
  const [selectedPayPeriodId, setSelectedPayPeriodId] = useState<string>();
  const { data: payPeriods, isLoading: payPeriodsLoading } = useGetPayPeriod();
  const { mutate: addToDeduction, isLoading } =
    useAddAttendanceViolationsToDeduction();

  useEffect(() => {
    if (!open) {
      setSelectedPayPeriodId(undefined);
    }
  }, [open]);

  const payPeriodOptions = useMemo(
    () =>
      (Array.isArray(payPeriods)
        ? payPeriods
        : Array.isArray((payPeriods as any)?.items)
          ? (payPeriods as any).items
          : []
      )
        .filter((period: any) => period?.id)
        .map((period: any) => ({
          value: String(period.id),
          label: `${dayjs(period.startDate).format('MMM DD, YYYY')} - ${dayjs(period.endDate).format('MMM DD, YYYY')}`,
        })),
    [payPeriods],
  );

  const handleConfirm = () => {
    if (!selectedPayPeriodId || violationIds.length === 0) return;

    addToDeduction(
      {
        payPeriodId: selectedPayPeriodId,
        violationIds,
      },
      {
        onSuccess: () => {
          onSuccess();
          setSelectedPayPeriodId(undefined);
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={520}
      styles={{
        body: { padding: 0 },
        content: { borderRadius: 8, padding: 0, overflow: 'hidden' },
      }}
      centered
      data-cy="time-attendance-rule-violation-move-to-deduction-modal"
    >
      <div
        data-cy="time-attendance-rule-violation-move-to-deduction-modal-header-div"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: '20px 24px 0 24px',
        }}
      >
        <div data-cy="time-attendance-rule-violation-move-to-deduction-modal-header-title-div">
          <Title
            level={5}
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 700,
              color: 'rgba(0,0,0,0.88)',
            }}
          >
            Move to Deduction
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Select the pay period to add selected violations to deduction
          </Text>
        </div>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={onClose}
          size="small"
          style={{ color: 'rgba(0,0,0,0.45)', marginTop: 2 }}
          data-cy="time-attendance-rule-violation-move-to-deduction-modal-close-button"
        />
      </div>

      <div
        data-cy="time-attendance-rule-violation-move-to-deduction-modal-body-div"
        style={{
          padding: '20px 24px 8px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <Text
          style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)' }}
          data-cy="time-attendance-rule-violation-move-to-deduction-modal-pay-period-label"
        >
          Pay Period
        </Text>
        <Select
          placeholder="Select pay period"
          value={selectedPayPeriodId}
          onChange={setSelectedPayPeriodId}
          options={payPeriodOptions}
          loading={payPeriodsLoading}
          className="w-full h-10"
          data-cy="time-attendance-rule-violation-move-to-deduction-pay-period-select"
        />
      </div>

      <div
        data-cy="time-attendance-rule-violation-move-to-deduction-modal-footer-div"
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
          padding: '16px 24px 20px 24px',
        }}
      >
        <Button
          onClick={onClose}
          disabled={isLoading}
          data-cy="time-attendance-rule-violation-move-to-deduction-cancel-button"
        >
          Cancel
        </Button>
        <Button
          type="primary"
          onClick={handleConfirm}
          loading={isLoading}
          disabled={!selectedPayPeriodId || violationIds.length === 0}
          data-cy="time-attendance-rule-violation-move-to-deduction-confirm-button"
        >
          Move
        </Button>
      </div>
    </Modal>
  );
};

export default MoveToDeductionModal;
