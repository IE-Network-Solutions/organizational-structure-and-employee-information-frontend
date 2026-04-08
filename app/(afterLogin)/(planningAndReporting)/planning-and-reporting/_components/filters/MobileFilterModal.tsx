import React from 'react';
import { Modal, Select, Button } from 'antd';
import SessionFilter from './SessionFilter';

interface MobileFilterModalProps {
  open: boolean;
  onClose: () => void;
  onApply: () => void;
  // Props for Plan Type
  planTypeOptions: { label: string; value: string }[];
  selectedPlanType: string;
  onPlanTypeChange: (value: string) => void;
  // Props for Department
  departmentOptions: { label: string; value: string }[];
  selectedDepartment: string | undefined;
  onDepartmentChange: (value: string) => void;
  showPlanType?: boolean;
  showDepartment?: boolean;
}

export const MobileFilterModal: React.FC<MobileFilterModalProps> = ({
  open,
  onClose,
  onApply,
  planTypeOptions,
  selectedPlanType,
  onPlanTypeChange,
  departmentOptions,
  selectedDepartment,
  onDepartmentChange,
  showPlanType = true,
  showDepartment = true,
}) => {
  return (
    <Modal
      title="Filters"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} size="large" className="w-[48%]">
          Cancel
        </Button>,
        <Button
          key="apply"
          type="primary"
          onClick={onApply}
          size="large"
          className="w-[48%] bg-[#1E40AF] text-white hover:bg-[#1E3A8A]"
        >
          Apply Filters
        </Button>,
      ]}
      className="mobile-filter-modal"
      centered
    >
      <div
        data-cy="planning-and-reporting-components-filters-mobilefiltermodal-tsx-mobilefiltermodal-div-56"
        className="flex flex-col gap-4 py-4"
      >
        {/* Plan Type */}
        {showPlanType && (
          <div
            data-cy="planning-and-reporting-components-filters-mobilefiltermodal-tsx-mobilefiltermodal-div-59"
            className="flex flex-col gap-2"
          >
            <span
              data-cy="planning-and-reporting-components-filters-mobilefiltermodal-tsx-mobilefiltermodal-span-60"
              className="text-sm font-medium text-gray-700"
            >
              Plan Type
            </span>
            <Select
              className="w-full [&_.ant-select-selector]:!border-[#E5E7EB] [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!bg-[#FFFFFF] [&_.ant-select-selector]:!py-2.5 [&_.ant-select-selector]:!px-3 [&_.ant-select-selector]:!min-h-[48px] [&_.ant-select-selector]:!h-12 [&_.ant-select-selection-placeholder]:!text-[#8F94A3] [&_.ant-select-selection-placeholder]:!leading-7 [&_.ant-select-selection-placeholder]:!pt-0 [&_.ant-select-selection-item]:!text-[#161A2C] [&_.ant-select-selection-item]:!leading-7 [&_.ant-select-selection-item]:!pt-0 [&.ant-select]:!h-12"
              placeholder="Plan type"
              options={planTypeOptions}
              onChange={onPlanTypeChange}
              value={selectedPlanType}
              size="large"
            />
          </div>
        )}

        {/* Department */}
        {showDepartment && (
          <div
            data-cy="planning-and-reporting-components-filters-mobilefiltermodal-tsx-mobilefiltermodal-div-74"
            className="flex flex-col gap-2"
          >
            <span
              data-cy="planning-and-reporting-components-filters-mobilefiltermodal-tsx-mobilefiltermodal-span-75"
              className="text-sm font-medium text-gray-700"
            >
              Department
            </span>
            <Select
              className="w-full [&_.ant-select-selector]:!border-[#E5E7EB] [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!bg-[#FFFFFF] [&_.ant-select-selector]:!py-2.5 [&_.ant-select-selector]:!px-3 [&_.ant-select-selector]:!min-h-[48px] [&_.ant-select-selector]:!h-12 [&_.ant-select-selection-placeholder]:!text-[#8F94A3] [&_.ant-select-selection-placeholder]:!leading-7 [&_.ant-select-selection-placeholder]:!pt-0 [&_.ant-select-selection-item]:!text-[#161A2C] [&_.ant-select-selection-item]:!leading-7 [&_.ant-select-selection-item]:!pt-0 [&.ant-select]:!h-12"
              placeholder="Department"
              options={departmentOptions}
              onChange={onDepartmentChange}
              value={selectedDepartment || 'all'}
              size="large"
              showSearch
              optionFilterProp="label"
            />
          </div>
        )}

        {/* Session Filter */}
        <div
          data-cy="planning-and-reporting-components-filters-mobilefiltermodal-tsx-mobilefiltermodal-div-92"
          className="flex flex-col gap-2"
        >
          <span
            data-cy="planning-and-reporting-components-filters-mobilefiltermodal-tsx-mobilefiltermodal-span-93"
            className="text-sm font-medium text-gray-700"
          >
            Session
          </span>
          <div
            data-cy="planning-and-reporting-components-filters-mobilefiltermodal-tsx-mobilefiltermodal-div-94"
            className="flex flex-col gap-3"
          >
            <SessionFilter />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MobileFilterModal;
