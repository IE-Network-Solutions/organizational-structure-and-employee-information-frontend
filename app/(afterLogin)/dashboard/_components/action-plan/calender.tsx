import React, { useState } from 'react';
import type { BadgeProps, CalendarProps } from 'antd';
import {
  Badge,
  Button,
  Calendar,
  Card,
  Drawer,
  Dropdown,
  Popover,
  Radio,
  Select,
} from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import dayjs, { Dayjs } from 'dayjs';
import { useRouter } from 'next/navigation';
import { useDelegationState } from '@/store/uistate/features/dashboard/delegation';
import { useGetSchedule } from '@/store/server/features/dashboard/survey/queries';
import { useIsMobile } from '@/hooks/useIsMobile';

type ScheduleCategory = 'meetings' | 'surveys' | 'actionPlans';

type ListItem = {
  type: BadgeProps['status'];
  content: string;
  category: ScheduleCategory;
  /** meeting id or survey formId; unused for action plans */
  routeId?: string;
  /** Formatted start time for meetings (mobile sheet) */
  timeLabel?: string;
};

/** Mobile UI matches design: red = meeting, amber = action plan, green = survey */
const MOBILE_CATEGORY_DOT: Record<ScheduleCategory, string> = {
  meetings: 'bg-red-500',
  surveys: 'bg-green-500',
  actionPlans: 'bg-amber-500',
};

const MOBILE_CATEGORY_LABEL: Record<ScheduleCategory, string> = {
  meetings: 'Zoom Meeting',
  surveys: 'Survey',
  actionPlans: 'Action Plan',
};

const CATEGORY_ORDER: ScheduleCategory[] = [
  'meetings',
  'surveys',
  'actionPlans',
];

function getSchedulePrimaryLabel(
  category: ScheduleCategory,
  event: { title?: string; name?: string },
): string {
  if (category === 'meetings') {
    return event.title || event.name || MOBILE_CATEGORY_LABEL.meetings;
  }
  if (category === 'surveys') {
    return event.name || MOBILE_CATEGORY_LABEL.surveys;
  }
  return event.title || event.name || MOBILE_CATEGORY_LABEL.actionPlans;
}

function eventOverlapsMonth(
  event: { startAt: string; endAt?: string | null },
  month: Dayjs,
): boolean {
  const start = dayjs(event.startAt).startOf('day');
  const end = event.endAt ? dayjs(event.endAt).startOf('day') : start;
  const ms = month.startOf('month');
  const me = month.endOf('month');
  return !(end.isBefore(ms, 'day') || start.isAfter(me, 'day'));
}

function getDayNumbersWithEventsInMonth(
  month: Dayjs,
  events: Array<{ startAt: string; endAt?: string | null }>,
): number[] {
  const monthStart = month.startOf('month');
  const monthEnd = month.endOf('month');
  const days = new Set<number>();
  for (const event of events) {
    if (!eventOverlapsMonth(event, month)) continue;
    const start = dayjs(event.startAt).startOf('day');
    const end = event.endAt ? dayjs(event.endAt).startOf('day') : start;
    const rangeStart = start.isBefore(monthStart) ? monthStart : start;
    const rangeEnd = end.isAfter(monthEnd) ? monthEnd : end;
    let d = rangeStart.startOf('day');
    const endDay = rangeEnd.startOf('day');
    while (!d.isAfter(endDay, 'day')) {
      if (d.isSame(month, 'month')) {
        days.add(d.date());
      }
      d = d.add(1, 'day');
    }
  }
  return Array.from(days).sort((a, b) => a - b);
}

