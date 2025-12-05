'use client';

import React from 'react';
import { Modal, Button } from 'antd';

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
}) => {
  const modalFooter = (
    <div
      className="w-full flex justify-center items-center gap-4"
      data-cy="duplicate-deduction-modal-footer"
    >
      <Button
        className="px-8 py-3 text-base font-medium border border-gray-300"
        onClick={onCancel}
        disabled={loading}
        data-cy="duplicate-deduction-modal-cancel-button"
      >
        Cancel
      </Button>
      <Button
        id="confirmDuplicateId"
        className="px-8 py-3 text-base font-medium"
        type="primary"
        loading={loading}
        onClick={onConfirm}
        data-cy="duplicate-deduction-modal-confirm-button"
      >
        Create
      </Button>
    </div>
  );

  return (
    <>
      <Modal
        data-cy="duplicate-deduction-modal"
        open={open}
        width={400}
        style={{ height: 500, zIndex: 9999 }}
        onCancel={onCancel}
        footer={modalFooter}
        closeIcon={false}
        closable={false}
        centered
        className="duplicate-deduction-modal"
        getContainer={() => document.body}
      >
        <div className="py-4" data-cy="duplicate-deduction-modal-content">
          {/* Title */}
          <h3
            className="text-xl font-bold text-gray-800 mb-4 text-center"
            data-cy="duplicate-deduction-modal-title"
          >
            These are similar deductions of the same type
          </h3>

          {/* Employee name tags */}
          {employeeNames.length > 0 && (
            <div
              className="flex gap-2 mb-4 p-3 bg-gray-50 border border-gray-300 rounded-lg overflow-x-auto"
              data-cy="duplicate-deduction-modal-employee-names"
            >
              {employeeNames.map((name, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md whitespace-nowrap flex-shrink-0"
                  data-cy={`duplicate-deduction-modal-employee-name-${index}`}
                >
                  {name}
                </span>
              ))}
            </div>
          )}

          {/* Confirmation question */}
          <p
            className="text-xl font-bold text-gray-800 text-center"
            data-cy="duplicate-deduction-modal-confirmation-message"
          >
            Are you sure you want to create another one?
          </p>
        </div>
      </Modal>
    </>
  );
};

export default DuplicateDeductionModal;
