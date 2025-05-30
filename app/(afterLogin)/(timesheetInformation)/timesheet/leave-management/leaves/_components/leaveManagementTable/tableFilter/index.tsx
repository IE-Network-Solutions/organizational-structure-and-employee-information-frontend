'use client'
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
    >
      <Row
        gutter={16}
        className={isSmallScreen ? 'flex flex-row justify-between w-full' : ''}
      >
        {/* Hide DatePicker on small screens */}
        {!isSmallScreen && (
          <Col span={6}>
            <Form.Item id="dateRangeToFilterId" name="dateRange">
              <DatePicker.RangePicker
                className={filterClass}
                separator={'-'}
                format={DATE_FORMAT}
              />
            </Form.Item>
          </Col>
        )}

        {/* Leave Type Filter (Hide on small screen) */}
        {!isSmallScreen && (
          <Col span={6}>
            <Form.Item id="filterByLeaveTypeId" name="type">
              <Select
                className="w-full h-[54px]"
                placeholder="Select Type"
                allowClear
                suffixIcon={
                  <MdKeyboardArrowDown size={16} className="text-gray-900" />
                }
                options={formatToOptions(leaveTypesData?.items ?? [], 'title', 'id')}
              />
            </Form.Item>
          </Col>
        )}

        {/* Select Person (Left on small screens) */}
        <Col span={isSmallScreen ? 16 : 6}>
          <Form.Item id="filterByLeaveRequestUserIds" name="userIds">
            <Select
              showSearch
              placeholder="Select a person"
              className="w-full h-[54px]"
              allowClear
              optionFilterProp="label"
              options={users?.items?.map((list: any) => ({
                value: list?.id,
                label: `${list?.firstName ?? ''} ${list?.middleName ?? ''} ${list?.lastName ?? ''}`,
              }))}
            />
          </Form.Item>
        </Col>

        {/* Leave Status Filter (Menu on the right for small screens) */}
        <Col
          span={isSmallScreen ? 1 : 6}
          className={isSmallScreen ? 'flex justify-end' : ''}
        >
          <Form.Item id="filterByLeaveRequestStatusId" name="status">
            <Select
              className={
                isSmallScreen
                  ? 'w-[50px] h-[50px] text-white text-[0px]'
                  : 'w-full h-[54px]'
              }
              placeholder={isSmallScreen ? '' : 'Select Status'}
              allowClear
              suffixIcon={
                isSmallScreen ? (
                  <LuSettings2 size={24} className="text-gray-900" />
                ) : (
                  <MdKeyboardArrowDown size={16} className="text-gray-900" />
                )
              }
              options={LeaveRequestStatusOption}
              onChange={(value) => form.setFieldsValue({ status: value })}
              optionFilterProp="label"
              dropdownStyle={isSmallScreen ? { minWidth: 150 } : {}}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default LeaveManagementTableFilter;
