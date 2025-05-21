import { FC } from 'react';
import { DatePicker, Form, Select, Row, Col, Button, Modal } from 'antd';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { LuSettings2 } from 'react-icons/lu';

import { LeaveRequestStatusOption } from '@/types/timesheet/settings';
import { formatToOptions } from '@/helpers/formatTo';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import { DATE_FORMAT } from '@/utils/constants';
import { useState } from 'react';
import dayjs from 'dayjs';

interface FilterFormValues {
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs];
  type?: string;
  status?: string;
  startDate?: dayjs.Dayjs;
  endDate?: dayjs.Dayjs;
}

interface HistoryTableFilterProps {
  onChange: (val: FilterFormValues) => void;
}

const HistoryTableFilter: FC<HistoryTableFilterProps> = ({ onChange }) => {
  const { leaveTypes } = useMyTimesheetStore();
  const [form] = Form.useForm();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const FilterContent = () => (
    <Form<FilterFormValues>
      form={form}
      onFieldsChange={() => {
        onChange(form.getFieldsValue());
      }}
      className="w-full"
    >
      <Row gutter={[16, 16]} className="w-full">
        <Col xs={24} md={8}>
          <Form.Item id="historyDateRangeId" name="dateRange" className="mb-0">
            <DatePicker.RangePicker
              className="w-full h-[40px]"
              separator={'-'}
              format={DATE_FORMAT}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item id="historyType" name="type" className="mb-0">
            <Select
              placeholder="Select Type"
              className="w-full h-[40px]"
              allowClear={true}
              suffixIcon={
                <MdKeyboardArrowDown size={16} className="text-gray-900" />
              }
              options={formatToOptions(leaveTypes ?? [], 'title', 'id')}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item id="historyStatus" name="status" className="mb-0">
            <Select
              placeholder="Select Status"
              className="w-full h-[40px]"
              allowClear={true}
              suffixIcon={
                <MdKeyboardArrowDown size={16} className="text-gray-900" />
              }
              options={LeaveRequestStatusOption}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden sm:block">
        <FilterContent />
      </div>

      {/* Mobile Filter Button */}
      <div className="sm:hidden mb-4">
        <Button
          type="default"
          icon={<LuSettings2 className="text-gray-600" />}
          onClick={() => setIsFilterOpen(true)}
          className="flex justify-center w-10 h-10 hover:bg-gray-50 border-gray-200"
        />
        <Modal
          centered
          title="Filter Employees"
          open={isFilterOpen}
          onCancel={() => setIsFilterOpen(false)}
          width="85%"
          footer={
            <div className="flex justify-center items-center space-x-4">
              <Button
                type="default"
                className="px-3"
                onClick={() => setIsFilterOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => setIsFilterOpen(false)}
                type="primary"
                className="px-3"
              >
                Filter
              </Button>
            </div>
          }
        >
          <Form<FilterFormValues>
            form={form}
            onFieldsChange={() => {
              onChange(form.getFieldsValue());
            }}
            className="w-full"
          >
            <Form.Item
              id="historyStartDateId"
              name="startDate"
              className="w-full sm:w-auto h-[40px]"
            >
              <DatePicker
                className="w-full sm:w-auto h-[40px]"
                placeholder="Start Date"
                format={DATE_FORMAT}
                onChange={(startDate) => {
                  const endDate = form.getFieldValue('endDate');
                  if (startDate && endDate) {
                    form.setFieldsValue({ dateRange: [startDate, endDate] });
                  }
                }}
              />
            </Form.Item>

            <Form.Item
              id="historyEndDateId"
              name="endDate"
              className="w-full sm:w-auto h-[40px]"
            >
              <DatePicker
                className="w-full sm:w-auto h-[40px]"
                placeholder="End Date"
                format={DATE_FORMAT}
                onChange={(endDate) => {
                  const startDate = form.getFieldValue('startDate');
                  if (startDate && endDate) {
                    form.setFieldsValue({ dateRange: [startDate, endDate] });
                  }
                }}
              />
            </Form.Item>

            <Form.Item id="historyType" name="type">
              <Select
                placeholder="Select Type"
                className="w-full h-[40px]"
                allowClear={true}
                suffixIcon={
                  <MdKeyboardArrowDown size={16} className="text-gray-900" />
                }
                options={formatToOptions(leaveTypes ?? [], 'title', 'id')}
              />
            </Form.Item>
            <Form.Item id="historyStatus" name="status">
              <Select
                placeholder="Select Status"
                className="w-full h-[40px]"
                allowClear={true}
                suffixIcon={
                  <MdKeyboardArrowDown size={16} className="text-gray-900" />
                }
                options={LeaveRequestStatusOption}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default HistoryTableFilter;
