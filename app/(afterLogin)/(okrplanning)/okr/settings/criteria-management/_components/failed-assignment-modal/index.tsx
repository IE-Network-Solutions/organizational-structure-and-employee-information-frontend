'use client';

import React from 'react';
import { Modal, Button } from 'antd';
import { VpScoringFailedAssignment } from '@/store/server/features/okrplanning/okr/criteria/mutation';

interface FailedAssignmentModalProps {
  open: boolean;
  failedAssignments: VpScoringFailedAssignment[];
  getEmployeeName: (userId: string) => string;
  onClose: () => void;
}

const FailedAssignmentModal: React.FC<FailedAssignmentModalProps> = ({
  open,
  failedAssignments,
  getEmployeeName,
  onClose,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <span
          className="text-[18px] font-bold text-[#262626]"
          data-cy="okr-criteria-failed-assignment-modal-title"
        >
          Assignment Warning
        </span>
      }
      footer={
        <div
          className="flex justify-end"
          data-cy="okr-criteria-failed-assignment-modal-footer"
        >
          <Button
            type="primary"
            onClick={onClose}
            className="h-10 px-8 rounded-lg bg-[#2b54ad] hover:bg-[#3d66c2] focus:bg-[#3d66c2] border-none font-medium"
            data-cy="okr-criteria-failed-assignment-modal-ok-button"
          >
            OK
          </Button>
        </div>
      }
      width={640}
      centered
      className="okr-settings-modal"
      data-cy="okr-criteria-failed-assignment-modal"
    >
      <p
        className="text-[14px] text-[#595959] mb-4"
        data-cy="okr-criteria-failed-assignment-modal-message"
      >
        The following employees are already assigned to another VP scoring
        configuration and cannot be assigned here unless removed from their
        current configuration:
      </p>
      <ul
        className="list-disc pl-5 space-y-2"
        data-cy="okr-criteria-failed-assignment-modal-list"
      >
        {failedAssignments.map((item) => (
          <li
            key={item.userId}
            className="text-[14px] text-[#262626]"
            data-cy={`okr-criteria-failed-assignment-item-${item.userId}`}
          >
            <span
              className="font-medium"
              data-cy={`okr-criteria-failed-assignment-employee-name-${item.userId}`}
            >
              {getEmployeeName(item.userId)}
            </span>
            {' — '}
            <span
              className="text-[#595959]"
              data-cy={`okr-criteria-failed-assignment-config-name-${item.userId}`}
            >
              {item.vpScoringName}
            </span>
          </li>
        ))}
      </ul>
    </Modal>
  );
};

export default FailedAssignmentModal;
