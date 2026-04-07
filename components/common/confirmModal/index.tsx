'use client';

import React from 'react';
import { Modal, Button } from 'antd';

interface ConfirmModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  imageSrc?: string;
  description?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onConfirm,
  onCancel,
  loading,
  description,
}) => {
  const confirmModalFooter = (
    <div className="flex justify-end gap-3" data-cy="confirm-modal-footer">
      <Button
        type="default"
        className="h-8 font-normal border border-[#D9D9D9]"
        onClick={onCancel}
      >
        No
      </Button>
      <Button
        id="confirmId"
        className="h-8 font-normal"
        type="primary"
        onClick={onConfirm}
      >
        Yes
      </Button>
    </div>
  );

  return (
    <Modal
      open={open}
      okText={'Confirm'}
      loading={loading}
      onOk={onConfirm}
      onCancel={onCancel}
      footer={confirmModalFooter}
      closeIcon={false}
      centered
      width={400}
    >
      <p
        data-cy="components-common-confirmmodal-index-tsx-index-p-66"
        className="flex justify-start text-base text-black opacity-70 font-bold"
      >
        send to payroll{' '}
      </p>
      <p
        data-cy="components-common-confirmmodal-index-tsx-index-p-69"
        className="flex justify-start mt-4 text-sm text-black opacity-70 font-normal"
      >
        {description}
      </p>
    </Modal>
  );
};

export default ConfirmModal;
