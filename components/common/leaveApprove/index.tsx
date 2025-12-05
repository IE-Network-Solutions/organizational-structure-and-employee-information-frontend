'use client';

import React from 'react';
import { Modal, Button } from 'antd';
import Image from 'next/image';

interface LeaveApprovalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  customMessage?: React.ReactNode;
}

const LeaveApproval: React.FC<LeaveApprovalProps> = ({
  open,
  onConfirm,
  onCancel,
  customMessage,
}) => {
  const leaveApprovalFooter = (
    <div
      className="w-full flex flex-col md:flex-row justify-center items-center gap-6 mt-6"
      data-cy="leave-approval-footer"
    >
      <Button
        className="w-70 md:w-auto px-8 py-4 text-xs font-bold"
        onClick={onCancel}
        data-cy="leave-approval-cancel-button"
      >
        Cancel
      </Button>
      <Button
        id="confirmDeleteId"
        className="w-70 md:w-auto px-8 py-4 text-xs font-bold"
        type="primary"
        onClick={onConfirm}
        data-cy="leave-approval-confirm-button"
      >
        Approve
      </Button>
    </div>
  );
  return (
    <Modal
      data-cy="leave-approval-modal"
      open={open}
      width={500}
      okText={'Approve'}
      onOk={onConfirm}
      onCancel={onCancel}
      footer={leaveApprovalFooter}
    >
      <p
        className="flex justify-center items-center h-[200px]"
        data-cy="leave-approval-image-container"
      >
        <Image
          src="/deleteSvg.svg"
          width={300}
          height={300}
          alt="Picture of the author"
          data-cy="leave-approval-image"
        />
      </p>

      <p
        className="flex justify-center items-center mt-4 text-xl text-gray-950 font-extrabold"
        data-cy="leave-approval-message"
      >
        Are you sure to Approve?
      </p>
      {customMessage && (
        <div
          className="mt-4 text-center"
          data-cy="leave-approval-custom-message"
        >
          {customMessage}
        </div>
      )}
    </Modal>
  );
};

export default LeaveApproval;
