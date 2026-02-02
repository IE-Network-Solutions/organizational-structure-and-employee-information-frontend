'use client';
import React from 'react';
import { Select } from 'antd';
import SessionFilter from '@/app/(afterLogin)/(planningAndReporting)/planning-and-reporting/_components/filters/SessionFilter';

const { Option } = Select;

interface PlanFiltersProps {
    employeeOptions: any[];
    selectedEmployee: string | undefined;
    handleEmployeeChange: (value: string) => void;

    planTypeOptions: any[];
    selectedPlanType: string;
    handlePlanTypeChange: (value: string) => void;

    departmentOptions: any[];
    selectedDepartment: string;
    handleDepartmentChange: (value: string) => void;

    loadingEmployees: boolean;
}

export default function PlanFilters({
    employeeOptions,
    selectedEmployee,
    handleEmployeeChange,
    planTypeOptions,
    selectedPlanType,
    handlePlanTypeChange,
    departmentOptions,
    selectedDepartment,
    handleDepartmentChange,
    loadingEmployees
}: PlanFiltersProps) {
    const selectClassName = "w-full min-w-[180px] flex-1 md:w-auto [&_.ant-select-selector]:!border-[#E5E7EB] [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!bg-white [&_.ant-select-selector]:!py-2.5 [&_.ant-select-selector]:!px-3 [&_.ant-select-selector]:!min-h-[48px] [&_.ant-select-selector]:!h-12 [&_.ant-select-selection-placeholder]:!text-[#8F94A3] [&_.ant-select-selection-placeholder]:!leading-7 [&_.ant-select-selection-placeholder]:!pt-0 [&_.ant-select-selection-item]:!text-[#161A2C] [&_.ant-select-selection-item]:!leading-7 [&_.ant-select-selection-item]:!pt-0 [&.ant-select]:!h-12 [&.ant-select-focused_.ant-select-selector]:!border-[#574CFF] [&.ant-select-focused_.ant-select-selector]:!shadow-[0_0_0_2px_rgba(87,76,255,0.1)] [&.ant-select-focused_.ant-select-selector]:!bg-white [&.ant-select-open_.ant-select-selector]:!bg-white";

    return (
        <div className="flex flex-wrap items-center gap-4 w-full basic-okr-filters">
            <Select
                className={selectClassName}
                placeholder="Select employee"
                options={employeeOptions}
                onChange={handleEmployeeChange}
                value={selectedEmployee}
                loading={loadingEmployees}
                size="large"
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                    option?.label
                        ?.toString()
                        .toLowerCase()
                        .includes(input.toLowerCase()) ?? false
                }
            />

            <Select
                className={selectClassName}
                placeholder="Plan type"
                options={planTypeOptions}
                onChange={handlePlanTypeChange}
                value={selectedPlanType}
                size="large"
            />

            <Select
                className={selectClassName}
                placeholder="Department"
                options={departmentOptions}
                onChange={handleDepartmentChange}
                value={selectedDepartment}
                size="large"
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                    option?.label
                        ?.toString()
                        .toLowerCase()
                        .includes(input.toLowerCase()) ?? false
                }
            />

            <SessionFilter />

            <style jsx global>{`
                .basic-okr-filters .ant-select-selector {
                    background-color: white !important;
                }
            `}</style>
        </div>
    );
}
