'use client';

import CustomPagination from '@/components/customPagination';
import { useGetMeetings } from '@/store/server/features/CFR/meeting/queries';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';

/**
 * Full-width pagination for the meetings list (same data source as MeetingList).
 * Rendered at page level so it spans both columns in split view, like filters.
 */
export default function MeetingListPagination() {
  const {
    pageSize,
    setPagesize,
    current,
    setCurrent,
    departmentId,
    meetingTypeId,
    startAt,
    endAt,
    title,
  } = useMeetingStore();

  const { data: meetings } = useGetMeetings(
    pageSize,
    current,
    meetingTypeId ?? '',
    departmentId ?? '',
    startAt ?? '',
    endAt ?? '',
    title ?? '',
  );

  if (!meetings?.items?.length) {
    return null;
  }

  return (
    <div
      className="w-full"
      data-cy="feedback-meeting-component-meetinglist-pagination-wrapper"
    >
      <CustomPagination
        current={meetings?.meta?.currentPage || 1}
        total={meetings?.meta?.totalItems || 1}
        pageSize={pageSize}
        onChange={(page, nextPageSize) => {
          setCurrent(page);
          setPagesize(nextPageSize);
        }}
        onShowSizeChange={(size) => {
          setPagesize(size);
          setCurrent(1);
        }}
        data-cy="feedback-meeting-component-meetinglist-pagination"
      />
    </div>
  );
}
