'use client';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import React, { useEffect, useMemo, useState } from 'react';
import LeaveBalanceTable from './_components/leaveBalanceTable';
import { Button, Dropdown, Form, Select } from 'antd';
import type { MenuProps } from 'antd';
import { useTimesheetFilterUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useLeaveBalanceStore } from '@/store/uistate/features/timesheet/leaveBalance';
import { useGetLeaveTypes } from '@/store/server/features/timesheet/leaveType/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { SearchOutlined } from '@ant-design/icons';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import {
  TIMESHEET_EMPLOYMENT_STATUS_ACTIVE,
  TIMESHEET_EMPLOYMENT_STATUS_INACTIVE,
  isTimesheetInactiveStatus,
  type TimesheetEmploymentStatus,
} from '@/utils/timesheetEmploymentStatus';

const LeaveBalance = () => {
  const [form] = Form.useForm();
  const { userId } = useAuthenticationStore();
  const [showAllLeaveTypes, setShowAllLeaveTypes] = useState(false);

  const {
    selectedUserId,
    leaveTypeId,
    employmentStatus,
    setLeaveTypeId,
    setUserId,
    setEmploymentStatus,
  } = useLeaveBalanceStore();
  const { data: users, isLoading: usersLoading } =
    useTimesheetFilterUsers(employmentStatus);
  const { data: leaveTypes } = useGetLeaveTypes();
  const isInactiveView = isTimesheetInactiveStatus(employmentStatus);

  const handleChange = (values: any) => {
    setUserId(values || '');
  };

  const handleEmploymentStatusChange = (value?: TimesheetEmploymentStatus) => {
    const next = value || TIMESHEET_EMPLOYMENT_STATUS_ACTIVE;
    setEmploymentStatus(next);
    setUserId('');
    form.setFieldsValue({
      employmentStatus: next,
      userId: undefined,
    });
  };

  useEffect(() => {
    if (isInactiveView) {
      return;
    }
    if (!usersLoading && users?.items && userId) {
      setUserId(userId);
      form.setFieldsValue({
        userId: userId || '',
        employmentStatus,
      });
    }
  }, [
    userId,
    form,
    usersLoading,
    users,
    isInactiveView,
    setUserId,
    employmentStatus,
  ]);

  const handleLeaveChange = (values: any) => {
    const nextLeaveTypeId = leaveTypeId === values ? '' : values || '';
    setLeaveTypeId(nextLeaveTypeId);
  };
  const allLeaveTypes = useMemo(
    () => leaveTypes?.items || [],
    [leaveTypes?.items],
  );
  const visibleLeaveTypes = useMemo(() => {
    return showAllLeaveTypes ? allLeaveTypes : allLeaveTypes.slice(0, 3);
  }, [allLeaveTypes, showAllLeaveTypes]);
  const selectedLeaveType = useMemo(
    () => allLeaveTypes.find((item: any) => item?.id === leaveTypeId),
    [allLeaveTypes, leaveTypeId],
  );
  const mobileFilterItems = useMemo<MenuProps['items']>(
    () => [
      { key: '__all__', label: 'All Leave Types' },
      ...allLeaveTypes.map((item: any) => ({
        key: item?.id || '',
        label: item?.title || 'Untitled',
      })),
    ],
    [allLeaveTypes],
  );

  const employeeOptions = useMemo(
    () =>
      users?.items?.map((list: any) => ({
        value: list?.id,
        label: `${list?.firstName ? list?.firstName : ''} ${list?.middleName ? list?.middleName : ''} ${list?.lastName ? list?.lastName : ''}`,
      })) || [],
    [users?.items],
  );

  useEffect(() => {
    if (!selectedUserId) {
      setShowAllLeaveTypes(false);
    }
  }, [selectedUserId]);

  const statusSelect = (
    <Select
      placeholder="Status"
      className="w-[140px] shrink-0 [&_.ant-select-selector]:!h-8 [&_.ant-select-selector]:!items-center"
      value={employmentStatus}
      onChange={handleEmploymentStatusChange}
      options={[
        { value: TIMESHEET_EMPLOYMENT_STATUS_ACTIVE, label: 'Active' },
        { value: TIMESHEET_EMPLOYMENT_STATUS_INACTIVE, label: 'Inactive' },
      ]}
      id="time-attendance-leave-balance-employment-status"
      data-cy="time-attendance-leave-balance-employment-status"
    />
  );

  return (
    <div
      className="h-auto w-auto bg-white rounded-lg"
      id="time-attendance-leave-balance-page-container"
      data-cy="time-attendance-leave-balance-page-container"
    >
      <BlockWrapper
        className="bg-white"
        data-cy="time-attendance-leave-balance-block-wrapper"
      >
        <div
          id="time-attendance-leave-balance-filter-form-container"
          data-cy="time-attendance-leave-balance-filter-form-container"
        >
          <div
            className="sm:hidden"
            data-cy="time-attendance-leave-balance-mobile-filter"
          >
            <Form
              form={form}
              initialValues={{
                employmentStatus: TIMESHEET_EMPLOYMENT_STATUS_ACTIVE,
              }}
              id="time-attendance-leave-balance-mobile-filter-form"
              data-cy="time-attendance-leave-balance-mobile-filter-form"
              className="flex min-w-0 items-center gap-3"
            >
              <Form.Item className="mb-0 shrink-0">{statusSelect}</Form.Item>
              <Form.Item
                id="filterByLeaveRequestUserIdsMobile"
                name="userId"
                className="mb-0 min-w-0 flex-1"
                data-cy="time-attendance-leave-balance-mobile-user-select-form-item"
              >
                <Select
                  showSearch
                  onChange={handleChange}
                  placeholder="Search Employee"
                  className="w-full h-11"
                  allowClear
                  loading={usersLoading}
                  optionFilterProp="label"
                  suffixIcon={<SearchOutlined className="text-[#3B3B3B]" />}
                  value={
                    usersLoading ? undefined : form.getFieldValue('userId')
                  }
                  options={employeeOptions}
                  id="time-attendance-leave-balance-mobile-user-select"
                  data-cy="time-attendance-leave-balance-mobile-user-select"
                />
              </Form.Item>
              <Dropdown
                menu={{
                  items: mobileFilterItems,
                  selectedKeys: leaveTypeId ? [leaveTypeId] : ['__all__'],
                  onClick: ({ key }) =>
                    handleLeaveChange(key === '__all__' ? '' : key),
                }}
                trigger={['click']}
              >
                <Button
                  type="default"
                  className="!inline-flex h-10 min-w-0 max-w-[min(168px,42vw)] shrink-0 items-center gap-1.5 overflow-hidden border border-[#d9d9d9] font-normal"
                  id="time-attendance-leave-balance-mobile-filter-dropdown-button"
                  data-cy="time-attendance-leave-balance-mobile-filter-dropdown-button"
                  icon={<FilterAltOutlinedIcon className="text-sm shrink-0" />}
                  disabled={!selectedUserId}
                >
                  <span
                    data-cy="time-attendance-leave-balance-mobile-filter-dropdown-button-text"
                    className="min-w-0 flex-1 truncate text-left"
                    title={
                      selectedLeaveType?.title
                        ? String(selectedLeaveType.title)
                        : undefined
                    }
                  >
                    {selectedLeaveType?.title || 'Filter'}
                  </span>
                </Button>
              </Dropdown>
            </Form>
          </div>
          <div
            data-cy="time-attendance-leave-balance-filter-form-container-inner"
            className="hidden sm:block"
          >
            {!showAllLeaveTypes ? (
              <div
                data-cy="time-attendance-leave-balance-filter-form-container-inner"
                className="flex items-center justify-between gap-2"
              >
                <Form
                  form={form}
                  initialValues={{
                    employmentStatus: TIMESHEET_EMPLOYMENT_STATUS_ACTIVE,
                  }}
                  id="time-attendance-leave-balance-filter-form"
                  data-cy="time-attendance-leave-balance-filter-form"
                  className="flex flex-row items-center gap-3 mb-0"
                >
                  <div
                    data-cy="time-attendance-leave-balance-filter-form-container-inner-label"
                    className="text-sm text-black font-normal text-nowrap leading-8"
                  >
                    Select User to view Leave Balance:
                  </div>

                  <Form.Item className="mb-0 shrink-0">
                    {statusSelect}
                  </Form.Item>

                  <Form.Item
                    id="filterByLeaveRequestUserIds"
                    name="userId"
                    className="mb-0 w-full min-w-[200px]"
                    data-cy="time-attendance-leave-balance-user-select-form-item"
                  >
                    <Select
                      showSearch
                      onChange={handleChange}
                      placeholder="Select a person"
                      className="w-full [&_.ant-select-selector]:!h-8 [&_.ant-select-selector]:!items-center"
                      allowClear
                      loading={usersLoading}
                      optionFilterProp="label"
                      value={
                        usersLoading ? undefined : form.getFieldValue('userId')
                      }
                      options={employeeOptions}
                      id="time-attendance-leave-balance-user-select"
                      data-cy="time-attendance-leave-balance-user-select"
                    />
                  </Form.Item>
                </Form>

                {selectedUserId && (
                  <div
                    className="flex w-1/2 items-center justify-end gap-2 flex-wrap self-center"
                    id="time-attendance-leave-balance-leave-type-chip-wrapper"
                    data-cy="time-attendance-leave-balance-leave-type-chip-wrapper"
                  >
                    {visibleLeaveTypes.map((list: any) => (
                      <button
                        type="button"
                        key={list?.id}
                        onClick={() => handleLeaveChange(list?.id)}
                        className={`rounded border px-3 py-1 text-xs ${
                          leaveTypeId === list?.id
                            ? 'border-[#2155CD] bg-[#EFF4FF] text-[#2155CD]'
                            : 'border-gray-200 bg-gray-50 text-gray-600'
                        }`}
                        id={`time-attendance-leave-balance-leave-type-chip-${list?.id}`}
                        data-cy={`time-attendance-leave-balance-leave-type-chip-${list?.id}`}
                      >
                        {list?.title || ''}
                      </button>
                    ))}

                    {allLeaveTypes.length > 3 && (
                      <button
                        type="button"
                        className="text-[#2155CD] text-sm font-medium"
                        onClick={() => setShowAllLeaveTypes((prev) => !prev)}
                        id="time-attendance-leave-balance-view-all-toggle"
                        data-cy="time-attendance-leave-balance-view-all-toggle"
                      >
                        {showAllLeaveTypes ? 'View less' : 'View All'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              selectedUserId && (
                <div
                  className="flex items-center justify-end gap-2 flex-wrap"
                  id="time-attendance-leave-balance-leave-type-chip-wrapper"
                  data-cy="time-attendance-leave-balance-leave-type-chip-wrapper"
                >
                  {visibleLeaveTypes.map((list: any) => (
                    <button
                      type="button"
                      key={list?.id}
                      onClick={() => handleLeaveChange(list?.id)}
                      className={`rounded border px-3 py-1 text-xs ${
                        leaveTypeId === list?.id
                          ? 'border-[#2155CD] bg-[#EFF4FF] text-[#2155CD]'
                          : 'border-gray-200 bg-gray-50 text-gray-600'
                      }`}
                      id={`time-attendance-leave-balance-leave-type-chip-${list?.id}`}
                      data-cy={`time-attendance-leave-balance-leave-type-chip-${list?.id}`}
                    >
                      {list?.title || ''}
                    </button>
                  ))}

                  {allLeaveTypes.length > 3 && (
                    <button
                      type="button"
                      className="text-[#2155CD] text-sm font-medium"
                      onClick={() => setShowAllLeaveTypes((prev) => !prev)}
                      id="time-attendance-leave-balance-view-all-toggle"
                      data-cy="time-attendance-leave-balance-view-all-toggle"
                    >
                      {showAllLeaveTypes ? 'View less' : 'View All'}
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        </div>
        <div
          id="time-attendance-leave-balance-table-wrapper"
          data-cy="time-attendance-leave-balance-table-wrapper"
        >
          <LeaveBalanceTable data-cy="time-attendance-leave-balance-table" />
        </div>
      </BlockWrapper>
    </div>
  );
};

export default LeaveBalance;
