'use client';

import React from 'react';
import { Modal, Button } from 'antd';
import Image from 'next/image';

interface DeleteModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  open,
  onConfirm,
  onCancel,
  loading,
}) => {
  const deleteModalFooter = (
    <div
      className="w-full flex flex-col md:flex-row justify-center items-center gap-6 mt-6"
      data-cy="delete-modal-footer"
    >
      <Button
        className="w-70 md:w-auto px-8 py-4 text-xs font-bold"
        onClick={onCancel}
        data-cy="delete-modal-cancel-button"
      >
        Cancel
      </Button>
      <Button
        id="confirmDeleteId"
        className="w-70 md:w-auto px-8 py-4 text-xs font-bold"
        type="primary"
        onClick={onConfirm}
        data-cy="delete-modal-confirm-button"
      >
        Delete
      </Button>
    </div>
  );

  return (
    <Modal
      data-cy="delete-modal"
      open={open}
      width={500}
      okText={'Delete'}
      loading={loading}
      onOk={onConfirm}
      onCancel={onCancel}
      footer={deleteModalFooter}
    >
      <p
        className="flex justify-center items-center h-[200px]"
        data-cy="delete-modal-image-container"
      >
        <Image
          src="/deleteSvg.svg"
          width={300}
          height={300}
          alt="Picture of the author"
          data-cy="delete-modal-image"
        />
      </p>
      <p
        className="flex justify-center items-center mt-4 text-xl text-gray-950 font-extrabold"
        data-cy="delete-modal-message"
      >
        Are you sure to Delete?
      </p>
    </Modal>
  );
};

export default DeleteModal;
