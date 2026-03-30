'use client';
import React from 'react';
import { Modal } from 'antd';
import { CloseOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Department } from '../cards/TeamCard';

interface MergeConfirmationModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  sourceTeams: Department[];
  destinationTeam: Department | null;
  loading: boolean;
}

const MergeConfirmationModal: React.FC<MergeConfirmationModalProps> = ({
  open,
  onConfirm,
  onCancel,
  sourceTeams,
  destinationTeam,
  loading,
}) => {
  return (
    <Modal
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Confirm Merge"
      cancelText="Cancel"
      okButtonProps={{
        loading,
        danger: true,
        className: 'bg-red-600 hover:bg-red-700 font-normal',
      }}
      cancelButtonProps={{ className: 'border-gray-300 font-normal' }}
      title={
        <div
          className="flex items-center gap-2"
          data-cy="merge-confirmation-modal-title-container"
        >
          <ExclamationCircleOutlined
            className="text-yellow-500 text-xl"
            data-cy="merge-confirmation-modal-title-icon"
          />
          <span data-cy="merge-confirmation-modal-title-text">
            Merge Confirmation
          </span>
        </div>
      }
      closeIcon={
        <CloseOutlined
          className="text-base"
          data-cy="merge-confirmation-modal-close-icon"
        />
      }
      className="[&_.ant-modal-header]:flex [&_.ant-modal-header]:items-center"
      data-cy="merge-confirmation-modal"
    >
      <div className="pt-3 pb-2" data-cy="merge-confirmation-modal-content">
        <p
          className="text-gray-700 mb-4 mt-0"
          data-cy="merge-confirmation-modal-description"
        >
          This action will permanently merge{' '}
          <strong data-cy="merge-confirmation-modal-source-teams">
            {sourceTeams.map((t) => t.name).join(', ')}
          </strong>
          {destinationTeam && (
            <>
              {' into '}
              <strong data-cy="merge-confirmation-modal-destination-team">
                {destinationTeam.name}
              </strong>
            </>
          )}
          .
        </p>

        <div
          className="bg-[#F3F4F6] rounded-lg p-4 mb-4 border border-[#D1D5DB]"
          data-cy="merge-confirmation-what-will-change-container"
        >
          <h4
            className="text-sm font-medium text-gray-900 mb-2"
            data-cy="merge-confirmation-what-will-change-title"
          >
            What will Change
          </h4>
          <ul
            className="list-disc list-inside text-gray-700 space-y-1"
            data-cy="merge-confirmation-what-will-change-list"
          >
            <li data-cy="merge-confirmation-change-item-1">
              Organization Structure
            </li>
            <li data-cy="merge-confirmation-change-item-2">
              Related Employee Data
            </li>
            <li data-cy="merge-confirmation-change-item-3">
              Reporting Structure will be updated
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default MergeConfirmationModal;
