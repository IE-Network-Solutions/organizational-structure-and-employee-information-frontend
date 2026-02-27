
import React, { useState, useEffect } from 'react';
import { Button, Popover, Select } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { useWeeklyPriorityStore } from '@/store/uistate/features/weeklyPriority/useStore';
import { useGetUserDepartment } from '@/store/server/features/okrplanning/okr/department/queries';
import { useGetWeeks } from '@/store/server/features/okrplanning/weeklyPriority/queries';
import { HiX } from 'react-icons/hi';

const FilterPopover: React.FC = () => {
    const {
        departmentId,
        setDepartmentId,
        weekIds,
        setWeekIds,
    } = useWeeklyPriorityStore();

    const { data: Departments } = useGetUserDepartment();
    const { data: weeks } = useGetWeeks();

    const [open, setOpen] = useState(false);
    const [localDepartmentId, setLocalDepartmentId] = useState<string | undefined>(departmentId);
    const [localWeekIds, setLocalWeekIds] = useState<string[] | undefined>(weekIds);

    useEffect(() => {
        if (open) {
            setLocalDepartmentId(departmentId || undefined);
            setLocalWeekIds(weekIds || []);
        }
    }, [open, departmentId, weekIds]);

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
    };

    const handleReset = () => {
        setLocalDepartmentId(undefined);
        setLocalWeekIds([]);
    };

    const handleSave = () => {
        setDepartmentId(localDepartmentId || '');
        setWeekIds(localWeekIds || []);
        setOpen(false);
    };

    const content = (
        <div className="w-[calc(100vw-48px)] md:w-[480px] p-2" data-cy="filter-popover-content">
            <div className="flex justify-between items-center mb-1" data-cy="filter-popover-header">
                <span className="font-bold text-[18px] text-[#111827]" data-cy="filter-popover-title">Filter</span>
                <Button
                    type="text"
                    icon={<HiX className="text-gray-400" />}
                    onClick={() => setOpen(false)}
                    className="hover:bg-gray-100 rounded-full"
                    data-cy="filter-popover-close-button"
                />
            </div>
            <p className="text-gray-400 mb-6 text-sm" data-cy="filter-popover-description">Select All filters that apply</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8" data-cy="filter-popover-filters">
                <div className="text-left" data-cy="filter-popover-department">
                    <label className="block text-[13px] font-semibold text-[#111827] mb-2" data-cy="filter-popover-department-label">
                        Department <span className="text-red-500 ml-0.5" data-cy="filter-popover-department-required">*</span>
                    </label>
                    <Select
                        placeholder="Select"
                        className="w-full h-[44px]"
                        value={localDepartmentId}
                        onChange={(val) => setLocalDepartmentId(val)}
                        allowClear
                        showSearch
                        optionFilterProp="children"
                        data-cy="filter-popover-department-select"
                    >
                        {Departments?.map((item: any) => (
                            <Select.Option key={item?.id} value={item?.id} data-cy={`filter-popover-department-option-${item?.id}`}>
                                {item?.name}
                            </Select.Option>
                        ))}
                    </Select>
                </div>

                <div className="text-left" data-cy="filter-popover-week">
                    <label className="block text-[13px] font-semibold text-[#111827] mb-2" data-cy="filter-popover-week-label">
                        Week <span className="text-red-500 ml-0.5" data-cy="filter-popover-week-required">*</span>
                    </label>
                    <Select
                        placeholder="Select"
                        className="w-full h-[44px]"
                        value={localWeekIds}
                        onChange={(val) => setLocalWeekIds(val)}
                        allowClear
                        mode="multiple"
                        maxTagCount="responsive"
                        showSearch
                        optionFilterProp="children"
                        data-cy="filter-popover-week-select"
                    >
                        {weeks?.map((item: any) => (
                            <Select.Option key={item?.id} value={item?.id} data-cy={`filter-popover-week-option-${item?.id}`}>
                                {item?.title}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-2" data-cy="filter-popover-actions">
                <Button
                    onClick={handleReset}
                    className="h-[40px] px-6 text-[#111827] font-semibold border-gray-200 rounded-[8px]"
                    data-cy="filter-popover-reset-button"
                >
                    <span data-cy="filter-popover-reset-button-text">Reset</span>
                </Button>
                <Button
                    type="primary"
                    onClick={handleSave}
                    className="bg-[#254ec2] hover:bg-[#1e3e9a] h-[40px] px-6 text-white font-semibold rounded-[8px] border-none"
                    data-cy="filter-popover-save-button"
                >
                    Save Filter
                </Button>
            </div>
        </div>
    );

    return (
        <Popover
            content={content}
            trigger="click"
            open={open}
            onOpenChange={handleOpenChange}
            placement="bottomRight"
            overlayClassName="pixel-perfect-popover"
            data-cy="filter-popover"
        >
            <Button
                icon={<FilterOutlined className="text-xs" />}
                className="flex items-center gap-2 h-9 border-gray-200 text-gray-600 rounded-[6px] px-3 md:px-4 font-medium"
                data-cy="filter-popover-trigger-button"
            >
                <span className="text-sm md:text-base" data-cy="filter-popover-trigger-text">Filter</span>
            </Button>
        </Popover>
    );
};

export default FilterPopover;
