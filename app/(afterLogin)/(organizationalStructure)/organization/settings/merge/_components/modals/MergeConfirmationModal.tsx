'use client';
import React from 'react';
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
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
  loading 
}) => {
  const allTeams = [...sourceTeams, destinationTeam].filter(Boolean) as Department[];

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
        className: 'bg-red-600 hover:bg-red-700'
      }}
      cancelButtonProps={{ className: 'border-gray-300' }}
      title={
        <div className="flex items-center gap-2">
          <ExclamationCircleOutlined className="text-yellow-500 text-xl" />
          <span>Merge Confirmation</span>
        </div>
      }
      closeIcon={<span className="text-gray-400">×</span>}
      data-cy="merge-confirmation-modal"
    >
      <div className="py-4">
        <p className="text-gray-700 mb-4">
          This action will permanently merge{' '}
          <strong>{sourceTeams.map(t => t.name).join(', ')}</strong>
          {destinationTeam && (
            <>
              {' into '}
              <strong>{destinationTeam.name}</strong>
            </>
          )}
          .
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 mb-2" data-cy="merge-confirmation-what-will-change-title">
            What will Change
          </h4>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Organization Structure</li>
            <li>Related Employee Data</li>
            <li>Reporting Structure will be updated</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default MergeConfirmationModal;
