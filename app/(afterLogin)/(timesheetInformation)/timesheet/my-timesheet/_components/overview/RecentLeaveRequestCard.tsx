'use client';

import { Button, Card, List, Skeleton, Tag, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import Link from 'next/link';
import dayjs from 'dayjs';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/queries';
import { LeaveRequestBody } from '@/store/server/features/timesheet/leaveRequest/interface';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import { LeaveRequest, LeaveRequestStatus } from '@/types/timesheet/settings';

const { Text } = Typography;

const RECENT_LIMIT = 5;
const DATE_FORMAT = 'MMM D, YYYY';

const LEAVE_STATUS_TAG_COLOR: Record<LeaveRequestStatus, string> = {
  [LeaveRequestStatus.PENDING]: 'warning',
  [LeaveRequestStatus.APPROVED]: 'blue',
  [LeaveRequestStatus.DECLINED]: 'error',
};

export default function RecentLeaveRequestCard() {
  const { userId } = useAuthenticationStore();
  const { setIsShowLeaveRequestSidebar, setLeaveRequestSidebarData } =
    useMyTimesheetStore();

  const filter: Partial<LeaveRequestBody['filter']> = {
    userIds: [userId ?? ''],
  };

  const { data, isFetching } = useGetLeaveRequest(
    { page: 1, limit: RECENT_LIMIT },
    { filter },
    true,
    true,
  );

  const items = data?.items ?? [];

  const handleNewRequest = () => {
    setLeaveRequestSidebarData(null);
    setIsShowLeaveRequestSidebar(true);
  };

  return (
    <Card
      className="shadow-sm h-full max-h-[450px] [&_.ant-card-body]:h-full [&_.ant-card-body]:flex [&_.ant-card-body]:flex-col [&_.ant-card-body]:!p-4"
      data-cy="my-timesheet-overview-recent-leave-card"
      id="my-timesheet-overview-recent-leave-card"
    >
      <div
        className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-2"
        data-cy="my-timesheet-overview-recent-leave-header"
      >
        <div data-cy="my-timesheet-overview-recent-leave-header-left">
          <span
            className="block text-lg font-semibold text-gray-900"
            data-cy="my-timesheet-overview-recent-leave-title"
          >
            Recent Leave Request
          </span>
          <Link
            href="/timesheet/my-timesheet/leave"
            className="text-[#1A64DC] text-xs font-medium mt-1 inline-block underline"
            data-cy="my-timesheet-overview-recent-leave-view-all"
          >
            View All
          </Link>
        </div>
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={handleNewRequest}
          data-cy="my-timesheet-overview-recent-leave-new-button"
          id="my-timesheet-overview-recent-leave-new-button"
          className="font-medium"
        >
          New
        </Button>
      </div>
      <div
        className="flex-1 min-h-0 overflow-y-auto pt-2 pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:w-0"
        data-cy="my-timesheet-overview-recent-leave-list-container"
      >
        {isFetching ? (
          <List
            dataSource={Array.from({ length: RECENT_LIMIT }, (_, index) => index)}
            data-cy="my-timesheet-overview-recent-leave-list-skeleton"
            className="[&_.ant-list-item]:!py-1.5 [&_.ant-list-item]:!px-0"
            renderItem={(index) => (
              <List.Item
                className="!border-0 !border-b-0 !p-0"
                data-cy={`my-timesheet-overview-recent-leave-item-skeleton-${index}`}
              >
                <div className="flex w-full items-center justify-between gap-2 rounded-md border border-gray-200 p-3">
                  <div className="min-w-0 flex-1">
                    <Skeleton.Input active className="!h-4 !w-32 !mb-2" />
                    <Skeleton.Input active className="!h-3 !w-44" />
                  </div>
                  <Skeleton.Button active size="small" />
                </div>
              </List.Item>
            )}
          />
        ) : (
          <List
            dataSource={items}
            locale={{ emptyText: 'No recent leave requests' }}
            data-cy="my-timesheet-overview-recent-leave-list"
            className="[&_.ant-list-item]:!py-1.5 [&_.ant-list-item]:!px-0"
            renderItem={(item: LeaveRequest) => (
              <List.Item
                className="!border-0 !border-b-0 !p-0"
                data-cy={`my-timesheet-overview-recent-leave-item-${item.id}`}
              >
                <div
                  className="flex w-full items-center justify-between gap-2 rounded-md border border-gray-200 p-3"
                  data-cy={`my-timesheet-overview-recent-leave-row-${item.id}`}
                >
                  <div
                    className="min-w-0 flex-1"
                    data-cy={`my-timesheet-overview-recent-leave-row-content-${item.id}`}
                  >
                    <Text
                      className="block text-gray-900 text-sm font-medium mb-2"
                      data-cy={`my-timesheet-overview-recent-leave-row-type-${item.id}`}
                    >
                      {typeof item.leaveType === 'object' && item.leaveType?.title
                        ? item.leaveType.title
                        : '—'}
                    </Text>
                    <Text
                      className="block text-gray-600 text-xs mt-0.5"
                      data-cy={`my-timesheet-overview-recent-leave-row-dates-${item.id}`}
                    >
                      {dayjs(item.startAt).format(DATE_FORMAT)} -{' '}
                      {dayjs(item.endAt).format(DATE_FORMAT)}
                    </Text>
                  </div>
                  <Tag
                    color={LEAVE_STATUS_TAG_COLOR[item.status]}
                    data-cy={`my-timesheet-overview-recent-leave-status-${item.status}`}
                  >
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Tag>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
    </Card>
  );
}