const Calender = () => {
  const router = useRouter();
  const { data: scheduleData } = useGetSchedule();
  const { setSelectedDate } = useDelegationState();
  const { isMobile } = useIsMobile();

  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [mobileSheetItems, setMobileSheetItems] = useState<ListItem[]>([]);
  const [mobileSheetDateLabel, setMobileSheetDateLabel] = useState('');
  const [calendarFilterOpen, setCalendarFilterOpen] = useState(false);

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
      const timeLabel =
        first?.startAt != null
          ? dayjs(first.startAt).format('h:mm A')
          : undefined;
      listData.push({
        type: getBadgeType('meetings'),
        content: getSchedulePrimaryLabel('meetings', first ?? {}),
        category: 'meetings',
        routeId: first?.id != null ? String(first.id) : undefined,
        timeLabel,
      });
    }

    if (hasSurveys) {
      const first = eventsForDay.find((e) => e.category === 'surveys');
      const formId = first?.formId ?? first?.id;
      listData.push({
        type: getBadgeType('surveys'),
        content: getSchedulePrimaryLabel('surveys', first ?? {}),
        category: 'surveys',
        routeId: formId != null ? String(formId) : undefined,
      });
    }

    if (hasActionPlans) {
      const first = eventsForDay.find((e) => e.category === 'actionPlans');
      listData.push({
        type: getBadgeType('actionPlans'),
        content: getSchedulePrimaryLabel('actionPlans', first ?? {}),
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
        <button
          type="button"
          className="mt-0 flex w-full items-center justify-center gap-1 rounded-md border-0 bg-transparent p-1 hover:bg-gray-50 active:bg-gray-100 md:hidden"
          data-cy="calendar-cell-mobile-dots"
          aria-label={`Open schedule for ${value.format('MMMM D, YYYY')}`}
          onClick={(e) => {
            e.stopPropagation();
            setMobileSheetItems(listData);
            setMobileSheetDateLabel(value.format('ddd, MMM D'));
            setMobileSheetOpen(true);
          }}
        >
          {listData.map((item) => (
            <span
              key={`${value.toString()}-${item.category}-${item.content}-dot`}
              className={`inline-block h-2 w-2 shrink-0 rounded-full ${MOBILE_CATEGORY_DOT[item.category]}`}
              data-cy={`calendar-dot-${item.category}`}
              aria-hidden
            />
          ))}
        </button>

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
                className="min-w-0 max-w-full [&_.ant-badge-status]:flex [&_.ant-badge-status]:min-w-0 [&_.ant-badge-status]:max-w-full [&_.ant-badge-status]:items-center [&_.ant-badge-status-text]:min-w-0 [&_.ant-badge-status-text]:max-w-full [&_.ant-badge-status-text]:truncate"
                title={item.content}
                data-cy={`calendar-cell-item-${item.category}`}
              >
                {canNavigate ? (
                  <button
                    type="button"
                    className="m-0 flex max-w-full w-full cursor-pointer items-center border-0 bg-transparent p-0 text-left hover:opacity-80"
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

  /** Year view: month cells — same pattern as time & attendance closed dates */
  const monthCellRender = (current: Dayjs) => {
    const eventsForMonth = allEvents.filter((e) =>
      eventOverlapsMonth(e, current),
    );
    if (!eventsForMonth.length) return null;

    const dayNumbers = getDayNumbersWithEventsInMonth(current, eventsForMonth);
    const categoriesPresent = CATEGORY_ORDER.filter((c) =>
      eventsForMonth.some((e) => e.category === c),
    );

    const sortedEvents = [...eventsForMonth].sort(
      (a, b) => dayjs(a.startAt).valueOf() - dayjs(b.startAt).valueOf(),
    );

    return (
      <Dropdown
        trigger={['click']}
        placement="bottomLeft"
        data-cy="dashboard-calendar-year-month-dropdown-root"
        dropdownRender={() => (
          <div
            className="rounded-md border border-gray-200 bg-white p-2 shadow-lg"
            data-cy="dashboard-calendar-year-month-dropdown"
          >
            <Card
              title={
                <div
                  className="flex items-center gap-2"
                  data-cy="dashboard-calendar-year-month-card-title"
                >
                  <CalendarOutlined
                    className="text-gray-600"
                    data-cy="dashboard-calendar-year-month-card-icon"
                  />
                  <span
                    className="text-base font-normal text-[#4d4d4d]"
                    data-cy="dashboard-calendar-year-month-card-title-text"
                  >
                    Schedules in {current.format('MMMM YYYY')}
                  </span>
                </div>
              }
              headStyle={{ borderBottom: 'none', padding: '0 10px 0 10px' }}
              bodyStyle={{ padding: '8px 10px' }}
              style={{ width: '100%' }}
              className="border border-[#D9D9D9]"
            >
              <div
                className="max-h-48 overflow-y-auto pr-1 md:max-h-64 scrollbar-none"
                data-cy="dashboard-calendar-year-month-scroll"
              >
                {sortedEvents.map((event) => {
                  const primary =
                    event.category === 'meetings'
                      ? event.title ||
                        event.name ||
                        MOBILE_CATEGORY_LABEL.meetings
                      : event.category === 'surveys'
                        ? event.name || MOBILE_CATEGORY_LABEL.surveys
                        : event.title ||
                          event.name ||
                          MOBILE_CATEGORY_LABEL.actionPlans;

                  const start = dayjs(event.startAt);
                  let sublabel = start.format('YYYY-MM-DD');
                  if (event.category === 'meetings' && event.startAt) {
                    sublabel = `${start.format('YYYY-MM-DD')} · ${start.format('h:mm A')}`;
                  } else if (event.endAt) {
                    const end = dayjs(event.endAt);
                    if (!end.isSame(start, 'day')) {
                      sublabel = `${start.format('YYYY-MM-DD')} – ${end.format('YYYY-MM-DD')}`;
                    }
                  }

                  const routeId =
                    event.category === 'meetings' && event.id != null
                      ? String(event.id)
                      : event.category === 'surveys' &&
                          (event.formId != null || event.id != null)
                        ? String(event.formId ?? event.id)
                        : undefined;

                  const canNavigate =
                    event.category === 'actionPlans' ||
                    (event.category === 'meetings' && Boolean(routeId)) ||
                    (event.category === 'surveys' && Boolean(routeId));

                  const rowInner = (
                    <div
                      className="flex items-start gap-2"
                      data-cy="dashboard-calendar-year-month-row-inner"
                    >
                      <span
                        className={`inline-block h-2 w-2 shrink-0 rounded-full ${MOBILE_CATEGORY_DOT[event.category as ScheduleCategory]}`}
                        aria-hidden
                        data-cy="dashboard-calendar-year-month-row-dot"
                      />
                      <span
                        className="min-w-0 flex-1"
                        data-cy="dashboard-calendar-year-month-row-text-wrap"
                      >
                        <span
                          className="block text-sm font-medium text-gray-900"
                          data-cy="dashboard-calendar-year-month-row-primary"
                        >
                          {primary}
                        </span>
                        <span
                          className="block text-xs text-gray-500"
                          data-cy="dashboard-calendar-year-month-row-date"
                        >
                          {sublabel}
                        </span>
                      </span>
                    </div>
                  );

                  return (
                    <div
                      key={`${event.category}-${event.startAt}-${event.id ?? event.formId ?? ''}`}
                      className="border-b border-gray-100 py-2 last:border-b-0"
                      data-cy="dashboard-calendar-year-month-item"
                    >
                      {canNavigate ? (
                        <button
                          type="button"
                          className="flex w-full cursor-pointer items-start gap-2 rounded-md border-0 bg-transparent p-0 text-left hover:bg-gray-50 active:bg-gray-100"
                          onClick={() =>
                            navigateForCategory(
                              event.category as ScheduleCategory,
                              routeId,
                            )
                          }
                          data-cy="dashboard-calendar-year-month-item-nav"
                        >
                          {rowInner}
                        </button>
                      ) : (
                        rowInner
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}
      >
        <div
          className="flex cursor-pointer flex-col items-center gap-1"
          data-cy="dashboard-calendar-year-month-trigger"
        >
          <div
            className="flex flex-row items-center justify-center gap-0.5"
            data-cy="dashboard-calendar-year-month-dots-row"
          >
            {categoriesPresent.map((c) => (
              <span
                key={c}
                className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${MOBILE_CATEGORY_DOT[c]}`}
                aria-hidden
                data-cy={`dashboard-calendar-year-month-dot-${c}`}
              />
            ))}
          </div>
          <span
            className="max-w-full px-0.5 text-center text-[10px] leading-tight text-gray-600"
            data-cy="dashboard-calendar-year-month-day-numbers"
          >
            {dayNumbers.join(', ')}
          </span>
        </div>
      </Dropdown>
    );
  };

  const cellRender: CalendarProps<Dayjs>['cellRender'] = (current, info) => {
    if (info.type === 'month') {
      return monthCellRender(current);
    }
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

    const handleResetCalendarFilters = () => {
      onChange?.(dayjs());
      onTypeChange?.('month');
    };

    const calendarFilterPopoverContent = (
      <div
        className="min-w-[320px] p-2"
        data-cy="dashboard-calendar-filter-popover"
      >
        <div className="mb-4" data-cy="dashboard-calendar-filter-intro">
          <h3
            className="mb-1 px-1 text-base font-semibold"
            data-cy="dashboard-calendar-filter-title"
          >
            Filter
          </h3>
          <p
            className="mb-4 px-1 text-sm font-semibold text-gray-600"
            data-cy="dashboard-calendar-filter-description"
          >
            Select year, month and calendar view
          </p>
          <div className="space-y-4" data-cy="dashboard-calendar-filter-fields">
            <Select
              className="w-full"
              size="large"
              value={year}
              options={yearOptions}
              onChange={handleYearChange}
              data-cy="calendar-filter-year-select"
            />
            <Select
              className="w-full"
              size="large"
              value={month}
              options={monthOptions}
              onChange={handleMonthChange}
              data-cy="calendar-filter-month-select"
            />
            <Select
              className="w-full"
              size="large"
              value={type}
              popupMatchSelectWidth={false}
              options={[
                { label: 'Month', value: 'month' },
                { label: 'Year', value: 'year' },
              ]}
              onChange={(v) => onTypeChange?.(v)}
              data-cy="calendar-filter-view-select"
            />
          </div>
        </div>
        <div
          className="flex justify-end gap-2 border-t border-gray-100 pt-4"
          data-cy="dashboard-calendar-filter-footer"
        >
          <Button
            type="default"
            className="h-8 rounded-lg py-1"
            onClick={handleResetCalendarFilters}
            data-cy="dashboard-calendar-filter-reset"
          >
            Reset
          </Button>
          <Button
            className="h-8 rounded-lg border-none bg-[#1e40af] py-1 text-white"
            onClick={() => setCalendarFilterOpen(false)}
            data-cy="dashboard-calendar-filter-done"
          >
            Done
          </Button>
        </div>
      </div>
    );

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

          {isMobile ? (
            <Popover
              placement="bottomRight"
              trigger="click"
              open={calendarFilterOpen}
              onOpenChange={setCalendarFilterOpen}
              content={calendarFilterPopoverContent}
            >
              <Button
                type="default"
                size="large"
                className="flex h-8 items-center gap-2 rounded-lg border-gray-300 bg-blue-600 px-6"
                icon={
                  <FilterAltOutlinedIcon
                    className="text-gray-600"
                    fontSize="small"
                  />
                }
                data-cy="dashboard-calendar-filter-toggle-btn"
              >
                <span
                  className="text-sm text-gray-600"
                  data-cy="dashboard-calendar-filter-toggle-label"
                >
                  Filter
                </span>
              </Button>
            </Popover>
          ) : (
            <div
              className="flex items-center justify-end gap-2 md:gap-3"
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
                size="small"
                value={type}
                onChange={(e) => onTypeChange?.(e.target.value)}
                data-cy="calendar-view-toggle"
              >
                <Radio.Button value="month">Month</Radio.Button>
                <Radio.Button value="year">Year</Radio.Button>
              </Radio.Group>
            </div>
          )}
        </div>
      </div>
    );
  };

  const openMobileItem = (item: ListItem) => {
    const canNavigate =
      item.category === 'actionPlans' ||
      (item.category === 'meetings' && item.routeId) ||
      (item.category === 'surveys' && item.routeId);
    if (!canNavigate) return;
    setMobileSheetOpen(false);
    navigateForCategory(item.category, item.routeId);
  };

  return (
    <div
      className="min-h-[620px] h-full rounded-lg border border-gray-200 bg-white p-3"
      data-cy="calendar-container"
    >
      <Calendar
        headerRender={headerRender}
        // fullscreen={false}
        cellRender={cellRender}
        onChange={handleDateChange}
        data-cy="calendar"
      />

      <Drawer
        title={mobileSheetDateLabel || 'Schedule'}
        placement="bottom"
        height="auto"
        open={mobileSheetOpen}
        onClose={() => setMobileSheetOpen(false)}
        destroyOnClose
        classNames={{ body: '!pt-2' }}
        data-cy="calendar-mobile-schedule-sheet"
      >
        <ul
          className="m-0 list-none space-y-3 p-0 pb-4"
          data-cy="calendar-mobile-schedule-list"
        >
          {mobileSheetItems.map((item) => {
            const canNavigate =
              item.category === 'actionPlans' ||
              (item.category === 'meetings' && item.routeId) ||
              (item.category === 'surveys' && item.routeId);
            const label = MOBILE_CATEGORY_LABEL[item.category];
            return (
              <li
                key={`${item.category}-${item.routeId ?? ''}`}
                data-cy={`calendar-mobile-schedule-item-${item.category}`}
              >
                <button
                  type="button"
                  disabled={!canNavigate}
                  onClick={() => openMobileItem(item)}
                  className={`flex w-full items-center gap-3 rounded-xl bg-sky-50 px-3 py-3 text-left ${
                    canNavigate
                      ? 'cursor-pointer active:bg-sky-100'
                      : 'cursor-not-allowed opacity-60'
                  }`}
                  data-cy={`calendar-mobile-row-${item.category}`}
                >
                  <span
                    className={`inline-block h-3 w-3 shrink-0 rounded-full ${MOBILE_CATEGORY_DOT[item.category]}`}
                    aria-hidden
                    data-cy="calendar-mobile-category-dot"
                  />
                  <span
                    className="flex-1 text-sm font-medium text-gray-900"
                    data-cy="calendar-mobile-category-label"
                  >
                    {label}
                  </span>
                  {item.category === 'meetings' && item.timeLabel ? (
                    <span
                      className="shrink-0 rounded-md border border-gray-300 bg-white px-2 py-0.5 text-xs text-gray-700"
                      data-cy="calendar-mobile-meeting-time"
                    >
                      {item.timeLabel}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </Drawer>
    </div>
  );
};

export default Calender;
