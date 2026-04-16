'use client'; // if using Next.js 13+ App Router
// components/MeetingList.tsx
import React, { useEffect } from 'react';
import { Avatar, Tooltip, Timeline, Tag, ConfigProvider } from 'antd';
import { UserOutlined, LoadingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useGetMeetings } from '@/store/server/features/CFR/meeting/queries';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import Link from 'next/link';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import MeetingListFilters from './meetingListFilters';
import styles from './meetingList.module.css';

/** One request loads the list; scroll in the column instead of paginating. */
const MEETING_LIST_FETCH_LIMIT = 1000;
const MEETING_LIST_FETCH_PAGE = 1;

const meetingTimelineTheme = {
  components: {
    Timeline: {
      tailWidth: 2,
      tailColor: 'rgba(0, 0, 0, 0.06)',
    },
  },
};

const timelineLoadingRows = Array.from(
  { length: 4 },
  (unusedValue, rowIndex) => rowIndex,
);

const getMeetingTimelineDate = (meeting: any) =>
  meeting?.startAt ?? meeting?.createdAt;

interface MeetingListProps {
  selectedMeetingId?: string;
  /** When true, filters are rendered by the parent (e.g. full width above split layout). */
  hideFilters?: boolean;
  /**
   * When true with a fixed-height parent (e.g. xl split column), list fills height and the
   * timeline scrolls so it matches the detail / create-meeting panel (720px on desktop).
   */
  matchRightPanelHeight?: boolean;
  'data-cy'?: string;
}

