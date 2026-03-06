'use client';

import React from 'react';
import { Modal, Button } from 'antd';

interface TriggerRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

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
  'data-cy'?: string;
  /** When set, the modal is positioned just below this rect (e.g. under the trigger button) instead of centered */
  triggerRect?: TriggerRect | null;
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
  'data-cy': dataCy,
  triggerRect,
}) => {
  const isPositioned = Boolean(triggerRect);
  const modalStyle: React.CSSProperties | undefined = isPositioned
    ? {
        position: 'fixed',
        top: triggerRect!.top + triggerRect!.height + 8,
        left: triggerRect!.left,
        margin: 0,
        paddingBottom: 0,
        maxHeight: `calc(100vh - ${triggerRect!.top + triggerRect!.height + 8}px)`,
      }
    : undefined;

  const deleteModalFooter = (
    <div
      className="w-full flex justify-end items-center gap-3 mt-6"
      data-cy="delete-confirmation-modal-footer"
    >
      <Button
        className="px-5 h-9 text-sm font-medium border-gray-300"
        id="deleteModalCancelButtonId"
        onClick={onCancel}
      >
        {cancelText ?? 'Cancel'}
      </Button>
      <Button
        id="confirmDeleteId"
        className="px-5 h-9 text-sm font-medium"
        type="primary"
        danger
        loading={loading ?? false}
        onClick={onConfirm}
      >
        {deleteText ?? 'Delete'}
      </Button>
    </div>
  );
  return (
    <Modal
      open={open}
      width={420}
      onOk={onConfirm}
      onCancel={onCancel}
      footer={deleteModalFooter}
      centered={!isPositioned}
      {...(modalStyle !== undefined && { style: modalStyle })}
      title={
        <span
          className="text-base font-semibold text-gray-900"
          data-cy="delete-confirmation-modal-title"
        >
          {deleteMessage ?? 'Delete'}
        </span>
      }
      modalRender={(modal) => (
        <div id={id} data-cy={dataCy}>
          {modal}
        </div>
      )}
      data-cy="delete-confirmation-modal"
    >
      <div className="py-2" data-cy="delete-confirmation-modal-content">
        <p
          data-cy="components-common-deleteconfirmationmodal-index-tsx-index-p-78"
          className="text-sm text-gray-700"
        >
          {customMessage ?? 'Are you sure you want to delete this item?'}
        </p>
      </div>
    </Modal>
  );
};

export default DeleteModal;
