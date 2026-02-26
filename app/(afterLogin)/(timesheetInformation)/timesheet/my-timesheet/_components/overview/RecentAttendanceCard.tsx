'use client';

import { Card, List, Typography, Tag } from 'antd';
import Link from 'next/link';
import dayjs from 'dayjs';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetAttendances } from '@/store/server/features/timesheet/attendance/queries';
import { AttendanceRequestBody } from '@/store/server/features/timesheet/attendance/interface';
import {
  AttendanceRecord,
  AttendanceRecordType,
} from '@/types/timesheet/attendance';
import { formatToAttendanceStatuses } from '@/helpers/formatTo';

const { Text } = Typography;

const DATE_FORMAT = 'MMM D, YYYY';
const TIME_FORMAT = 'HH:mm';

const RECENT_LIMIT = 5;
const RECENT_DAYS = 14;

const ATTENDANCE_STATUS_TAG_COLOR: Record<AttendanceRecordType, string> = {
  [AttendanceRecordType.PRESENT]: 'blue',
  [AttendanceRecordType.LATE]: 'warning',
  [AttendanceRecordType.EARLY]: 'warning',
  [AttendanceRecordType.ABSENT]: 'error',
};

export default function RecentAttendanceCard() {
  const { userId } = useAuthenticationStore();
  const end = dayjs();
  const start = end.subtract(RECENT_DAYS, 'day');

  const filter: Partial<AttendanceRequestBody['filter']> = {
    userIds: [userId ?? ''],
    date: { from: start.format('YYYY-MM-DD'), to: end.format('YYYY-MM-DD') },
  };

  const { data, isFetching } = useGetAttendances(
    { page: 1, limit: RECENT_LIMIT },
    { filter },
    true,
    true,
  );

  const items = data?.items ?? [];

  const renderTimeDisplay = (record: AttendanceRecord) => {
    if (record.startAt && !record.endAt) {
      return `In: ${dayjs(record.startAt).format('HH:mm:ss')}`;
    }
    if (record.startAt && record.endAt) {
      return `${dayjs(record.startAt).format(TIME_FORMAT)} - ${dayjs(record.endAt).format(TIME_FORMAT)}`;
    }
    return '—';
  };

  const renderStatus = (record: AttendanceRecord) => {
    const statuses = formatToAttendanceStatuses(record);
    return statuses.map((s) => (
      <div
        key={s.status}
        className="flex flex-col items-end"
        data-cy={`my-timesheet-overview-recent-attendance-status-wrap-${s.status}`}
      >
        <Tag
          color={ATTENDANCE_STATUS_TAG_COLOR[s.status]}
          data-cy={`my-timesheet-overview-recent-attendance-status-${s.status}`}
        >
          {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
        </Tag>
        {s.text ? (
          <Text
            className="text-xs text-gray-500 mt-0.5 block"
            data-cy={`my-timesheet-overview-recent-attendance-status-text-${s.status}`}
          >
            {s.text}
          </Text>
        ) : null}
      </div>
    ));
  };

  return (
    <Card
      className="shadow-sm h-full max-h-[450px] [&_.ant-card-body]:h-full [&_.ant-card-body]:flex [&_.ant-card-body]:flex-col [&_.ant-card-body]:!p-4"
      data-cy="my-timesheet-overview-recent-attendance-card"
      id="my-timesheet-overview-recent-attendance-card"
    >
      <div
        className="mb-1 shrink-0"
        data-cy="my-timesheet-overview-recent-attendance-header"
      >
        <span
          className="block text-lg font-semibold text-gray-900"
          data-cy="my-timesheet-overview-recent-attendance-title"
        >
          Recent Attendance
        </span>
        <Link
          href="/timesheet/my-timesheet/attendance"
          className="text-primary text-xs font-medium inline-block underline"
          data-cy="my-timesheet-overview-recent-attendance-view-all"
        >
          View All
        </Link>
      </div>
      <div
        className="flex-1 min-h-0 overflow-y-auto pt-2 pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:w-0"
        data-cy="my-timesheet-overview-recent-attendance-list-container"
      >
        <List
          loading={isFetching}
          dataSource={items}
          locale={{ emptyText: 'No recent attendance' }}
          data-cy="my-timesheet-overview-recent-attendance-list"
          className="[&_.ant-list-item]:!py-1.5 [&_.ant-list-item]:!px-0"
          renderItem={(record) => (
            <List.Item
              className="!border-0 !border-b-0 !p-0"
              data-cy={`my-timesheet-overview-recent-attendance-item-${record.id}`}
            >
              <div
                className="flex w-full items-center justify-between rounded-md border border-gray-200 p-3"
                data-cy={`my-timesheet-overview-recent-attendance-row-${record.id}`}
              >
                <div
                  className="min-w-0 flex-1"
                  data-cy={`my-timesheet-overview-recent-attendance-row-content-${record.id}`}
                >
                  <Text
                    className="block text-gray-900 text-sm mb-1"
                    data-cy={`my-timesheet-overview-recent-attendance-row-date-${record.id}`}
                  >
                    {dayjs(record.createdAt).format(DATE_FORMAT)}
                  </Text>
                  <Text
                    className="block   text-xs"
                    data-cy={`my-timesheet-overview-recent-attendance-row-time-${record.id}`}
                  >
                    {renderTimeDisplay(record)}
                  </Text>
                </div>
                <div
                  className="shrink-0 flex flex-wrap justify-end gap-1"
                  data-cy={`my-timesheet-overview-recent-attendance-row-status-${record.id}`}
                >
                  {renderStatus(record)}
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>
    </Card>
  );
}
