import React, { useState } from 'react';
import { Modal, Button, Select, Switch } from 'antd';

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
      title={<h2 className="text-2xl font-semibold">Generate Payroll</h2>}
      open={true} // Modify as needed for your modal visibility logic
      onCancel={onClose}
      width="30%"
      footer={
        <div className="flex justify-end items-center space-x-4">
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
      }
    >
      <div className="flex flex-col gap-6">
        {/* Include Incentive Toggle */}
        <div className="flex flex-col items-start justify-between mb-4 mt-6">
          <label className="font-medium">Include Incentive</label>
          <Switch
            checked={includeIncentive}
            onChange={(checked) => setIncludeIncentive(checked)}
            className="ml-4"
          />
        </div>

        {/* Date Range Input */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Select Date</label>
          <input
            type="text"
            placeholder="01 Jan 2023 - 10 Mar 2023"
            //   value={dateRange}
            //   onChange={(e) => setDateRange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            disabled // Disabled Date Range Input
          />
        </div>

        {/* Pay Period Select */}
        <div className="mb-6">
          <label className="block font-medium mb-1">Pay Period</label>
          <select
            //   value={payPeriod}
            //   onChange={(e) => setPayPeriod(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            disabled // Disabled Pay Period Select
          >
            <option value="">Select Pay Period</option>
          </select>
        </div>
      </div>
    </Modal>
  );
};

export default GeneratePayrollModal;
