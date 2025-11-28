import React, { useState } from 'react';
import { Modal, Button, Switch } from 'antd';

interface Props {
  onClose: () => void;
  onGenerate: (data: Incentive) => void;
}

export interface Incentive {
  includeIncentive: boolean;
}

const GeneratePayrollModal: React.FC<Props> = ({ onClose, onGenerate }) => {
  const [includeIncentive, setIncludeIncentive] = useState(true);

  const handleGenerate = () => {
    const withIncentive: Incentive = {
      includeIncentive,
    };

    onGenerate(withIncentive);
  };

  return (
    <Modal
      centered
      data-cy="payroll-generate-modal-view-modal"
      title={
        <h2
          className="text-xl sm:text-2xl font-semibold"
          id="payroll-generate-modal-title-view-text"
          data-cy="payroll-generate-modal-title-view-text"
        >
          Generate Payroll
        </h2>
      }
      open={true} // Modify as needed for your modal visibility logic
      onCancel={onClose}
      width="95%"
      style={{ maxWidth: '400px' }}
      footer={
        <div
          className="flex justify-center items-center"
          id="payroll-generate-modal-footer-view-container"
          data-cy="payroll-generate-modal-footer-view-container"
        >
          <div className="flex space-x-4">
            <Button type="default" className="px-3" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleGenerate();
              }}
              type="primary"
              className="px-3"
            >
              Generate
            </Button>
          </div>
        </div>
      }
    >
      <div
        id="payroll-generate-modal-body-view-container"
        data-cy="payroll-generate-modal-body-view-container"
        className="flex flex-col gap-6"
      >
        <div
          id="payroll-generate-modal-incentive-toggle-view-container"
          data-cy="payroll-generate-modal-incentive-toggle-view-container"
          className="flex flex-col items-start justify-between mb-4 mt-6"
        >
          <label
            id="payroll-generate-modal-incentive-label-view-text"
            data-cy="payroll-generate-modal-incentive-label-view-text"
            className="font-medium"
          >
            Include Incentive
          </label>
          <Switch
            id="payroll-generate-modal-incentive-toggle-switch"
            data-cy="payroll-generate-modal-incentive-toggle-switch"
            checked={includeIncentive}
            onChange={(checked) => setIncludeIncentive(checked)}
            className="ml-4"
          />
        </div>

        <div
          id="payroll-generate-modal-daterange-view-container"
          data-cy="payroll-generate-modal-daterange-view-container"
          className="mb-4"
        >
          <label
            id="payroll-generate-modal-daterange-label-view-text"
            data-cy="payroll-generate-modal-daterange-label-view-text"
            className="block font-medium mb-1"
          >
            Select Date
          </label>
          <input
            id="payroll-generate-modal-daterange-view-input"
            data-cy="payroll-generate-modal-daterange-view-input"
            type="text"
            placeholder="01 Jan 2023 - 10 Mar 2023"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            disabled
          />
        </div>

        <div
          id="payroll-generate-modal-payperiod-view-container"
          data-cy="payroll-generate-modal-payperiod-view-container"
          className="mb-6"
        >
          <label
            id="payroll-generate-modal-payperiod-label-view-text"
            data-cy="payroll-generate-modal-payperiod-label-view-text"
            className="block font-medium mb-1"
          >
            Pay Period
          </label>
          <select
            id="payroll-generate-modal-payperiod-view-select"
            data-cy="payroll-generate-modal-payperiod-view-select"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            disabled
          >
            <option value="">Select Pay Period</option>
          </select>
        </div>
      </div>
    </Modal>
  );
};

export default GeneratePayrollModal;
