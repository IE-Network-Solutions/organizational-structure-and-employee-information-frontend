import React from 'react';
import type { BadgeProps, CalendarProps } from 'antd';
import { Badge, Calendar, Radio, Select } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useRouter } from 'next/navigation';
import { useDelegationState } from '@/store/uistate/features/dashboard/delegation';
import { useGetSchedule } from '@/store/server/features/dashboard/survey/queries';

type ScheduleCategory = 'meetings' | 'surveys' | 'actionPlans';

type ListItem = {
  type: BadgeProps['status'];
  content: string;
  category: ScheduleCategory;
  /** meeting id or survey formId; unused for action plans */
  routeId?: string;
};

const Calender = () => {
  const router = useRouter();
  const { data: scheduleData } = useGetSchedule();
  const { setSelectedDate } = useDelegationState();

  const navigateForCategory = (category: ScheduleCategory, routeId?: string) => {
    if (category === 'actionPlans') {
      router.push('/feedback/action-plan');
      return;
    }
    if (category === 'meetings' && routeId) {
      router.push(`/feedback/meeting/${routeId}`);
      return;
    }
    if (category === 'surveys' && routeId) {
      router.push(`/feedback/categories/${routeId}`);
    }
  };

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
  const getListData = (value: Dayjs): ListItem[] => {
    const current = value.format('YYYY-MM-DD'); // string

    const eventsForDay = allEvents.filter((event) => {
      const start = event.startAt.split('T')[0];
      const end = event.endAt ? event.endAt.split('T')[0] : null;

      return current === start || current === end;
    });

    const listData: ListItem[] = [];

    const hasMeetings = eventsForDay.some((e) => e.category === 'meetings');
    const hasSurveys = eventsForDay.some((e) => e.category === 'surveys');
    const hasActionPlans = eventsForDay.some(
      (e) => e.category === 'actionPlans',
    );

    if (hasMeetings) {
      const first = eventsForDay.find((e) => e.category === 'meetings');
      listData.push({
        type: getBadgeType('meetings'),
        content: 'Meeting',
        category: 'meetings',
        routeId: first?.id != null ? String(first.id) : undefined,
      });
    }

    if (hasSurveys) {
      const first = eventsForDay.find((e) => e.category === 'surveys');
      const formId = first?.formId ?? first?.id;
      listData.push({
        type: getBadgeType('surveys'),
        content: 'Survey',
        category: 'surveys',
        routeId: formId != null ? String(formId) : undefined,
      });
    }

    if (hasActionPlans) {
      listData.push({
        type: getBadgeType('actionPlans'),
        content: 'Action plan',
        category: 'actionPlans',
      });
    }

    return listData;
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);

    if (!listData.length) return null;

    return (
      <ul className="m-0 p-0 list-none space-y-1" data-cy="calendar-cell">
        {listData.map((item) => {
          const canNavigate =
            item.category === 'actionPlans' ||
            (item.category === 'meetings' && item.routeId) ||
            (item.category === 'surveys' && item.routeId);
          return (
            <li key={`${value.toString()}-${item.category}-${item.content}`}>
              {canNavigate ? (
                <button
                  type="button"
                  className="m-0 cursor-pointer border-0 bg-transparent p-0 text-left hover:opacity-80"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateForCategory(item.category, item.routeId);
                  }}
                  data-cy={`calendar-nav-${item.category}`}
                >
                  <Badge status={item.type} text={item.content} />
                </button>
              ) : (
                <Badge status={item.type} text={item.content} />
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  const cellRender: CalendarProps<Dayjs>['cellRender'] = (current, info) => {
    if (info.type === 'date') {
      return dateCellRender(current);
    }

    return info.originNode;
  };

  const handleDateChange = (value: Dayjs) => {
    setSelectedDate(value);
  };

  const headerRender: CalendarProps<Dayjs>['headerRender'] = ({
    value,
    type,
    onChange,
    onTypeChange,
  }) => {
    const current = dayjs(value);
    const year = current.year();
    const month = current.month();

    const yearOptions = Array.from({ length: 11 }, (_, index) => {
      const y = year - 5 + index;
      return {
        label: `${y}`,
        value: y,
      };
    });

    const monthOptions = Array.from({ length: 12 }, (_, index) => ({
      label: dayjs().month(index).format('MMM'),
      value: index,
    }));

    const handleYearChange = (newYear: number) => {
      const newDate = current.year(newYear);
      onChange?.(newDate);
    };

    const handleMonthChange = (newMonth: number) => {
      const newDate = current.month(newMonth);
      onChange?.(newDate);
    };

   

    return (
      <div
        className=""
        data-cy="calendar-header"
      >
       
        <div className="flex items-center gap-3 justify-end  px-4 py-2 ">
          <Select
            size="small"
            value={year}
            options={yearOptions}
            onChange={handleYearChange}
            data-cy="calendar-year-select"
          />
          <Select
            size="small"
            value={month}
            options={monthOptions}
            onChange={handleMonthChange}
            data-cy="calendar-month-select"
          />
          <Radio.Group
            size="small"
            value={type}
            onChange={(e) => onTypeChange?.(e.target.value)}
            data-cy="calendar-view-toggle"
          >
            <Radio.Button value="month">Month</Radio.Button>
            <Radio.Button value="year">Year</Radio.Button>
          </Radio.Group>
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-[620px] rounded-lg border border-gray-200 bg-white p-3"
      data-cy="calendar-container"
    >
      <Calendar
        headerRender={headerRender}
        // fullscreen={false}
        cellRender={cellRender}
        onChange={handleDateChange}
      />
    </div>
  );
};

export default Calender;
