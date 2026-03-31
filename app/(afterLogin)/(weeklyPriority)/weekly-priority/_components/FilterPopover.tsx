import React, { useState, useEffect } from 'react';
import { Button, Popover, Select, Tag } from 'antd';
import { MdOutlineFilterAlt } from 'react-icons/md';
import { useWeeklyPriorityStore } from '@/store/uistate/features/weeklyPriority/useStore';
import { useGetUserDepartment } from '@/store/server/features/okrplanning/okr/department/queries';
import { useGetWeeks } from '@/store/server/features/okrplanning/weeklyPriority/queries';
import { HiX } from 'react-icons/hi';

const FilterPopover: React.FC = () => {
  const { departmentId, setDepartmentId, weekIds, setWeekIds } =
    useWeeklyPriorityStore();

  const { data: Departments } = useGetUserDepartment();
  const { data: weeks } = useGetWeeks();

  const [open, setOpen] = useState(false);
  const [localDepartmentId, setLocalDepartmentId] = useState<
    string | undefined
  >(departmentId);
  const [localWeekIds, setLocalWeekIds] = useState<string[] | undefined>(
    weekIds,
  );

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

  const selectedDepartment = Departments?.find(
    (item: any) => item?.id === departmentId,
  );
  const selectedWeeks =
    weekIds?.map((id) => weeks?.find((item: any) => item?.id === id)) || [];

  const content = (
    <div
      className="w-[572px] max-w-[calc(100vw-48px)] min-h-[250px] flex flex-col gap-3"
      data-cy="filter-popover-content"
    >
      <div
        className="px-6 py-2"
        data-cy="filter-popover-header"
      >
        <div
          className="flex justify-between items-center"
          data-cy="filter-popover-header-row"
        >
          <span
            className="font-bold text-[16px] text-black/70"
            data-cy="filter-popover-title"
          >
            Filter
          </span>
          <Button
            type="text"
            icon={
              <HiX
                className="text-gray-400 text-[16px] w-[16px] h-[16px] inline-block"
                data-cy="filter-popover-close-icon"
              />
            }
            onClick={() => setOpen(false)}
            className="rounded-full hover:!bg-transparent"
            data-cy="filter-popover-close-button"
          />
        </div>
        <p
          className="text-[14px] font-normal text-black/70 mt-2"
          data-cy="filter-popover-description"
        >
          Select All filters that apply
        </p>
      </div>

      <div
        className="px-6 pt-0 pb-3"
        data-cy="filter-popover-mid-section"
      >
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
        data-cy="filter-popover-filters"
        >
          <div className="text-left" data-cy="filter-popover-department">
            <label
              className="block text-[14px] font-normal text-[#030712] mb-2"
              data-cy="filter-popover-department-label"
            >
              Department{' '}
              <span
                className="text-red-500 ml-0.5"
                data-cy="filter-popover-department-required"
              >
                *
              </span>
            </label>
            <Select
              placeholder="Select"
              className="w-full filter-form-select"
              value={localDepartmentId}
              onChange={(val) => setLocalDepartmentId(val)}
              allowClear
              showSearch
              optionFilterProp="children"
              data-cy="filter-popover-department-select"
            >
              {Departments?.map((item: any) => (
                <Select.Option
                  key={item?.id}
                  value={item?.id}
                  data-cy={`filter-popover-department-option-${item?.id}`}
                >
                  {item?.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div className="text-left" data-cy="filter-popover-week">
            <label
              className="block text-[14px] font-normal text-[#030712] mb-2"
              data-cy="filter-popover-week-label"
            >
              Week{' '}
              <span
                className="text-red-500 ml-0.5"
                data-cy="filter-popover-week-required"
              >
                *
              </span>
            </label>
            <div
              className="relative"
              data-cy="filter-popover-week-select-wrap"
            >
              <Select
                placeholder=""
                className="w-full filter-form-select filter-week-select"
                value={localWeekIds}
                onChange={(val) => setLocalWeekIds(val)}
                allowClear
                mode="multiple"
                maxTagCount={0}
                maxTagPlaceholder={() => null}
                showSearch
                optionFilterProp="children"
                data-cy="filter-popover-week-select"
              >
                {weeks?.map((item: any) => (
                  <Select.Option
                    key={item?.id}
                    value={item?.id}
                    data-cy={`filter-popover-week-option-${item?.id}`}
                  >
                    {item?.title}
                  </Select.Option>
                ))}
              </Select>
              <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[14px] font-normal text-black/40"
                data-cy="filter-popover-week-select-hint"
              >
                select
              </span>
            </div>
            {!!localWeekIds?.length && (
              <div
                className="mt-2 flex flex-wrap gap-2"
                data-cy="filter-popover-week-tags"
              >
                {localWeekIds.map((id) => {
                  const selectedWeek = weeks?.find((item: any) => item?.id === id);
                  return (
                    <Tag
                      key={id}
                      closable
                      onClose={(e) => {
                        e.preventDefault();
                        setLocalWeekIds((prev) =>
                          (prev || []).filter((weekId) => weekId !== id),
                        );
                      }}
                      className="week-selection-tag m-0 h-[24px] leading-[22px] px-2 py-[1px] rounded-[4px] border border-[#d1d5db] bg-[#00000005] text-[14px] font-normal text-black/70 inline-flex items-center gap-1"
                      data-cy={`filter-popover-week-tag-${id}`}
                    >
                      {selectedWeek?.title || id}
                    </Tag>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="px-6 pt-0 pb-5 flex justify-end gap-3"
        data-cy="filter-popover-actions"
      >
        <Button
          onClick={handleReset}
          className="h-[32px] px-4 text-[14px] font-normal text-[#111827] border-gray-200 rounded-[6px]"
          data-cy="filter-popover-reset-button"
        >
          <span data-cy="filter-popover-reset-button-text">Reset</span>
        </Button>
        <Button
          type="primary"
          onClick={handleSave}
          className="bg-[#254ec2] hover:bg-[#1e3e9a] h-[32px] px-4 text-[14px] font-normal text-white rounded-[6px] border-none"
          data-cy="filter-popover-save-button"
        >
          Save Filter
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <style data-cy="filter-popover-overrides">{`
        /* Remove AntD default padding so our 24px insets apply from the edges */
        .pixel-perfect-popover .ant-popover-inner {
          padding: 0 !important;
        }
        .pixel-perfect-popover .ant-popover-content {
          padding: 0 !important;
        }
        .pixel-perfect-popover .filter-form-select .ant-select-selector {
          min-height: 40px !important;
          height: 40px !important;
          border-radius: 8px !important;
          border-color: #d1d5db !important;
          align-items: center !important;
        }
        .pixel-perfect-popover .filter-form-select.ant-select-multiple .ant-select-selector {
          height: auto !important;
          min-height: 40px !important;
          padding-top: 4px !important;
          padding-bottom: 4px !important;
          align-items: flex-start !important;
        }
        .pixel-perfect-popover .filter-form-select.ant-select-multiple .ant-select-selection-item {
          height: 24px !important;
          line-height: 24px !important;
          background: #f9fafb !important;
          border: 1px solid #d1d5db !important;
          border-radius: 4px !important;
          color: rgba(0, 0, 0, 0.7) !important;
          font-size: 14px !important;
          font-weight: 400 !important;
          padding-block: 0 !important;
          padding-inline: 12px !important;
        }
        .pixel-perfect-popover .filter-form-select .ant-select-selection-placeholder,
        .pixel-perfect-popover .filter-form-select .ant-select-selection-item {
          font-size: 14px !important;
        }
        .pixel-perfect-popover .filter-week-select.ant-select-multiple .ant-select-selection-overflow {
          display: none !important;
        }
        .saved-filter-tag .ant-tag-close-icon {
          margin-inline-start: 4px;
        }
        .week-selection-tag .ant-tag-close-icon {
          margin-inline-start: 4px;
          color: rgba(0, 0, 0, 0.7);
        }
      `}</style>
      <div
        className="flex items-center gap-2 mb-3 mr-1"
        data-cy="filter-popover-trigger-area"
      >
        {!!selectedDepartment && (
          <Tag
            closable
            onClose={(e) => {
              e.preventDefault();
              setDepartmentId('');
              setLocalDepartmentId(undefined);
            }}
            className="saved-filter-tag hidden md:inline-flex m-0 h-[28px] leading-[24px] px-[6px] py-[2px] rounded-[6px] border border-[#d1d5db] bg-[#f9fafb] text-[14px] font-normal text-black/70 items-center gap-1"
            data-cy="filter-popover-selected-department-tag"
          >
            {selectedDepartment?.name}
          </Tag>
        )}
        {selectedWeeks.map((week: any, index: number) => (
          <Tag
            key={week?.id || `week-${index}`}
            closable
            onClose={(e) => {
              e.preventDefault();
              const weekIdToRemove = week?.id || weekIds?.[index];
              const updatedWeeks = (weekIds || []).filter(
                (id) => id !== weekIdToRemove,
              );
              setWeekIds(updatedWeeks);
              setLocalWeekIds(updatedWeeks);
            }}
            className="saved-filter-tag hidden md:inline-flex m-0 h-[28px] leading-[24px] px-[6px] py-[2px] rounded-[6px] border border-[#d1d5db] bg-[#f9fafb] text-[14px] font-normal text-black/70 items-center gap-1"
            data-cy={`filter-popover-selected-week-tag-${week?.id || index}`}
          >
            {week?.title || weekIds?.[index]}
          </Tag>
        ))}
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
            icon={
              <MdOutlineFilterAlt className="w-[16px] h-[16px] text-[16px] text-[#030712]" />
            }
            className="flex items-center gap-2 h-9 border-gray-200 text-gray-600 rounded-[8px] px-[15px] font-medium"
            data-cy="filter-popover-trigger-button"
          >
            <span
              className="text-sm md:text-base"
              data-cy="filter-popover-trigger-text"
            >
              Filter
            </span>
          </Button>
        </Popover>
      </div>
    </>
  );
};

export default FilterPopover;