const MeetingList = ({
  selectedMeetingId,
  hideFilters = false,
  matchRightPanelHeight = false,
  'data-cy': dataCy,
}: MeetingListProps) => {
  const { departmentId, meetingTypeId, startAt, endAt, title } =
    useMeetingStore();

  const {
    data: meetings,
    isLoading: meetingLoading,
    refetch,
  } = useGetMeetings(
    MEETING_LIST_FETCH_LIMIT,
    MEETING_LIST_FETCH_PAGE,
    meetingTypeId ?? '',
    departmentId ?? '',
    startAt ?? '',
    endAt ?? '',
    title ?? '',
  );
  useEffect(() => {
    refetch();
  }, [meetingTypeId, departmentId, startAt, endAt, title, refetch]);
  const EmployeeDetails = ({
    empId,
    type,
  }: {
    empId: string;
    type: string;
  }) => {
    const { data: userDetails, isLoading, error } = useGetEmployee(empId);

    if (isLoading)
      return (
        <>
          <LoadingOutlined />
        </>
      );

    if (error || !userDetails) return '-';

    const userName =
      `${userDetails?.firstName} ${userDetails?.middleName} ${userDetails?.lastName} ` ||
      '-';
    const profileImage = userDetails?.profileImage;
    return (
      <div
        className="flex gap-2 items-center"
        data-cy="meeting-list-user-container"
      >
        <Tooltip title={type == 'all' ? '' : userName}>
          <Avatar size={24} src={profileImage} icon={<UserOutlined />} />
        </Tooltip>

        {type == 'all' && (
          <div
            title={userName}
            className="font-bold"
            data-cy="meeting-list-user-name"
          >
            {userName?.length >= 24 ? userName?.slice(0, 24) + '...' : userName}
          </div>
        )}
      </div>
    );
  };

  const sortedMeetings = [...(meetings?.items ?? [])].sort((a: any, b: any) => {
    const now = dayjs();
    const aDate = dayjs(getMeetingTimelineDate(a));
    const bDate = dayjs(getMeetingTimelineDate(b));
    const aIsUpcoming = aDate.isAfter(now) || aDate.isSame(now);
    const bIsUpcoming = bDate.isAfter(now) || bDate.isSame(now);

    // Upcoming first (nearest first), then past (most recent first)
    if (aIsUpcoming !== bIsUpcoming) return aIsUpcoming ? -1 : 1;
    return aIsUpcoming
      ? aDate.valueOf() - bDate.valueOf()
      : bDate.valueOf() - aDate.valueOf();
  });

  const timelineItems = sortedMeetings.map((meeting: any) => ({
    style: { height: '76px', paddingBottom: 0 },
    dot: (
      <div
        className="flex w-[90px] shrink-0 items-center gap-2"
        data-cy="feedback-meeting-meetinglist-timeline-dot-wrap"
      >
        <div
          className="min-w-0 flex-1 whitespace-nowrap text-left text-[14px] font-medium leading-none text-black/70 tabular-nums"
          data-cy="feedback-meeting-meetinglist-timeline-date"
        >
          {dayjs(getMeetingTimelineDate(meeting)).format('YYYY-M-D')}
        </div>
        <div
          className="size-[10px] shrink-0 rounded-full border-[2px] border-[#1E40AF] bg-white"
          data-cy="feedback-meeting-meetinglist-timeline-node"
        />
      </div>
    ),
    children: (
      <Link
        href={`/feedback/meeting?id=${encodeURIComponent(meeting.id)}`}
        passHref
        key={meeting.id}
        scroll={false}
        className={`box-border block min-w-0 max-w-full hover:no-underline group w-full rounded-xl border border-solid px-4 py-2 transition-all ${
          selectedMeetingId === meeting.id
            ? 'border-[#1E40AF] bg-transparent'
            : 'border-[#D9D9D9] hover:border-[#1E40AF] hover:bg-[#F2F7FF]'
        }`}
      >
        <div
          className="flex h-full w-full items-start justify-between"
          data-cy="feedback-meeting-meetinglist-card-inner"
        >
          <div
            className="flex flex-col gap-1"
            data-cy="feedback-meeting-meetinglist-card-main"
          >
            <span
              className={`max-w-[500px] truncate text-[15px] font-medium transition-colors ${
                selectedMeetingId === meeting.id
                  ? 'text-[#1E40AF]'
                  : 'text-black/70 group-hover:text-blue-600'
              }`}
              data-cy="feedback-meeting-meetinglist-card-title"
            >
              {meeting.title}
            </span>

            <div
              className="flex items-center gap-4"
              data-cy="feedback-meeting-meetinglist-card-meta"
            >
              <Avatar.Group maxCount={3} size={24} className="border-none">
                {meeting.attendees?.slice(0, 3).map((att: any) => (
                  <EmployeeDetails
                    key={att.userId}
                    empId={att.userId}
                    type="avatar"
                  />
                ))}
              </Avatar.Group>
              {meeting.attendees?.length > 3 && (
                <span
                  className="text-xs text-black/70"
                  data-cy="feedback-meeting-meetinglist-attendees-more"
                >
                  +{meeting.attendees.length - 3}
                </span>
              )}

              {meeting.virtualLink || meeting.locationType === 'virtual' ? (
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(meeting.virtualLink, '_blank');
                  }}
                  className="flex h-[22px] min-h-[22px] cursor-pointer items-center gap-2 rounded-md border border-solid border-[#91CAFF] bg-[#E6F4FF] px-3 py-0 text-[12px] font-normal leading-none text-[#1677FF]"
                  data-cy="feedback-meeting-meetinglist-location-pill"
                >
                  Zoom Meeting
                </div>
              ) : (
                <div
                  className="flex h-[22px] min-h-[22px] items-center gap-2 rounded-md border border-solid border-[#91CAFF] bg-[#E6F4FF] px-3 py-0 text-[12px] font-normal leading-none text-[#1677FF]"
                  data-cy="feedback-meeting-meetinglist-location-pill"
                  title={meeting.physicalLocation || meeting.locationType}
                >
                  {meeting.physicalLocation || meeting.locationType}
                </div>
              )}
            </div>
          </div>

          <Tag
            className="!m-0 !inline-flex !h-[22px] !min-h-[22px] !w-[60px] !min-w-[60px] shrink-0 !items-center !justify-center !whitespace-nowrap !border !border-solid !border-[#D9D9D9] !bg-[rgba(0,0,0,0.02)] !px-1 !py-0 !text-[12px] !font-normal !leading-none !text-black/70"
            data-cy="feedback-meeting-component-meetinglist-time-tag"
          >
            {dayjs(getMeetingTimelineDate(meeting)).format('h:mmA')}
          </Tag>
        </div>
      </Link>
    ),
  }));

  const timelineClassName = `${styles.meetingTimeline} custom-meeting-timeline ${hideFilters ? 'mt-0' : 'mt-2'}`;

  const timelineNode = (
    <ConfigProvider theme={meetingTimelineTheme}>
      <Timeline
        mode="left"
        data-cy="feedback-meeting-component-meetinglist-timeline"
        className={timelineClassName}
        items={timelineItems}
      />
    </ConfigProvider>
  );

  if (matchRightPanelHeight) {
    return (
      <div
        className="flex w-full max-w-full min-w-0 flex-col xl:h-full xl:min-h-0"
        data-cy={dataCy ?? 'feedback-meeting-component-meetinglist-div'}
        id="feedback-meeting-component-meetinglist-div"
      >
        {meetingLoading ? (
          <div
            className="flex min-h-[200px] flex-1 flex-col gap-2 xl:min-h-0"
            data-cy="feedback-meeting-meetinglist-loading-wrap"
          >
            {timelineLoadingRows.map((loadingRow, index) => (
              <div
                key={`meeting-loading-row-${loadingRow}`}
                className="box-border flex min-h-[56px] w-full items-center justify-between rounded-xl border border-solid border-[#D9D9D9] bg-white px-4 py-2"
                data-cy={`feedback-meeting-meetinglist-loading-row-${index}`}
              >
                <div
                  className="h-3 w-1/3 rounded bg-black/10"
                  data-cy={`feedback-meeting-meetinglist-loading-row-title-${index}`}
                />
                <div
                  className="h-[22px] w-[60px] rounded border border-solid border-[#D9D9D9] bg-[rgba(0,0,0,0.02)]"
                  data-cy={`feedback-meeting-meetinglist-loading-row-time-${index}`}
                />
              </div>
            ))}
          </div>
        ) : meetings?.items?.length ? (
          <div
            className="flex min-h-0 flex-1 flex-col xl:min-h-0"
            data-cy="feedback-meeting-meetinglist-timeline-wrap"
          >
            <div
              className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden scrollbar-none pt-[2px]"
              data-cy="feedback-meeting-meetinglist-timeline-scroll"
            >
              {timelineNode}
            </div>
          </div>
        ) : (
          <div
            className="flex min-h-[200px] flex-1 items-center justify-center xl:min-h-0"
            data-cy="feedback-meeting-meetinglist-empty-wrap"
          >
            <p
              className="text-xl font-bold text-gray-500"
              data-cy="feedback-meeting-component-meetinglist-p-no-meetings"
              id="feedback-meeting-component-meetinglist-p-no-meetings"
            >
              You Have No Meetings
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className=" space-y-6 "
      data-cy={dataCy ?? 'feedback-meeting-component-meetinglist-div'}
      id="feedback-meeting-component-meetinglist-div"
    >
      {!hideFilters && <MeetingListFilters />}

      {meetingLoading ? (
        <div
          className="flex min-h-[200px] flex-col gap-2"
          data-cy="feedback-meeting-meetinglist-loading-wrap"
        >
          {timelineLoadingRows.map((loadingRowDefault, index) => (
            <div
              key={`meeting-loading-row-default-${loadingRowDefault}`}
              className="box-border flex min-h-[56px] w-full items-center justify-between rounded-xl border border-solid border-[#D9D9D9] bg-white px-4 py-2"
              data-cy={`feedback-meeting-meetinglist-loading-row-default-${index}`}
            >
              <div
                className="h-3 w-1/3 rounded bg-black/10"
                data-cy={`feedback-meeting-meetinglist-loading-row-default-title-${index}`}
              />
              <div
                className="h-[22px] w-[60px] rounded border border-solid border-[#D9D9D9] bg-[rgba(0,0,0,0.02)]"
                data-cy={`feedback-meeting-meetinglist-loading-row-default-time-${index}`}
              />
            </div>
          ))}
        </div>
      ) : meetings?.items?.length !== 0 ? (
        <div
          className={`${hideFilters ? 'mt-[15px]' : 'mt-6'} max-h-[min(720px,75vh)] min-h-0 min-w-0 overflow-y-auto overflow-x-hidden scrollbar-none`}
          data-cy="feedback-meeting-meetinglist-timeline-outer"
        >
          {timelineNode}
        </div>
      ) : (
        <div
          className="flex h-64 items-center justify-center"
          data-cy="feedback-meeting-component-meetinglist-div-no-meetings"
          id="feedback-meeting-component-meetinglist-div-no-meetings"
        >
          <p
            className="text-xl font-bold text-gray-500"
            data-cy="feedback-meeting-component-meetinglist-p-no-meetings"
            id="feedback-meeting-component-meetinglist-p-no-meetings"
          >
            You Have No Meetings
          </p>
        </div>
      )}
    </div>
  );
};

export default MeetingList;
