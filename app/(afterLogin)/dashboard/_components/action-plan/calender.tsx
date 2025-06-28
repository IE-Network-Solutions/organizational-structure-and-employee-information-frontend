import React from 'react';
import type { BadgeProps, CalendarProps } from 'antd';
import { Badge, Calendar } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useDelegationState } from '@/store/uistate/features/dashboard/delegation';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { useGetSchedule } from '@/store/server/features/dashboard/survey/queries';

// Extend dayjs with necessary plugins
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const Calender = () => {
  const { data: scheduleData } = useGetSchedule();
  const { setSelectedDate } = useDelegationState();

  // Convert category to badge type
  const getBadgeType = (category: string): BadgeProps['status'] => {
    switch (category) {
      case 'meetings':
        return 'success';
      case 'surveys':
        return 'warning';
      case 'actionPlans':
        return 'error';
      default:
        return 'default';
    }
  };

  // Safely map and add category
  const addCategory = (items: any[] | undefined | null, category: string) =>
    Array.isArray(items) ? items.map((item) => ({ ...item, category })) : [];

  // Combine all events
  const allEvents = [
    ...addCategory(scheduleData?.meetings ?? [], 'meetings'),
    ...addCategory(scheduleData?.surveys ?? [], 'surveys'),
    ...addCategory(scheduleData?.actionPlans ?? [], 'actionPlans'),
  ];

  // Filter events by date range (startAt to endAt)
  const getListData = (value: Dayjs) => {
    const current = value.startOf('day');

    return allEvents
      .filter((event) => {
        const start = dayjs(event.startAt).startOf('day');
        const end = event.endAt ? dayjs(event.endAt).endOf('day') : start;
        return current.isSameOrAfter(start) && current.isSameOrBefore(end);
      })
      .map((event) => ({
        type: getBadgeType(event.category),
      }));
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    return (
      <div className="flex gap-1">
        {listData.map((item, index) => (
          <Badge key={index} status={item.type} />
        ))}
      </div>
    );
  };

  const cellRender: CalendarProps<Dayjs>['cellRender'] = (current) => {
    return dateCellRender(current);
  };

  const handleDateChange = (value: Dayjs) => {
    setSelectedDate(value);
    console.log('@@@@ selected ', value);
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
