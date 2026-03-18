import React from 'react';
import type { BadgeProps, CalendarProps } from 'antd';
import { Badge, Calendar, Radio, Select, Tooltip } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
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

  const navigateForCategory = (
    category: ScheduleCategory,
    routeId?: string,
  ) => {
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
      <div data-cy="calendar-cell">
        {/* Mobile: compact dots only */}
        <div
          className="mt-0 flex items-center justify-center gap-1 md:hidden"
          data-cy="calendar-cell-mobile-dots"
        >
          {listData.map((item) => {
            const canNavigate =
              item.category === 'actionPlans' ||
              (item.category === 'meetings' && item.routeId) ||
              (item.category === 'surveys' && item.routeId);

            const dot = (
              <Tooltip
                title={item.content}
                placement="top"
                data-cy={`calendar-dot-tooltip-${item.category}`}
              >
                <span data-cy={`calendar-dot-${item.category}`}>
                  {
                    <Badge
                      status={item.type}
                      data-cy={`calendar-dot-badge-${item.category}`}
                    />
                  }
                </span>
              </Tooltip>
            );

            if (!canNavigate) {
              return (
                <span
                  key={`${value.toString()}-${item.category}-${item.content}-dot`}
                  aria-label={`${item.content} on ${value.format('YYYY-MM-DD')}`}
                  data-cy={`calendar-dot-wrapper-${item.category}`}
                >
                  {dot}
                </span>
              );
            }

            return (
              <button
                key={`${value.toString()}-${item.category}-${item.content}-dot`}
                type="button"
                className="m-0 cursor-pointer border-0 bg-transparent p-0 hover:opacity-80"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateForCategory(item.category, item.routeId);
                }}
                aria-label={`${item.content} on ${value.format('YYYY-MM-DD')}`}
                data-cy={`calendar-nav-${item.category}`}
              >
                {dot}
              </button>
            );
          })}
        </div>

        {/* Desktop/tablet: badge with label */}
        <ul
          className="m-0 hidden list-none space-y-1 p-0 md:block"
          data-cy="calendar-cell-desktop-list"
        >
          {listData.map((item) => {
            const canNavigate =
              item.category === 'actionPlans' ||
              (item.category === 'meetings' && item.routeId) ||
              (item.category === 'surveys' && item.routeId);
            return (
              <li
                key={`${value.toString()}-${item.category}-${item.content}`}
                data-cy={`calendar-cell-item-${item.category}`}
              >
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
                    <Badge
                      status={item.type}
                      text={item.content}
                      data-cy={`calendar-badge-${item.category}`}
                    />
                  </button>
                ) : (
                  <Badge
                    status={item.type}
                    text={item.content}
                    data-cy={`calendar-badge-${item.category}`}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </div>
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

    const yearOptions = Array.from({ length: 11 }, (unused, index) => {
      void unused;
      const y = year - 5 + index;
      return {
        label: `${y}`,
        value: y,
      };
    });

    const monthOptions = Array.from({ length: 12 }, (unused, index) => {
      void unused;
      return {
        label: dayjs().month(index).format('MMM'),
        value: index,
      };
    });

    const handleYearChange = (newYear: number) => {
      const newDate = current.year(newYear);
      onChange?.(newDate);
    };

    const handleMonthChange = (newMonth: number) => {
      const newDate = current.month(newMonth);
      onChange?.(newDate);
    };

    return (
      <div className="px-2 py-2" data-cy="calendar-header">
        <div
          className="flex items-center justify-between gap-3"
          data-cy="calendar-header-row"
        >
          <div
            className="flex items-center gap-2"
            data-cy="calendar-header-title"
          >
            <CalendarOutlined
              className="text-gray-700"
              data-cy="calendar-header-icon"
            />
            <div
              className="text-base font-semibold text-gray-900"
              data-cy="calendar-header-text"
            >
              Schedules
            </div>
          </div>

          <div
            className="flex  items-center justify-end gap-2 md:gap-3"
            data-cy="calendar-header-controls"
          >
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
              className="inline-flex"
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
        data-cy="calendar"
      />
    </div>
  );
};

export default Calender;
