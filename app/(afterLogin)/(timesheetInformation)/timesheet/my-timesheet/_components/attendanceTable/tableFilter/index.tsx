import React, { useState } from 'react';
import { Button, DatePicker, Drawer } from 'antd';
import { IoMdSwitch } from "react-icons/io";
import dayjs from 'dayjs';

const AttendanceTableFilter = ({ onChange }: { onChange: (val: any) => void }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState<any>();

  const handleChange = (val: any) => {
    setDateRange(val);
    onChange(val);
  };

  const FilterContent = () => (
    <div className="flex flex-col sm:flex-row gap-4">
      <DatePicker.RangePicker
        size="large"
        value={dateRange}
        onChange={handleChange}
        allowClear
        className="w-full sm:w-auto"
      />
    </div>
  );

  return (
    <div className="flex items-center gap-4">
      {/* Mobile View */}
      <div className="sm:hidden">
        <Button
          size="large"
          className="h-12 w-12 flex items-center justify-center bg-white border border-gray-200 hover:bg-gray-50"
          onClick={() => setIsFilterOpen(true)}
        >
          <IoMdSwitch size={20} className="text-gray-600" />
        </Button>
        <Drawer
          title="Filter Options"
          placement="bottom"
          onClose={() => setIsFilterOpen(false)}
          open={isFilterOpen}
          height="auto"
          contentWrapperStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
        >
          <FilterContent />
        </Drawer>
      </div>

      {/* Desktop View */}
      <div className="hidden sm:block">
        <FilterContent />
      </div>
    </div>
  );
};

export default AttendanceTableFilter; 