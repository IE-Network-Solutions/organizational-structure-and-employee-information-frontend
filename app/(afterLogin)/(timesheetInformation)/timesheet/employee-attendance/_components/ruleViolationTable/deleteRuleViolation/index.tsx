import { useEffect, useMemo, useState } from 'react';
import { Modal, Checkbox, Button, Typography } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useEmployeeAttendanceStore } from '@/store/uistate/features/timesheet/employeeAtendance';
import {
  useDeleteRuleViolation,
  useEditRuleViolation,
} from '@/store/server/features/timesheet/attendance/mutation';
import {
  AttendanceActionType,
  AttendanceRuleActionStatus,
} from '@/types/timesheet/attendance';

const { Text, Title } = Typography;

const ACTION_TYPE_OPTIONS = [
  {
    label: 'Warning Letter',
    value: AttendanceActionType.WARNING_LETTER,
  },
  {
    label: 'Reprimand',
    value: AttendanceActionType.REPRIMAND,
  },
  {
    label: 'Salary Deduction',
    value: AttendanceActionType.SALARY_DEDUCTION,
  },
  {
    label: 'VP Deduction',
    value: AttendanceActionType.VP_DEDUCTION,
  },
] as const;

export const canRemoveViolationActionType = (
  actionType: string,
  actionStatus?: AttendanceRuleActionStatus,
) => {
  if (actionType === AttendanceActionType.VP_DEDUCTION) {
    return actionStatus?.[AttendanceActionType.VP_DEDUCTION]?.taken !== true;
  }
  return true;
};

export const hasRemovableViolationActions = (
  actionTypes: string[],
  actionStatus?: AttendanceRuleActionStatus,
) =>
  actionTypes.some((actionType) =>
    canRemoveViolationActionType(actionType, actionStatus),
  );

export default function DeleteRuleViolationModal({
  setIsShowDeleteRuleViolationModal,
}: {
  setIsShowDeleteRuleViolationModal: (val: boolean) => void;
}) {
  const {
    isShowDeleteRuleViolationModal,
    selectedViolationId,
    selectedViolationActionTypes,
    selectedViolationActionStatus,
  } = useEmployeeAttendanceStore();

  const [actionsToRemove, setActionsToRemove] = useState<string[]>([]);

  const { mutate: deleteRuleViolation, isLoading: isDeleting } =
    useDeleteRuleViolation();
  const { mutate: editRuleViolation, isLoading: isEditing } =
    useEditRuleViolation();

  const isLoading = isDeleting || isEditing;

  const activeActionOptions = useMemo(
    () =>
      ACTION_TYPE_OPTIONS.filter(
        (option) =>
          selectedViolationActionTypes.includes(option.value) &&
          canRemoveViolationActionType(
            option.value,
            selectedViolationActionStatus,
          ),
      ),
    [selectedViolationActionTypes, selectedViolationActionStatus],
  );

  useEffect(() => {
    if (isShowDeleteRuleViolationModal) {
      setActionsToRemove([]);
    }
  }, [isShowDeleteRuleViolationModal]);

  const handleCancel = () => {
    setIsShowDeleteRuleViolationModal(false);
    setActionsToRemove([]);
  };

  const handleConfirm = () => {
    if (!selectedViolationId || actionsToRemove.length === 0) return;

    const remainingActionTypes = selectedViolationActionTypes.filter(
      (actionType) => !actionsToRemove.includes(actionType),
    );

    if (remainingActionTypes.length === 0) {
      deleteRuleViolation(selectedViolationId, {
        onSuccess: () => {
          setIsShowDeleteRuleViolationModal(false);
          setActionsToRemove([]);
        },
      });
      return;
    }

    editRuleViolation(
      {
        data: { actionTypes: remainingActionTypes },
        violationId: selectedViolationId,
      },
      {
        onSuccess: () => {
          setIsShowDeleteRuleViolationModal(false);
          setActionsToRemove([]);
        },
      },
    );
  };

  return (
    <Modal
      open={isShowDeleteRuleViolationModal}
      onCancel={handleCancel}
      footer={null}
      closable={false}
      width={480}
      styles={{
        body: { padding: 0 },
        content: { borderRadius: 12, padding: 0, overflow: 'hidden' },
      }}
      centered
    >
      <div
        data-cy="time-attendance-rule-violation-delete-modal-header-div"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: '20px 24px 0 24px',
        }}
      >
        <div data-cy="time-attendance-rule-violation-delete-modal-header-title-div">
          <Title
            level={5}
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 700,
              color: 'rgba(0,0,0,0.88)',
            }}
          >
            Remove Action
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Remove an action or all actions taken
          </Text>
        </div>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={handleCancel}
          size="small"
          style={{ color: 'rgba(0,0,0,0.45)', marginTop: 2 }}
          id="time-attendance-rule-violation-delete-modal-close-button"
          data-cy="time-attendance-rule-violation-delete-modal-close-button"
        />
      </div>

      <div
        data-cy="time-attendance-rule-violation-delete-modal-body-div"
        style={{
          padding: '20px 24px 8px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {activeActionOptions.length === 0 ? (
          <Text type="secondary" style={{ fontSize: 13 }}>
            No actions can be removed while VP deduction is already sent.
          </Text>
        ) : (
          <Checkbox.Group
            value={actionsToRemove}
            onChange={(values) => setActionsToRemove(values as string[])}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              width: '100%',
            }}
          >
            {activeActionOptions.map((option) => (
              <div
                key={option.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px 16px',
                  borderRadius: 8,
                  background: '#f5f5f5',
                }}
                id={`time-attendance-rule-violation-delete-modal-item-${option.value}`}
                data-cy={`time-attendance-rule-violation-delete-modal-item-${option.value}`}
              >
                <Checkbox value={option.value}>
                  <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.85)' }}>
                    {option.label}
                  </Text>
                </Checkbox>
              </div>
            ))}
          </Checkbox.Group>
        )}
      </div>

      <div
        data-cy="time-attendance-rule-violation-delete-modal-footer-div"
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
          padding: '16px 24px 20px 24px',
        }}
      >
        <Button
          onClick={handleCancel}
          disabled={isLoading}
          id="time-attendance-rule-violation-delete-modal-cancel-button"
          data-cy="time-attendance-rule-violation-delete-modal-cancel-button"
        >
          Cancel
        </Button>
        <Button
          type="primary"
          danger
          onClick={handleConfirm}
          loading={isLoading}
          disabled={
            !selectedViolationId ||
            actionsToRemove.length === 0 ||
            activeActionOptions.length === 0
          }
          id="time-attendance-rule-violation-delete-modal-confirm-button"
          data-cy="time-attendance-rule-violation-delete-modal-confirm-button"
        >
          Remove
        </Button>
      </div>
    </Modal>
  );
}
