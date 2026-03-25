'use client';

import React from 'react';
import { Modal, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import Image from 'next/image';

interface DeleteModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
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
  title,
  customMessage,
  deleteMessage,
  deleteText,
  cancelText,
  loading,
  id,
  'data-cy': dataCy,
  triggerRect,
}) => {
  const simpleLayout = Boolean(title);

  const deleteModalFooter = (
    <div
      className={`w-full flex flex-col md:flex-row items-center gap-6 mt-6 ${simpleLayout ? 'justify-end' : 'justify-center'}`}
      data-cy="delete-confirmation-modal-footer"
    >
      <Button
        className="w-70 md:w-auto px-8 py-4 text-xs font-bold border-gray-300 text-gray-700"
        id="deleteModalCancelButtonId"
        onClick={onCancel}
      >
        {cancelText ?? 'Cancel'}
      </Button>
      <Button
        id="confirmDeleteId"
        className="w-70 md:w-auto px-8 py-4 text-xs font-bold !bg-red-600 hover:!bg-red-700 !border-0"
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
      width={500}
      title={title}
      centered
      okText={'Delete'}
      onOk={onConfirm}
      onCancel={onCancel}
      footer={deleteModalFooter}
      closeIcon={
        <CloseOutlined
          className="text-emerald-600"
          style={{ color: '#059669' }}
        />
      }
      modalRender={(modal) => (
        <div id={id} data-cy={dataCy}>
          {modal}
        </div>
      )}
      data-cy="delete-confirmation-modal"
    >
      {simpleLayout ? (
        <>
          <p
            data-cy="components-common-deleteconfirmationmodal-index-tsx-index-p-78"
            className="text-gray-500 text-base font-normal"
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
            data-cy="components-common-deleteconfirmationmodal-index-tsx-index-p-69"
            className="flex justify-center items-center h-[200px]"
          >
            <Image
              src="/deleteSvg.svg"
              width={300}
              height={300}
              alt="Picture of the author"
            />
          </p>
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
