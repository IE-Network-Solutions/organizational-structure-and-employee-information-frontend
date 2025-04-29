import { FC } from 'react';
import { DatePicker, Form, Select, Row, Col, Button, Drawer } from 'antd';
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
          <Form.Item
            id="historyDateRangeId"
            name="dateRange"
            label="Date Range"
            className="mb-0"
          >
            <DatePicker.RangePicker
              className="w-full h-[54px]"
              separator={'-'}
              format={DATE_FORMAT}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            id="historyType"
            name="type"
            label="Leave Type"
            className="mb-0"
          >
            <Select
              placeholder="Select Type"
              className="w-full h-[54px]"
              allowClear={true}
              suffixIcon={
                <MdKeyboardArrowDown size={16} className="text-gray-900" />
              }
              options={formatToOptions(leaveTypes ?? [], 'title', 'id')}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            id="historyStatus"
            name="status"
            label="Status"
            className="mb-0"
          >
            <Select
              placeholder="Select Status"
              className="w-full h-[54px]"
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
      {/* Mobile Filter Button */}
      <div className="md:hidden mb-4">
        <Button
          type="default"
          icon={<LuSettings2 size={24} className="text-gray-600" />}
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center justify-center w-12 h-12 hover:bg-gray-50 border-gray-200"
        />
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:block">
        <FilterContent />
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer
        title="Filter Options"
        placement="bottom"
        onClose={() => setIsFilterOpen(false)}
        open={isFilterOpen}
        height="auto"
        className="md:hidden"
        contentWrapperStyle={{
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
        }}
      >
        <div className="px-4 pb-6">
          <FilterContent />
        </div>
      </Drawer>
    </>
  );
};

export default HistoryTableFilter;
