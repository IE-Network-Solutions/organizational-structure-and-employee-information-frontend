'use client';
import { Col, DatePicker, Form, Row, Select } from 'antd';
import { CommonObject } from '@/types/commons/commonObject';
import React, { FC } from 'react';
import { DATE_FORMAT } from '@/utils/constants';
import { formatToOptions } from '@/helpers/formatTo';
import { LeaveRequestStatusOption } from '@/types/timesheet/settings';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useMediaQuery } from 'react-responsive';
import { LuSettings2 } from 'react-icons/lu';
import { useGetLeaveTypes } from '@/store/server/features/timesheet/leaveType/queries';

interface LeaveManagementTableFilterProps {
  onChange: (val: CommonObject) => void;
}

const LeaveManagementTableFilter: FC<LeaveManagementTableFilterProps> = ({
  onChange,
}) => {
  const { data: leaveTypesData } = useGetLeaveTypes();
  const [form] = Form.useForm();
  const { data: users } = useGetAllUsers();
  const isSmallScreen = useMediaQuery({ maxWidth: 768 });

  const filterClass = 'w-full h-[54px]';

  return (
    <Form
      form={form}
      onFieldsChange={() => {
        onChange(form.getFieldsValue());
      }}
      id="time-attendance-leave-management-filter-form"
      data-cy="time-attendance-leave-management-filter-form"
    >
      <Row
        gutter={16}
        className={isSmallScreen ? 'flex flex-row justify-between w-full' : ''}
        id="time-attendance-leave-management-filter-row"
        data-cy="time-attendance-leave-management-filter-row"
      >
        {/* Hide DatePicker on small screens */}
        {!isSmallScreen && (
          <Col
            span={6}
            id="time-attendance-leave-management-filter-date-col"
            data-cy="time-attendance-leave-management-filter-date-col"
          >
            <Form.Item
              id="dateRangeToFilterId"
              name="dateRange"
              data-cy="time-attendance-leave-management-filter-date-form-item"
            >
              <DatePicker.RangePicker
                className={filterClass}
                separator={'-'}
                format={DATE_FORMAT}
                id="time-attendance-leave-management-filter-date-picker"
                data-cy="time-attendance-leave-management-filter-date-picker"
              />
            </Form.Item>
          </Col>
        )}

        {/* Leave Type Filter (Hide on small screen) */}
        {!isSmallScreen && (
          <Col
            span={6}
            id="time-attendance-leave-management-filter-type-col"
            data-cy="time-attendance-leave-management-filter-type-col"
          >
            <Form.Item
              id="filterByLeaveTypeId"
              name="type"
              data-cy="time-attendance-leave-management-filter-type-form-item"
            >
              <Select
                className="w-full h-[54px]"
                placeholder="Select Type"
                allowClear
                suffixIcon={
                  <MdKeyboardArrowDown
                    data-cy="time-attendance-leave-management-filter-type-select-suffix-icon"
                    size={16}
                    className="text-gray-900"
                  />
                }
                options={formatToOptions(
                  leaveTypesData?.items ?? [],
                  'title',
                  'id',
                )}
                id="time-attendance-leave-management-filter-type-select"
                data-cy="time-attendance-leave-management-filter-type-select"
              />
            </Form.Item>
          </Col>
        )}

        {/* Select Person (Left on small screens) */}
        <Col
          span={isSmallScreen ? 18 : 6}
          id="time-attendance-leave-management-filter-user-col"
          data-cy="time-attendance-leave-management-filter-user-col"
        >
          <Form.Item
            id="filterByLeaveRequestUserIds"
            name="userIds"
            data-cy="time-attendance-leave-management-filter-user-form-item"
          >
            <Select
              showSearch
              placeholder="Select a person"
              className="w-full h-10"
              allowClear
              optionFilterProp="label"
              options={users?.items?.map((list: any) => ({
                value: list?.id,
                label: `${list?.firstName ?? ''} ${list?.middleName ?? ''} ${list?.lastName ?? ''}`,
              }))}
              id="time-attendance-leave-management-filter-user-select"
              data-cy="time-attendance-leave-management-filter-user-select"
            />
          </Form.Item>
        </Col>

        {/* Leave Status Filter (Menu on the right for small screens) */}
        <Col
          span={isSmallScreen ? 1 : 6}
          className={isSmallScreen ? 'flex justify-end' : ''}
          id="time-attendance-leave-management-filter-status-col"
          data-cy="time-attendance-leave-management-filter-status-col"
        >
          <Form.Item
            id="filterByLeaveRequestStatusId"
            name="status"
            data-cy="time-attendance-leave-management-filter-status-form-item"
          >
            <Select
              className={
                isSmallScreen
                  ? 'w-[40px] h-[40px] text-white text-[0px]'
                  : 'w-full h-[40px]'
              }
              placeholder={isSmallScreen ? '' : 'Select Status'}
              allowClear
              suffixIcon={
                isSmallScreen ? (
                  <LuSettings2
                    data-cy="time-attendance-leave-management-filter-status-select-suffix-icon"
                    size={24}
                    className="text-gray-900"
                  />
                ) : (
                  <MdKeyboardArrowDown
                    data-cy="time-attendance-leave-management-filter-status-select-suffix-icon"
                    size={16}
                    className="text-gray-900"
                  />
                )
              }
              options={LeaveRequestStatusOption}
              onChange={(value) => form.setFieldsValue({ status: value })}
              optionFilterProp="label"
              dropdownStyle={isSmallScreen ? { minWidth: 150 } : {}}
              id="time-attendance-leave-management-filter-status-select"
              data-cy="time-attendance-leave-management-filter-status-select"
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default LeaveManagementTableFilter;
