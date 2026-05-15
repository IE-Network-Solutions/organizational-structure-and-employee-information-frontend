import { Button, Dropdown, Empty, Input } from 'antd';
import type { MenuProps } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { AttendanceRule } from '@/types/timesheet/attendance';
import React, { FC, useMemo, useState } from 'react';
import { useDebounce } from '@/utils/useDebounce';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import { useDeleteAttendanceRule } from '@/store/server/features/timesheet/attendanceNotificationRule/mutation';
import {
  useGetAttendanceRules,
  useGetAttendanceRuleTypes,
} from '@/store/server/features/timesheet/attendanceNotificationRule/queries';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import DeleteModal from '@/components/common/deleteConfirmationModal';

const ALL_RULE_TYPE_FILTER_ID = 'all';

const TypeTable: FC = () => {
  const { setAttendanceRuleId, setIsShowCreateRuleSidebar } =
    useTimesheetSettingsStore();
  const { mutate: deleteRule, isLoading: isLoadingDeleteRule } =
    useDeleteAttendanceRule();

  const [selectedRuleTypeId, setSelectedRuleTypeId] = useState(
    ALL_RULE_TYPE_FILTER_ID,
  );
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [rulePendingDeleteId, setRulePendingDeleteId] = useState<string | null>(
    null,
  );

  const applyDebouncedSearch = useDebounce((value: string) => {
    setDebouncedSearch(value.trim());
  }, 500);

  const ruleFilters = useMemo(() => {
    const trimmedSearch = debouncedSearch.trim();
    return {
      ruleTypeId:
        selectedRuleTypeId === ALL_RULE_TYPE_FILTER_ID
          ? undefined
          : selectedRuleTypeId,
      ...(trimmedSearch ? { search: trimmedSearch } : {}),
      page: 1,
      limit: 10,
    };
  }, [selectedRuleTypeId, debouncedSearch]);

  const { data: attendanceRulesData, isLoading } =
    useGetAttendanceRules(ruleFilters);

  const tableData = attendanceRulesData?.items ?? [];
  const { data: attendanceRuleTypesData } = useGetAttendanceRuleTypes();

  const ruleTypeFilters = [
    { id: ALL_RULE_TYPE_FILTER_ID, title: 'All' },
    ...(attendanceRuleTypesData?.items?.map((rule) => ({
      id: rule.id,
      title: rule.name,
    })) ?? []),
  ];

  const selectedRuleType = useMemo(
    () => ruleTypeFilters.find((filter) => filter.id === selectedRuleTypeId),
    [ruleTypeFilters, selectedRuleTypeId],
  );

  const mobileRuleTypeFilterItems = useMemo<MenuProps['items']>(
    () =>
      ruleTypeFilters.map((filter) => ({
        key: filter.id,
        label: filter.title,
      })),
    [ruleTypeFilters],
  );

  const ruleMenuItems = useMemo(
    () =>
      (rule: AttendanceRule): MenuProps['items'] => [
        {
          key: 'edit',
          label: (
            <span
              className="flex items-center gap-2 text-sm text-gray-700"
              data-cy={`time-attendance-settings-attendance-rules-type-table-rule-menu-edit-${rule.id}`}
            >
              <EditOutlinedIcon
                sx={{ fontSize: 18 }}
                className="text-gray-600"
              />
              Edit Rule
            </span>
          ),
          onClick: () => {
            setAttendanceRuleId(rule.id);
            setIsShowCreateRuleSidebar(true);
          },
        },
        {
          key: 'delete',
          label: (
            <span
              className="flex items-center gap-2 text-sm text-gray-700"
              data-cy={`time-attendance-settings-attendance-rules-type-table-rule-menu-delete-${rule.id}`}
            >
              <DeleteOutlineIcon
                sx={{ fontSize: 18 }}
                className="text-gray-600"
              />
              Delete Rule
            </span>
          ),
          onClick: () => setRulePendingDeleteId(rule.id),
        },
      ],
    [setAttendanceRuleId, setIsShowCreateRuleSidebar],
  );

  return (
    <>
      <div
        id="time-attendance-settings-attendance-rules-type-table-filter-container"
        data-cy="time-attendance-settings-attendance-rules-type-table-filter-container"
        className="mb-4 flex items-center justify-between gap-3"
      >
        <Input
          placeholder="Search rules"
          className="min-w-0 flex-1 pr-0 py-0 h-8 sm:h-8 sm:w-[300px] sm:flex-none"
          allowClear
          value={searchText}
          onChange={(e) => {
            const value = e.target.value;
            setSearchText(value);
            applyDebouncedSearch(value);
          }}
          data-cy="time-attendance-settings-attendance-rules-search-input"
          suffix={
            <div
              className="text-gray-400 border-l border-gray-300 py-1 px-2"
              data-cy="components-approval-approvalfiltercomponent-index-tsx-index-search-input-suffix"
            >
              <SearchOutlined />
            </div>
          }
        />
        <Dropdown
          className="sm:hidden"
          menu={{
            items: mobileRuleTypeFilterItems,
            selectedKeys: [selectedRuleTypeId],
            onClick: ({ key }) => setSelectedRuleTypeId(key),
          }}
          trigger={['click']}
        >
          <Button
            type="default"
            className="!inline-flex h-10 min-w-0 max-w-[min(168px,42vw)] shrink-0 items-center gap-1.5 overflow-hidden border border-[#d9d9d9] font-normal"
            id="time-attendance-settings-attendance-rules-mobile-filter-dropdown-button"
            data-cy="time-attendance-settings-attendance-rules-mobile-filter-dropdown-button"
            icon={<FilterAltOutlinedIcon className="text-sm shrink-0" />}
          >
            <span
              data-cy="time-attendance-settings-attendance-rules-mobile-filter-dropdown-button-text"
              className="min-w-0 flex-1 truncate text-left"
              title={selectedRuleType?.title}
            >
              {selectedRuleType?.title || 'Filter'}
            </span>
          </Button>
        </Dropdown>
        <div
          id="time-attendance-settings-attendance-rules-type-table-filter-chips-container"
          data-cy="time-attendance-settings-attendance-rules-type-table-filter-chips-container"
          className="hidden sm:flex items-center gap-2 flex-wrap justify-end"
        >
          {ruleTypeFilters.map((filter) => (
            <button
              type="button"
              key={filter.id}
              onClick={() => setSelectedRuleTypeId(filter.id)}
              className={`rounded border px-3 py-1 text-xs ${
                filter.id === selectedRuleTypeId
                  ? 'border-[#2155CD] bg-[#EFF4FF] text-[#2155CD]'
                  : 'border-gray-200 bg-gray-50 text-gray-600'
              }`}
              id={`time-attendance-settings-attendance-rules-rule-type-chip-${filter.id}`}
              data-cy={`time-attendance-settings-attendance-rules-rule-type-chip-${filter.id}`}
            >
              {filter.title}
            </button>
          ))}
        </div>
      </div>

      {isLoading || isLoadingDeleteRule ? (
        <div
          id="time-attendance-settings-attendance-rules-type-table-skeleton-container"
          data-cy="time-attendance-settings-attendance-rules-type-table-skeleton-container"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {Array.from({ length: 6 }).map((notUsed, index) => (
            <div
              key={index}
              className="min-h-[88px] rounded-xl bg-gray-100 animate-pulse"
              id={`time-attendance-settings-attendance-rules-type-table-card-skeleton-${index}`}
              data-cy={`time-attendance-settings-attendance-rules-type-table-card-skeleton-${index}`}
            />
          ))}
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-fr"
          id="time-attendance-settings-attendance-rules-type-table"
          data-cy="time-attendance-settings-attendance-rules-type-table"
        >
          {tableData.length === 0 ? (
            <div
              className="col-span-full"
              id="time-attendance-settings-attendance-rules-type-table-empty"
              data-cy="time-attendance-settings-attendance-rules-type-table-empty"
            >
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
          ) : (
            tableData.map((rule) => {

              return (
                <div
                  key={rule.id}
                  className="flex h-full min-h-[88px] flex-col rounded-xl bg-[#F3F4F6] p-4"
                  id={`time-attendance-settings-attendance-rules-type-table-card-${rule.id}`}
                  data-cy={`time-attendance-settings-attendance-rules-type-table-card-${rule.id}`}
                >
                  <div
                    id="time-attendance-settings-attendance-rules-type-table-row-container"
                    data-cy="time-attendance-settings-attendance-rules-type-table-row-container"
                    className="flex min-w-0 items-start gap-2"
                  >
                    <div
                      id="time-attendance-settings-attendance-rules-type-table-row-content-container"
                      data-cy="time-attendance-settings-attendance-rules-type-table-row-content-container"
                      className="min-w-0 flex-1"
                    >
                      <p
                        className="text-sm font-bold leading-snug text-gray-900 line-clamp-2 break-words"
                        id="time-attendance-settings-attendance-rules-type-table-row-title"
                        data-cy="time-attendance-settings-attendance-rules-type-table-row-title"
                        title={rule.name}
                      >
                        {rule.name}
                      </p>
                      {rule.description ? (
                        <p
                          className="mt-1 text-sm font-normal leading-snug text-gray-500 line-clamp-2 break-words"
                          id="time-attendance-settings-attendance-rules-type-table-row-description"
                          data-cy="time-attendance-settings-attendance-rules-type-table-row-description"
                          title={rule.description}
                        >
                          {rule.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="shrink-0 -mr-1">
                      <AccessGuard
                        permissions={[
                          Permissions.UpdateAttendanceRule,
                          Permissions.DeleteAttendanceRule,
                        ]}
                        data-cy="time-attendance-settings-attendance-rules-type-table-row-actions-access-guard"
                      >
                        <Dropdown
                          trigger={['click']}
                          placement="bottomRight"
                          menu={{ items: ruleMenuItems(rule) }}
                          overlayClassName="attendance-rules-rule-card-menu"
                        >
                          <Button
                            type="text"
                            size="small"
                            disabled={isLoading || isLoadingDeleteRule}
                            id={`time-attendance-settings-attendance-rules-type-table-row-menu-${rule.id}`}
                            data-cy="time-attendance-settings-attendance-rules-type-table-row-action-buttons"
                            aria-label="Rule actions"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizIcon
                              sx={{ fontSize: 20 }}
                              className="text-gray-600"
                            />
                          </Button>
                        </Dropdown>
                      </AccessGuard>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <DeleteModal
        open={rulePendingDeleteId !== null}
        loading={isLoadingDeleteRule}
        title="Delete Rule"
        deleteMessage="Are you sure you want to delete this rule?"
        hideImage
        danger
        onCancel={() => setRulePendingDeleteId(null)}
        onConfirm={() => {
          if (!rulePendingDeleteId) return;
          deleteRule(rulePendingDeleteId, {
            onSettled: () => setRulePendingDeleteId(null),
          });
        }}
        data-cy="time-attendance-settings-attendance-rules-type-table-rule-delete-modal"
        id="time-attendance-settings-attendance-rules-type-table-rule-delete-modal"
      />
    </>
  );
};

export default TypeTable;
