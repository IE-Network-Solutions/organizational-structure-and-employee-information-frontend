'use client';
import { Col, DatePicker, Form, Row, Select, Modal, Button } from 'antd';
import { CommonObject } from '@/types/commons/commonObject';
import React, { FC, useState } from 'react';
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
  const [showFilterModal, setShowFilterModal] = useState(false);

  const userOptions =
    users?.items?.map((list: any) => ({
      value: list?.id,
      label: `${list?.firstName ?? ''} ${list?.middleName ?? ''} ${list?.lastName ?? ''}`,
    })) || [];

  const handleApplyFilter = () => {
    onChange(form.getFieldsValue());
    setShowFilterModal(false);
  };

  const handleCancel = () => {
    setShowFilterModal(false);
  };

  const MobileFilterContent = (
    <div className="space-y-4">
      {/* Leave Type */}
      <div>
        <p className="text-sm text-gray-700 font-medium mb-2">Leave Type</p>
        <Form.Item name="type" className="mb-0">
          <Select
            placeholder="Select Type"
            allowClear
            className="w-full"
            suffixIcon={
              <MdKeyboardArrowDown size={16} className="text-gray-900" />
            }
            options={formatToOptions(
              leaveTypesData?.items ?? [],
              'title',
              'id',
            )}
            style={{ height: '42px' }}
          />
        </Form.Item>
      </div>

      {/* Person */}
      <div>
        <p className="text-sm text-gray-700 font-medium mb-2">Person</p>
        <Form.Item name="userIds" className="mb-0">
          <Select
            showSearch
            placeholder="Select a person"
            allowClear
            className="w-full"
            suffixIcon={
              <MdKeyboardArrowDown size={16} className="text-gray-900" />
            }
            optionFilterProp="label"
            options={userOptions}
            style={{ height: '42px' }}
          />
        </Form.Item>
      </div>

      {/* Leave Status */}
      <div>
        <p className="text-sm text-gray-700 font-medium mb-2">Leave Status</p>
        <Form.Item name="status" className="mb-0">
          <Select
            placeholder="Select Status"
            allowClear
            className="w-full"
            suffixIcon={
              <MdKeyboardArrowDown size={16} className="text-gray-900" />
            }
            options={LeaveRequestStatusOption}
            optionFilterProp="label"
            style={{ height: '42px' }}
          />
        </Form.Item>
      </div>
    </div>
  );

  return (
    <Form
      form={form}
      onFieldsChange={() => !isSmallScreen && onChange(form.getFieldsValue())}
    >
      {isSmallScreen ? (
        <>
          {/* Mobile: Date Filter + Filter Button */}
          <div className="flex items-center gap-2">
            <Form.Item name="dateRange" className="flex-1 mb-0">
              <DatePicker.RangePicker
                className="w-full h-[42px]"
                separator="-"
                format={DATE_FORMAT}
                placeholder={['Start Date', 'End Date']}
              />
            </Form.Item>
            <button
              className="w-10 h-10 rounded-lg flex items-center justify-center border border-gray-300 hover:bg-gray-50"
              onClick={() => setShowFilterModal(true)}
            >
              <LuSettings2 />
            </button>
          </div>

          {/* Mobile: Filter Modal */}
          <Modal
            centered
            title={
              <h2 className="text-xl sm:text-2xl font-semibold">Filter</h2>
            }
            open={showFilterModal}
            onCancel={handleCancel}
            width="95%"
            style={{ maxWidth: '500px' }}
            bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
            footer={
              <div className="flex justify-center items-center">
                <div className="flex space-x-4">
                  <Button
                    type="default"
                    className="px-3"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    className="px-3"
                    onClick={handleApplyFilter}
                  >
                    Filter
                  </Button>
                </div>
              </div>
            }
          >
            {MobileFilterContent}
          </Modal>
        </>
      ) : (
        /* Desktop: Original Inline Filters */
        <Row gutter={[16, 16]} className="items-center">
          <Col flex="360px">
            <Form.Item
              id="dateRangeToFilterId"
              name="dateRange"
              className="mb-0"
            >
              <DatePicker.RangePicker
                className="w-full h-[42px]"
                separator="-"
                format={DATE_FORMAT}
              />
            </Form.Item>
          </Col>
          <Col flex="1">
            <Form.Item id="filterByLeaveTypeId" name="type" className="mb-0">
              <Select
                className="w-full h-[42px]"
                placeholder="Select Type"
                allowClear
                suffixIcon={
                  <MdKeyboardArrowDown size={16} className="text-gray-900" />
                }
                options={formatToOptions(
                  leaveTypesData?.items ?? [],
                  'title',
                  'id',
                )}
              />
            </Form.Item>
          </Col>
          <Col flex="1">
            <Form.Item
              id="filterByLeaveRequestUserIds"
              name="userIds"
              className="mb-0"
            >
              <Select
                showSearch
                placeholder="Select a person"
                className="w-full h-[42px]"
                allowClear
                optionFilterProp="label"
                options={userOptions}
              />
            </Form.Item>
          </Col>
          <Col flex="200px">
            <Form.Item
              id="filterByLeaveRequestStatusId"
              name="status"
              className="mb-0"
            >
              <Select
                className="w-full h-[42px]"
                placeholder="Select Status"
                allowClear
                suffixIcon={
                  <MdKeyboardArrowDown size={16} className="text-gray-900" />
                }
                options={LeaveRequestStatusOption}
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
        </Row>
      )}
    </Form>
  );
};

export default LeaveManagementTableFilter;
