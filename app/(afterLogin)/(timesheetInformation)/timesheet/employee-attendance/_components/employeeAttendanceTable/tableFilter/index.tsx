import React, { FC, useState } from 'react';
import { Col, DatePicker, Form, Row, Select, Modal, Button } from 'antd';
import { attendanceRecordTypeOption } from '@/types/timesheet/attendance';
import { DATE_FORMAT } from '@/utils/constants';
import { CommonObject } from '@/types/commons/commonObject';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { useMediaQuery } from 'react-responsive';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetBreakTypes } from '@/store/server/features/timesheet/breakType/queries';
import { LuSettings2 } from 'react-icons/lu';

interface TableFilterProps {
  onChange: (val: CommonObject) => void;
}

const TableFilter: FC<TableFilterProps> = ({ onChange }) => {
  const [form] = Form.useForm();
  const isSmallScreen = useMediaQuery({ maxWidth: 768 });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const { data: employeeData } = useGetAllUsers();
  const { data: breakTypeData } = useGetBreakTypes();

  const employeeOptions =
    employeeData?.items?.map((employee: any) => ({
      value: employee.id,
      label: `${employee?.firstName} ${employee?.middleName} ${employee?.lastName}`,
    })) || [];

  const breakTypeOptions =
    breakTypeData?.items?.map((breakType: any) => ({
      value: breakType.id,
      label: breakType.title,
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
      {/* Employee Select */}
      <div>
        <p className="text-sm text-gray-700 font-medium mb-2">Employee</p>
        <Form.Item name="employeeId" className="mb-0">
          <Select
            placeholder="Select Employee"
            allowClear
            className="w-full"
            suffixIcon={
              <MdKeyboardArrowDown size={16} className="text-gray-900" />
            }
            options={employeeOptions}
            showSearch
            optionFilterProp="label"
            filterOption={(input, option) =>
              (typeof option?.label === 'string'
                  ? option.label.toLowerCase()
                  : ''
              ).includes(input.toLowerCase())
            }
            style={{ height: '42px' }}
          />
        </Form.Item>
      </div>

      {/* Attendance Status */}
      <div>
        <p className="text-sm text-gray-700 font-medium mb-2">
          Attendance Status
        </p>
        <Form.Item name="type" className="mb-0">
          <Select
            placeholder="Select Attendance Status"
            allowClear
            className="w-full"
            suffixIcon={
              <MdKeyboardArrowDown size={16} className="text-gray-900" />
            }
            options={attendanceRecordTypeOption}
            style={{ height: '42px' }}
          />
        </Form.Item>
      </div>

      {/* Break Type */}
      <div>
        <p className="text-sm text-gray-700 font-medium mb-2">Break Type</p>
        <Form.Item name="breakTypeId" className="mb-0">
          <Select
            placeholder="Select Break Type"
            allowClear
            className="w-full"
            suffixIcon={
              <MdKeyboardArrowDown size={16} className="text-gray-900" />
            }
            options={breakTypeOptions}
            style={{ height: '42px' }}
          />
        </Form.Item>
      </div>
    </div>
  );

  return (
    <Form form={form} onFieldsChange={() => !isSmallScreen && onChange(form.getFieldsValue())}>
      {isSmallScreen ? (
        <>
          {/* Mobile: Date Filter + Filter Button */}
          <div className="flex items-center gap-2">
            <Form.Item name="date" className="flex-1 mb-0">
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

          {/* Mobile: Filter Modal (without date) */}
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
            <Form.Item name="date" className="mb-0">
              <DatePicker.RangePicker
                className="w-full h-[42px]"
                separator="-"
                format={DATE_FORMAT}
              />
            </Form.Item>
          </Col>
          <Col flex="1">
            <Form.Item name="employeeId" className="mb-0">
              <Select
                placeholder="Select Employee"
                allowClear
                className="w-full h-[42px]"
                suffixIcon={
                  <MdKeyboardArrowDown size={16} className="text-gray-900" />
                }
                options={employeeOptions}
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                  (typeof option?.label === 'string'
                      ? option.label.toLowerCase()
                      : ''
                  ).includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col flex="200px">
            <Form.Item name="type" className="mb-0">
              <Select
                placeholder="Attendance Status"
                allowClear
                className="w-full h-[42px]"
                suffixIcon={
                  <MdKeyboardArrowDown size={16} className="text-gray-900" />
                }
                options={attendanceRecordTypeOption}
              />
            </Form.Item>
          </Col>
          <Col flex="200px">
            <Form.Item name="breakTypeId" className="mb-0">
              <Select
                placeholder="Break Type"
                allowClear
                className="w-full h-[42px]"
                suffixIcon={
                  <MdKeyboardArrowDown size={16} className="text-gray-900" />
                }
                options={breakTypeOptions}
              />
            </Form.Item>
          </Col>
        </Row>
      )}
    </Form>
  );
};

export default TableFilter;