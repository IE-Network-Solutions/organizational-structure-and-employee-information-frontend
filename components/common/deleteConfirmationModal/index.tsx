'use client';

import React from 'react';
import { Modal, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

interface DeleteModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  customMessage?: React.ReactNode;
  deleteMessage?: React.ReactNode;
  deleteText?: React.ReactNode;
  cancelText?: React.ReactNode;
  loading?: boolean;
  id?: string;
  title?: string;
  'data-cy'?: string;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  open,
  onConfirm,
  onCancel,
  customMessage,
  deleteMessage,
  deleteText,
  cancelText,
  loading,
  id,
  title = 'Delete OKR',
  'data-cy': dataCy,
}) => {
  const messageContent = customMessage ?? deleteMessage ?? 'Are you sure you want to delete this Objective? All Key results under it will be removed.';

  const deleteModalFooter = (
    <div
      className="w-full flex flex-row justify-end items-center gap-3"
      data-cy="delete-confirmation-modal-footer"
    >
      <Button
        className="px-5 py-2 text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400"
        id="deleteModalCancelButtonId"
        onClick={onCancel}
      >
        {cancelText ?? 'Cancel'}
      </Button>
      <Button
        id="confirmDeleteId"
        className="px-5 py-2 text-sm font-medium bg-[#2563EB] text-white border-none hover:bg-[#1d4ed8]"
        loading={loading ?? false}
        onClick={onConfirm}
      >
        {deleteText ?? 'OK'}
      </Button>
    </div>
  );

  return (
    <Modal
      open={open}
      width={420}
      onCancel={onCancel}
      footer={deleteModalFooter}
      closable={false}
      centered
      className="delete-confirmation-modal"
      styles={{
        content: { borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
        body: { padding: '24px 24px 20px' },
      }}
      modalRender={(modal) => (
        <div id={id} data-cy={dataCy}>
          {modal}
        </div>
      )}
    >
      <div className="flex gap-3" data-cy="delete-confirmation-modal-content">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#FFE4E4] flex items-center justify-center" data-cy="delete-confirmation-modal-icon">
          <CloseOutlined style={{ color: '#B91C1C', fontSize: 18 }} />
        </div>
        <div className="flex-1 min-w-0" data-cy="delete-confirmation-modal-text-container">
          <h3 className="text-[17px] font-bold text-[#333333] m-0 mb-2 tracking-tight" data-cy="delete-confirmation-modal-title">{title}</h3>
          <p
            data-cy="components-common-deleteconfirmationmodal-index-tsx-index-p-78"
            className="text-[14px] font-normal text-[#666666] leading-[1.5] m-0"
          >
            {messageContent}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteModal;
