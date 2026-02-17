'use client';
import React from 'react';
import { Modal, Button } from 'antd';
import { CloseOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Department } from '../cards/TeamCard';

interface TransferConfirmationModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  sourceTeams: Department[];
  destinationTeam: Department | null;
  loading: boolean;
}

const TransferConfirmationModal: React.FC<TransferConfirmationModalProps> = ({ 
  open, 
  onConfirm, 
  onCancel, 
  sourceTeams, 
  destinationTeam, 
  loading 
}) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={500}
      closeIcon={<CloseOutlined />}
      data-cy="transfer-confirmation-modal"
    >
      <div className="py-4">
        <div className="flex items-center gap-3 mb-4">
          <ExclamationCircleOutlined className="text-yellow-500 text-2xl" />
          <h3 className="text-lg font-bold text-gray-900 m-0" data-cy="transfer-confirmation-title">
            Transfer Confirmation
          </h3>
        </div>
        
        <p className="text-gray-700 mb-4" data-cy="transfer-confirmation-message">
          This action permanently transfers{' '}
          <span className="font-semibold">
            {sourceTeams.map(t => t.name).join(' and ')}
          </span>{' '}
          into{' '}
          <span className="font-semibold">{destinationTeam?.name || ''}</span> department.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 mb-2" data-cy="transfer-confirmation-what-will-change-title">
            What will Change
          </h4>
          <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
            <li data-cy="transfer-confirmation-change-1">Organization Structure</li>
            <li data-cy="transfer-confirmation-change-2">Related Employee Data</li>
            <li data-cy="transfer-confirmation-change-3">Reporting Structure will be updated</li>
          </ul>
        </div>

        <div className="flex justify-end gap-3">
          <Button onClick={onCancel} data-cy="transfer-confirmation-cancel">
            Cancel
          </Button>
          <Button
            type="primary"
            danger
            onClick={onConfirm}
            loading={loading}
            data-cy="transfer-confirmation-confirm"
          >
            Confirm Transfer
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TransferConfirmationModal;
