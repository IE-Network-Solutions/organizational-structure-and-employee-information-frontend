'use client';

import React from 'react';
import { Modal, Button } from 'antd';
import { IoDuplicateOutline } from 'react-icons/io5';

interface DuplicateDeductionModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  employeeNames?: string[];
  deductionName?: string;
}

const DuplicateDeductionModal: React.FC<DuplicateDeductionModalProps> = ({
  open,
  onConfirm,
  onCancel,
  loading = false,
  employeeNames = [],
  deductionName = 'this deduction',
}) => {
  const modalFooter = (
    <div className="w-full flex flex-col md:flex-row justify-center items-center gap-6 mt-6">
      <Button
        className="w-70 md:w-auto px-8 py-4 text-xs font-bold"
        onClick={onCancel}
        disabled={loading}
      >
        Cancel
      </Button>
      <Button
        id="confirmDuplicateId"
        className="w-70 md:w-auto px-8 py-4 text-xs font-bold"
        type="primary"
        loading={loading}
        onClick={onConfirm}
      >
        Create
      </Button>
    </div>
  );

  return (
    <>
      <Modal
        open={open}
        width={500}
        onCancel={onCancel}
        footer={modalFooter}
        closeIcon={false}
        closable={false}
        centered
        className="duplicate-deduction-modal"
      >
        <div className="flex flex-col items-center justify-center py-6">
        {/* Icon */}
        <div className="flex justify-center items-center h-[120px] mb-4">
          <IoDuplicateOutline 
            size={120} 
            className="text-blue"
          />
        </div>

        {/* Message */}
        <p className="text-center text-2xl text-gray-800 font-bold leading-relaxed">
          There is another deduction
          <br />
          of this type are you sure you
          <br />
          want to create another
          <br />
          one?
        </p>

        {/* Employee names if provided */}
        {employeeNames.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg w-full">
            <p className="text-sm text-gray-600 font-medium mb-2">
              Employees already in {deductionName}:
            </p>
            <div className="text-sm text-gray-700">
              {employeeNames.slice(0, 3).join(', ')}
              {employeeNames.length > 3 && ` and ${employeeNames.length - 3} more`}
            </div>
          </div>
        )}
        </div>
      </Modal>
    </>
  );
};

export default DuplicateDeductionModal;
