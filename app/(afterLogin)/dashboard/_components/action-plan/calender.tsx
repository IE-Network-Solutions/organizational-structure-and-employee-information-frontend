import React from 'react';
import type { BadgeProps, CalendarProps } from 'antd';
import { Badge, Calendar } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useDelegationState } from '@/store/uistate/features/dashboard/delegation';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { useGetSchedule } from '@/store/server/features/dashboard/survey/queries';

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

  // Filter events by exact match to start or end date
  const getListData = (value: Dayjs) => {
    const current = value.format('YYYY-MM-DD'); // string

    const eventsForDay = allEvents.filter((event) => {
      const start = event.startAt.split('T')[0];
      const end = event.endAt ? event.endAt.split('T')[0] : null;

      return current === start || current === end;
    });

    const hasMeetings = eventsForDay.some((e) => e.category === 'meetings');
    const hasSurveys = eventsForDay.some((e) => e.category === 'surveys');
    const hasActionPlans = eventsForDay.some(
      (e) => e.category === 'actionPlans',
    );

    const listData = [];

    if (hasMeetings) listData.push({ type: getBadgeType('meetings') });
    if (hasSurveys) listData.push({ type: getBadgeType('surveys') });
    if (hasActionPlans) listData.push({ type: getBadgeType('actionPlans') });

    return listData;
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    return (
      <div className="flex gap-1 justify-center min-h-[18px]">
        {listData.length > 0 ? (
          listData.map((item, index) => (
            <Badge key={index} status={item.type} />
          ))
        ) : (
          <Badge />
        )}
      </div>
    );
  };

  const cellRender: CalendarProps<Dayjs>['cellRender'] = (current) => {
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
    <div className="h-[385px]">
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
