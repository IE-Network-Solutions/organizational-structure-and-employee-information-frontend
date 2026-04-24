'use client';

import { Button, Card, List, Skeleton, Tag, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetWorkFromHomeRequest } from '@/store/server/features/timesheet/workFromHome/queries';
import Link from 'next/link';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import { LeaveRequestStatus } from '@/types/timesheet/settings';
import AccessGuard from '@/utils/permissionGuard';

const { Text } = Typography;

const RECENT_LIMIT = 5;
const DATE_FORMAT = 'MMM D, YYYY';

/** Same Ant Tag colors as `RecentLeaveRequestCard`. */
const LEAVE_STATUS_TAG_COLOR: Record<LeaveRequestStatus, string> = {
  [LeaveRequestStatus.PENDING]: 'warning',
  [LeaveRequestStatus.APPROVED]: 'blue',
  [LeaveRequestStatus.DECLINED]: 'error',
};

function normalizeWfhStatus(raw: unknown): LeaveRequestStatus {
  const s = String(raw ?? '')
    .trim()
    .toLowerCase();
  if (s === LeaveRequestStatus.APPROVED || s === 'approve') {
    return LeaveRequestStatus.APPROVED;
  }
  if (s === LeaveRequestStatus.DECLINED || s === 'rejected' || s === 'reject') {
    return LeaveRequestStatus.DECLINED;
  }
  return LeaveRequestStatus.PENDING;
}

export default function RecentWorkFromHomeRequestCard() {
  const { userId } = useAuthenticationStore();
  const { setIsShowWorkFromHomeRequestSidebar } = useMyTimesheetStore();
  const canViewAllWorkFromHome = AccessGuard.checkAccess({
    permissions: ['view-all-work-from-home-requests'],
  });

  const { data, isFetching } = useGetWorkFromHomeRequest(
    {
      page: 1,
      limit: RECENT_LIMIT,
      orderBy: 'createdAt',
      orderDirection: 'DESC',
    },
    { filter: { userIds: userId ? [userId] : [] } },
    true,
    !!userId,
  );

  const items = data?.items ?? [];

  const handleOpenCreate = () => {
    setIsShowWorkFromHomeRequestSidebar(true);
  };

  return (
    <>
      <Card
        className="shadow-sm h-full max-h-[450px] [&_.ant-card-body]:h-full [&_.ant-card-body]:flex [&_.ant-card-body]:flex-col [&_.ant-card-body]:!p-4"
        data-cy="my-timesheet-overview-recent-wfh-card"
        id="my-timesheet-overview-recent-wfh-card"
      >
        <div
          className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-2"
          data-cy="my-timesheet-overview-recent-wfh-header"
        >
          <div data-cy="my-timesheet-overview-recent-wfh-header-left">
            <span
              className="block text-lg font-semibold text-gray-900"
              data-cy="my-timesheet-overview-recent-wfh-title"
            >
              Recent Work From Home
            </span>
            <div
              className="mt-1 flex items-center gap-3"
              data-cy="my-timesheet-overview-recent-wfh-links-row"
            >
              <Link
                href="/timesheet/my-timesheet/work-from-home?scope=my"
                className="text-[#1A64DC] text-xs font-medium inline-block underline"
                data-cy="my-timesheet-overview-recent-wfh-view-all"
              >
                {canViewAllWorkFromHome ? 'View My Request' : 'View All'}
              </Link>
              {canViewAllWorkFromHome && (
                <Link
                  href="/timesheet/my-timesheet/work-from-home?scope=all"
                  className="text-[#1A64DC] text-xs font-medium inline-block underline"
                  data-cy="my-timesheet-overview-recent-wfh-all-employees"
                >
                  All Employees
                </Link>
              )}
            </div>
          </div>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            data-cy="my-timesheet-overview-recent-wfh-new-button"
            id="my-timesheet-overview-recent-wfh-new-button"
            className="font-medium"
          >
            New
          </Button>
        </div>
        <div
          className="flex-1 min-h-0 overflow-y-auto pt-2 pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:w-0"
          data-cy="my-timesheet-overview-recent-wfh-list-container"
        >
          {isFetching ? (
            <List
              dataSource={Array.from(
                { length: RECENT_LIMIT },
                (notUsed, index) => index,
              )}
              data-cy="my-timesheet-overview-recent-wfh-list-skeleton"
              className="[&_.ant-list-item]:!py-1.5 [&_.ant-list-item]:!px-0"
              renderItem={(index) => (
                <List.Item
                  className="!border-0 !border-b-0 !p-0"
                  data-cy={`my-timesheet-overview-recent-wfh-item-skeleton-${index}`}
                >
                  <div
                    className="flex w-full items-center justify-between gap-2 rounded-md border border-gray-200 p-3"
                    data-cy={`my-timesheet-overview-recent-wfh-item-skeleton-${index}-body`}
                  >
                    <div
                      className="min-w-0 flex-1"
                      data-cy={`my-timesheet-overview-recent-wfh-item-skeleton-${index}-text`}
                    >
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
              locale={{ emptyText: 'No recent work from home requests' }}
              data-cy="my-timesheet-overview-recent-wfh-list"
              className="[&_.ant-list-item]:!py-1.5 [&_.ant-list-item]:!px-0"
              renderItem={(item: any) => {
                const startAt =
                  item?.startAt || item?.date?.from || item?.createdAt;
                const endAt = item?.endAt || item?.date?.to || item?.createdAt;
                const status = normalizeWfhStatus(item?.status);
                const tagColor = LEAVE_STATUS_TAG_COLOR[status];
                return (
                  <List.Item
                    className="!border-0 !border-b-0 !p-0"
                    data-cy={`my-timesheet-overview-recent-wfh-item-${item.id || item.requestId || 'unknown'}`}
                  >
                    <div
                      className="flex w-full items-center justify-between gap-2 rounded-md border border-gray-200 p-3"
                      data-cy={`my-timesheet-overview-recent-wfh-item-${item.id || item.requestId || 'unknown'}-body`}
                    >
                      <div
                        className="min-w-0 flex-1"
                        data-cy={`my-timesheet-overview-recent-wfh-item-${item.id || item.requestId || 'unknown'}-text`}
                      >
                        <Text className="block text-gray-900 text-sm font-medium mb-2">
                          {item?.title || item?.requestType || 'Work From Home'}
                        </Text>
                        <Text className="block text-gray-600 text-xs mt-0.5">
                          {dayjs(startAt).isValid()
                            ? dayjs(startAt).format(DATE_FORMAT)
                            : '—'}{' '}
                          -{' '}
                          {dayjs(endAt).isValid()
                            ? dayjs(endAt).format(DATE_FORMAT)
                            : '—'}
                        </Text>
                      </div>
                      <Tag
                        color={tagColor}
                        data-cy={`my-timesheet-overview-recent-wfh-status-${status}`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Tag>
                    </div>
                  </List.Item>
                );
              }}
            />
          )}
        </div>
      </Card>
    </>
  );
}
