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
  /**
   * Called after close animation finishes.
   * Use this to clear triggerRect state to preserve anchored exit animation.
   */
  onAfterClose?: () => void;
  title?: string;
  customMessage?: React.ReactNode;
  deleteMessage?: React.ReactNode;
  deleteText?: React.ReactNode;
  cancelText?: React.ReactNode;
  loading?: boolean;
  id?: string;
  'data-cy'?: string;
  /** Hide illustration and use compact layout */
  hideImage?: boolean;
  /** Use red danger confirm button */
  danger?: boolean;
  /** Optional class for modal wrapper */
  modalClassName?: string;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  open,
  onConfirm,
  onCancel,
  triggerRect,
  onAfterClose,
  title,
  customMessage,
  deleteMessage,
  deleteText,
  cancelText,
  loading,
  id,
  'data-cy': dataCy,
  hideImage,
  danger,
  modalClassName,
}) => {
  const isPositioned = Boolean(triggerRect);
  const simpleLayout = Boolean(title) || hideImage;
  const modalStyle: React.CSSProperties | undefined = isPositioned
    ? (() => {
        const modalWidth = 440;
        const rightEdge = triggerRect!.left + triggerRect!.width;
        const left = Math.max(8, rightEdge - modalWidth);
        return {
          position: 'fixed',
          top: triggerRect!.top + triggerRect!.height + 8,
          left,
          margin: 0,
          paddingBottom: 0,
          maxHeight: `calc(100vh - ${triggerRect!.top + triggerRect!.height + 8}px)`,
        };
      })()
    : undefined;

  const deleteModalFooter = (
    <div
      className={`mt-4 flex w-full flex-row items-center gap-3 ${simpleLayout ? 'justify-end' : 'justify-center'}`}
      data-cy="delete-confirmation-modal-footer"
    >
      <Button
        className="!h-8 !rounded-[6px] !border !border-solid !border-[#D9D9D9] !bg-white !px-4 !text-[14px] !font-normal !text-[rgba(0,0,0,0.7)] hover:!border-[#CFCFCF] hover:!text-[rgba(0,0,0,0.7)]"
        id="deleteModalCancelButtonId"
        onClick={onCancel}
      >
        {cancelText ?? 'Cancel'}
      </Button>
      <Button
        id="confirmDeleteId"
        className="!h-8 !rounded-[8px] !border-0 !bg-[#FF4D4F] !px-4 !text-[14px] !font-normal !text-white hover:!bg-[#ff7875]"
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
      width={hideImage ? 440 : 500}
      title={
        title ? (
          <span className="text-[16px] font-bold text-[rgba(0,0,0,0.7)]">
            {title}
          </span>
        ) : undefined
      }
      onCancel={onCancel}
      afterClose={onAfterClose}
      footer={deleteModalFooter}
      closable
      centered={!isPositioned}
      style={modalStyle}
      rootClassName={modalClassName}
      modalRender={(modal) => (
        <div id={id} data-cy={dataCy}>
          {modal}
        </div>
      )}
      data-cy="delete-confirmation-modal"
    >
      {!hideImage && !simpleLayout && (
        <p
          data-cy="components-common-deleteconfirmationmodal-index-tsx-index-p-69"
          className="flex justify-center items-center h-[200px]"
        >
          <Image src="/deleteSvg.svg" width={300} height={300} alt="Delete" />
        </p>
      )}

      {simpleLayout ? (
        <>
          <p
            data-cy="components-common-deleteconfirmationmodal-index-tsx-index-p-78"
            className="text-[14px] font-normal text-[rgba(0,0,0,0.7)]"
          >
            {deleteMessage ?? 'Are you sure to delete?'}
          </p>
          {customMessage && (
            <div
              data-cy="components-common-deleteconfirmationmodal-index-tsx-index-div-81"
              className="mt-4 text-center"
            >
              {customMessage}
            </div>
          )}
        </>
      ) : (
        <>
          <p
            data-cy="components-common-deleteconfirmationmodal-index-tsx-index-p-78"
            className="flex justify-center items-center mt-4 text-xl text-gray-950 font-extrabold"
          >
            {deleteMessage ?? 'you sure to Delete ? '}
          </p>
          {customMessage && (
            <div
              data-cy="components-common-deleteconfirmationmodal-index-tsx-index-div-81"
              className="mt-4 text-center"
            >
              {customMessage}
            </div>
          )}
        </>
      )}
    </Modal>
  );
};

export default DeleteModal;
