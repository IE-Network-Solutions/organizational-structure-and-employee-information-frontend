import { useEffect, useMemo, useState } from 'react';
import { Modal, Select, Button, Typography, Checkbox, Alert } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useGetPayPeriod } from '@/store/server/features/payroll/payroll/queries';
import {
  useAddAttendanceViolationsToDeduction,
  useCreateVpDeduction,
  useUpdateViolationActionStatus,
} from '@/store/server/features/timesheet/attendance/mutation';
import { AttendanceActionType } from '@/types/timesheet/attendance';
import { useGetSimpleEmployee } from '@/store/server/features/employees/employeeDetail/queries';

const { Text, Title } = Typography;

export interface DeductionViolation {
  id: string;
  userId: string;
  actionTypes: string[];
}

interface MoveToDeductionModalProps {
  open: boolean;
  violations: DeductionViolation[];
  onClose: () => void;
  onSuccess: () => void;
}

const EmployeeNameChip = ({ userId }: { userId: string }) => {
  const { data, isLoading } = useGetSimpleEmployee(userId);

  if (isLoading) {
    return (
      <span
        className="text-sm text-[#4d4d4d]"
        data-cy={`time-attendance-rule-violation-move-to-deduction-employee-chip-loading-${userId}`}
      >
        ...
      </span>
    );
  }

  const name = data
    ? [data.firstName, data.middleName, data.lastName]
        .filter((part) => part && part !== '-')
        .join(' ')
        .trim()
    : '-';

  return (
    <span
      className="px-3 py-1 bg-white border border-[#D9D9D9] rounded text-sm text-[#4d4d4d]"
      data-cy={`time-attendance-rule-violation-move-to-deduction-employee-chip-${userId}`}
    >
      {name || '-'}
    </span>
  );
};

const MoveToDeductionModal = ({
  open,
  violations,
  onClose,
  onSuccess,
}: MoveToDeductionModalProps) => {
  const [selectedPayPeriodId, setSelectedPayPeriodId] = useState<string>();
  const [moveToVp, setMoveToVp] = useState(false);
  const { data: payPeriods, isLoading: payPeriodsLoading } = useGetPayPeriod();
  const { mutateAsync: addToDeduction, isLoading: isSalaryLoading } =
    useAddAttendanceViolationsToDeduction();
  const { mutateAsync: createVpDeduction, isLoading: isVpLoading } =
    useCreateVpDeduction();
  const {
    mutateAsync: updateActionStatus,
    isLoading: isActionStatusLoading,
  } = useUpdateViolationActionStatus();

  const salaryViolations = useMemo(
    () =>
      violations.filter((v) =>
        v.actionTypes.includes(AttendanceActionType.SALARY_DEDUCTION),
      ),
    [violations],
  );

  const vpViolations = useMemo(
    () =>
      violations.filter((v) =>
        v.actionTypes.includes(AttendanceActionType.VP_DEDUCTION),
      ),
    [violations],
  );

  const vpUserIds = useMemo(
    () => [...new Set(vpViolations.map((v) => v.userId))],
    [vpViolations],
  );

  useEffect(() => {
    if (!open) {
      setSelectedPayPeriodId(undefined);
      setMoveToVp(false);
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

  const canMove =
    violations.length > 0 &&
    ((salaryViolations.length > 0 && !!selectedPayPeriodId) ||
      (moveToVp && vpViolations.length > 0));

  const handleConfirm = async () => {
    if (!canMove) return;

    try {
      if (salaryViolations.length > 0 && selectedPayPeriodId) {
        // Mark salary deduction applied so backend calculates minutes/amount
        // for minute-based LATE rules, then push to payroll deduction.
        await Promise.all(
          salaryViolations.map((violation) =>
            updateActionStatus({
              violationId: violation.id,
              actionType: AttendanceActionType.SALARY_DEDUCTION,
              taken: true,
            }),
          ),
        );

        await addToDeduction({
          payPeriodId: selectedPayPeriodId,
          violationIds: salaryViolations.map((v) => v.id),
        });
      }

      if (moveToVp && vpViolations.length > 0) {
        await createVpDeduction({
          violationIds: vpViolations.map((v) => v.id),
        });
      }

      onSuccess();
      setSelectedPayPeriodId(undefined);
      setMoveToVp(false);
    } catch {
      // Errors handled by mutation hooks
    }
  };

  const isLoading =
    isSalaryLoading || isVpLoading || isActionStatusLoading;

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
        {salaryViolations.length > 0 && (
          <>
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
          </>
        )}

        {vpViolations.length > 0 && (
          <>
            <Checkbox
              checked={moveToVp}
              onChange={(e) => setMoveToVp(e.target.checked)}
              data-cy="time-attendance-rule-violation-move-to-vp-deduction-checkbox"
            >
              Move to VP Deduction
            </Checkbox>
            <Text type="secondary" style={{ fontSize: 13, marginTop: -6 }}>
              Move selected users with VP deduction action to VP deduction
              screen
            </Text>
            {moveToVp && (
              <div
                className="flex flex-wrap gap-2 p-3 border border-[#D9D9D9] rounded-md bg-[#FAFAFA]"
                data-cy="time-attendance-rule-violation-move-to-deduction-vp-employees"
              >
                {vpUserIds.map((userId) => (
                  <EmployeeNameChip key={userId} userId={userId} />
                ))}
              </div>
            )}
          </>
        )}

        {salaryViolations.length > 0 && vpViolations.length > 0 && (
          <Alert
            type="info"
            showIcon
            message="When you select move, people with VP deduction are moved to the VP deduction screen and people with Salary deduction are moved to the salary deduction screen."
          />
        )}
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
          disabled={!canMove}
          data-cy="time-attendance-rule-violation-move-to-deduction-confirm-button"
        >
          Move
        </Button>
      </div>
    </Modal>
  );
};

export default MoveToDeductionModal;
