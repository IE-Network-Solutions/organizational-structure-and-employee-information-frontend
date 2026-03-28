'use client';

import React from 'react';
import { Modal, Button } from 'antd';
import Image from 'next/image';

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
  /** Optional anchor rect to position the modal under a trigger element */
  triggerRect?: TriggerRect;
  customMessage?: React.ReactNode;
  deleteMessage?: React.ReactNode;
  deleteText?: React.ReactNode;
  cancelText?: React.ReactNode;
  loading?: boolean;
  id?: string;
  'data-cy'?: string;
  /** Modal title (e.g. "Delete Status"). When set, modal shows title and no image. */
  title?: string;
  /** Hide the delete illustration and use compact layout with title + message only */
  hideImage?: boolean;
  /** Use danger (red) style for the confirm button */
  danger?: boolean;
  /** Optional class for modal wrapper (e.g. recruitment-settings-delete-modal) */
  modalClassName?: string;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  open,
  onConfirm,
  onCancel,
  triggerRect,
  customMessage,
  deleteMessage,
  deleteText,
  cancelText,
  loading,
  id,
  'data-cy': dataCy,
  title,
  hideImage = false,
  danger = false,
  modalClassName,
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
      className="w-full flex flex-col md:flex-row justify-end items-center gap-3 mt-4"
      data-cy="delete-confirmation-modal-footer"
    >
      <Button
        className="px-6 py-2 rounded-md"
        id="deleteModalCancelButtonId"
        onClick={onCancel}
      >
        {cancelText ?? 'Cancel'}
      </Button>
      <Button
        id="confirmDeleteId"
        className="px-6 py-2 rounded-md"
        type="primary"
        danger={danger}
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
      title={title}
      width={hideImage ? 440 : 500}
      onCancel={onCancel}
      footer={deleteModalFooter}
      closable
      centered
      style={modalStyle}
      rootClassName={modalClassName}
      modalRender={(modal) => (
        <div id={id} data-cy={dataCy}>
          {modal}
        </div>
      )}
      data-cy="delete-confirmation-modal"
    >
      {!hideImage && (
        <p
          data-cy="components-common-deleteconfirmationmodal-index-tsx-index-p-69"
          className="flex justify-center items-center h-[200px]"
        >
          <Image src="/deleteSvg.svg" width={300} height={300} alt="Delete" />
        </p>
      )}

      <p
        data-cy="components-common-deleteconfirmationmodal-index-tsx-index-p-78"
        className={
          hideImage
            ? 'text-gray-900 text-[14px] font-normal'
            : 'flex justify-center items-center mt-4 text-xl text-gray-950 font-extrabold'
        }
      >
        {deleteMessage ?? 'you sure to Delete ? '}
      </p>
      {customMessage && (
        <div
          data-cy="components-common-deleteconfirmationmodal-index-tsx-index-div-81"
          className="mt-4 text-center"
        >
          {customMessage ?? 'Are you sure you want to delete this item?'}
        </div>
      )}
    </Modal>
  );
};

export default DeleteModal;
