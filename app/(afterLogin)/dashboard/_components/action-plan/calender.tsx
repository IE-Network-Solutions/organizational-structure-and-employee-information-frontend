import React from 'react';
import type { BadgeProps, CalendarProps } from 'antd';
import { Badge, Calendar } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useDelegationState } from '@/store/uistate/features/dashboard/delegation';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';

const getListData = (value: Dayjs) => {
  let listData: { type: BadgeProps['status'] }[] = [];

  const year = value.year();
  const month = value.month();
  const day = value.date();

  if (year === 2025 && month === 4 && day === 4) {
    listData = [{ type: 'warning' }, { type: 'error' }];
  } else if (year === 2025 && month === 3 && day === 30) {
    listData = [{ type: 'success' }];
  } else if (year === 2025 && month === 4 && day === 15) {
    listData = [{ type: 'warning' }, { type: 'success' }, { type: 'error' }];
  } else if (year === 2025 && month === 4 && day === 21) {
    listData = [{ type: 'warning' }, { type: 'success' }, { type: 'error' }];
  }

  return listData;
};
const Calender = () => {
  const { selectedDate, setSelectedDate } = useDelegationState();

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    return (
      <div className="flex gap-1">
        {listData.map((item, index) => (
          <div key={index}>
            <Badge status={item.type as BadgeProps['status']} />
          </div>
        ))}
      </div>
    );
  };

  const cellRender: CalendarProps<Dayjs>['cellRender'] = (current, info) => {
    return dateCellRender(current);
  };

  const handleDateChange = (value: Dayjs) => {
    setSelectedDate(value);
  };
  const headerRender = ({ value, onChange }: any) => {
    const current = dayjs(value);

    const prevMonth = () => {
      const newValue = current.subtract(1, 'month');
      onChange(newValue);
    };

    const nextMonth = () => {
      const newValue = current.add(1, 'month');
      onChange(newValue);
    };

    return (
      <div className="flex justify-between items-center px-4 py-2">
        <FaAngleLeft onClick={prevMonth} className="cursor-pointer" />
        <span className="font-semibold">{current.format('MMMM YYYY')}</span>
        <FaAngleRight onClick={nextMonth} className="cursor-pointer" />
      </div>
    );
  };
  return (
    <div className="h-[350px]">
      <Calendar
        headerRender={headerRender}
        fullscreen={false}
        cellRender={cellRender}
        onChange={handleDateChange}
      />
    </div>
  );
};

export default Calender;
