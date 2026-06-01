import { useEffect, useState } from 'react';
import { Modal, Select, Button, Typography } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useEmployeeAttendanceStore } from '@/store/uistate/features/timesheet/employeeAtendance';
import { AttendanceActionType } from '@/types/timesheet/attendance';
import { useEditRuleViolation } from '@/store/server/features/timesheet/attendance/mutation';

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

const EditRuleViolationModal = ({
  setIsShowEditRuleViolationModal,
}: {
  setIsShowEditRuleViolationModal: (val: boolean) => void;
}) => {
  const {
    isShowEditRuleViolationModal,
    selectedViolationId,
    selectedViolationActionTypes,
  } = useEmployeeAttendanceStore();

  const [selectedAction, setSelectedAction] = useState<string[]>([]);

  const { mutate: editRuleViolation, isLoading } = useEditRuleViolation();

  // Pre-populate with existing action types whenever the modal opens
  useEffect(() => {
    if (isShowEditRuleViolationModal) {
      setSelectedAction(selectedViolationActionTypes ?? []);
    }
  }, [isShowEditRuleViolationModal, selectedViolationActionTypes]);

  const handleCancel = () => {
    setIsShowEditRuleViolationModal(false);
    setSelectedAction([]);
  };

  const handleSave = () => {
    if (!selectedAction.length || !selectedViolationId) return;
    editRuleViolation(
      {
        data: { actionTypes: selectedAction },
        violationId: selectedViolationId,
      },
      {
        onSuccess: () => {
          setIsShowEditRuleViolationModal(false);
          setSelectedAction([]);
        },
      },
    );
  };

  return (
    <Modal
      open={isShowEditRuleViolationModal}
      onCancel={handleCancel}
      footer={null}
      closable={false}
      width={520}
      styles={{
        body: { padding: 0 },
        content: { borderRadius: 8, padding: 0, overflow: 'hidden' },
      }}
      centered
    >
      {/* Header */}
      <div
        data-cy="time-attendance-rule-violation-edit-modal-header-div"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: '20px 24px 0 24px',
        }}
      >
        <div data-cy="time-attendance-rule-violation-edit-modal-header-title-div">
          <Title
            level={5}
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              color: 'rgba(0,0,0,0.88)',
            }}
          >
            Edit
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Only Actions can be edited
          </Text>
        </div>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={handleCancel}
          size="small"
          style={{ color: 'rgba(0,0,0,0.45)', marginTop: 2 }}
        />
      </div>

      {/* Body */}
      <div
        data-cy="time-attendance-rule-violation-edit-modal-body-div"
        style={{ padding: '24px 24px 8px 24px' }}
      >
        <div
          data-cy="time-attendance-rule-violation-edit-modal-body-title-div"
          style={{ marginBottom: 8 }}
        >
          <Text strong style={{ fontSize: 14 }}>
            Action
          </Text>
        </div>
        <Select
          style={{ width: '100%' }}
          placeholder="Select Action"
          value={selectedAction}
          onChange={(val) => setSelectedAction(val)}
          size="large"
          options={ACTION_TYPE_OPTIONS as any}
          allowClear
          mode="multiple"
          id="time-attendance-rule-violation-edit-modal-action-select"
          data-cy="time-attendance-rule-violation-edit-modal-action-select"
        />
      </div>

      {/* Footer */}
      <div
        data-cy="time-attendance-rule-violation-edit-modal-footer-div"
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
          id="time-attendance-rule-violation-edit-modal-cancel-button"
          data-cy="time-attendance-rule-violation-edit-modal-cancel-button"
        >
          Cancel
        </Button>
        <Button
          type="primary"
          onClick={handleSave}
          disabled={!selectedAction.length}
          loading={isLoading}
          id="time-attendance-rule-violation-edit-modal-save-button"
          data-cy="time-attendance-rule-violation-edit-modal-save-button"
        >
          Save
        </Button>
      </div>
    </Modal>
  );
};

export default EditRuleViolationModal;
