import React from 'react';
import { Card, Progress, Typography } from 'antd';
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { FiUsers } from 'react-icons/fi';
import { useGetUserMeetings } from '@/store/server/features/CFR/meeting/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isToday from 'dayjs/plugin/isToday';
import isTomorrow from 'dayjs/plugin/isTomorrow';
import relativeTime from 'dayjs/plugin/relativeTime';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import dayjs from 'dayjs';
import Link from 'next/link';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);
const { Title, Text } = Typography;

const DashboardComponent = () => {
  const { userId } = useAuthenticationStore();
  const { data: userMeetings, isLoading: isMeetingsLoading } =
    useGetUserMeetings(userId);
  const formatSmartDateTime = (isoString: string) => {
    const date = dayjs(isoString);

    if (date.isToday()) {
      return `Today at ${date.format('h:mm A')}`;
    }

    if (date.isTomorrow()) {
      return `Tomorrow at ${date.format('h:mm A')}`;
    }

    const now = dayjs();
    if (date.isSame(now, 'week')) {
      return `${date.format('dddd')} at ${date.format('h:mm A')}`;
    }

    return `${date.format('MMMM D')} at ${date.format('h:mm A')}`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6" data-cy="feedback-conversation-component-conversationdashboard-div" id="feedback-conversation-component-conversationdashboard-div">
      {/* Meetings Card */}
      <Card
        loading={isMeetingsLoading}
        bodyStyle={{ padding: 0 }}
        className="flex-1 shadow-sm border-0 rounded-lg p-4 sm:p-6 max-h-72 lg:max-h-72"
        data-cy="feedback-conversation-component-conversationdashboard-card-meetings"
        id="feedback-conversation-component-conversationdashboard-card-meetings"
      >
        <div className="flex items-center gap-3 mb-2 border-b pb-2" data-cy="feedback-conversation-component-conversationdashboard-div-meetings-header" id="feedback-conversation-component-conversationdashboard-div-meetings-header">
          <div className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-100 rounded-lg flex items-center justify-center bg-light_purple" data-cy="feedback-conversation-component-conversationdashboard-div-meetings-icon-container" id="feedback-conversation-component-conversationdashboard-div-meetings-icon-container">
            <CalendarOutlined className="text-blue text-sm sm:text-lg" data-cy="feedback-conversation-component-conversationdashboard-icon-calendar" id="feedback-conversation-component-conversationdashboard-icon-calendar" />
          </div>
          <Link href={`/feedback/meeting`} data-cy="feedback-conversation-component-conversationdashboard-link-meetings" id="feedback-conversation-component-conversationdashboard-link-meetings">
            <Title
              level={5}
              className="!mb-0 !text-gray-800 text-sm sm:text-base"
              data-cy="feedback-conversation-component-conversationdashboard-title-meetings"
              id="feedback-conversation-component-conversationdashboard-title-meetings"
            >
              Meetings
            </Title>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 items-start sm:items-center mb-2" data-cy="feedback-conversation-component-conversationdashboard-div-meetings-stats" id="feedback-conversation-component-conversationdashboard-div-meetings-stats">
          <Link href={`/feedback/action-plan`} className="w-full sm:w-auto" data-cy="feedback-conversation-component-conversationdashboard-link-action-plans" id="feedback-conversation-component-conversationdashboard-link-action-plans">
            <div className="flex gap-2 justify-between items-center border rounded-lg p-2 w-full" data-cy="feedback-conversation-component-conversationdashboard-div-action-plans" id="feedback-conversation-component-conversationdashboard-div-action-plans">
              <div className="" data-cy="feedback-conversation-component-conversationdashboard-div-action-plans-count" id="feedback-conversation-component-conversationdashboard-div-action-plans-count">
                <div className="text-base sm:text-lg font-bold text-gray-900" data-cy="feedback-conversation-component-conversationdashboard-div-action-plans-total" id="feedback-conversation-component-conversationdashboard-div-action-plans-total">
                  {userMeetings?.totalActionPlans}
                </div>
                <Text className="text-gray-500 text-[11px] sm:text-[12px]" data-cy="feedback-conversation-component-conversationdashboard-text-action-plans-label" id="feedback-conversation-component-conversationdashboard-text-action-plans-label">
                  Action plans
                </Text>
              </div>
              <div className="" data-cy="feedback-conversation-component-conversationdashboard-div-action-plans-progress" id="feedback-conversation-component-conversationdashboard-div-action-plans-progress">
                <div className="text-right" data-cy="feedback-conversation-component-conversationdashboard-div-action-plans-resolved" id="feedback-conversation-component-conversationdashboard-div-action-plans-resolved">
                  <Text className="text-blue-600 text-[9px] sm:text-[10px] !mb-0 " data-cy="feedback-conversation-component-conversationdashboard-text-action-plans-resolved" id="feedback-conversation-component-conversationdashboard-text-action-plans-resolved">
                    <span className="font-bold text-blue" data-cy="feedback-conversation-component-conversationdashboard-span-action-plans-resolved-count" id="feedback-conversation-component-conversationdashboard-span-action-plans-resolved-count">
                      {userMeetings?.resolvedActionPlans}
                    </span>{' '}
                    resolved
                  </Text>
                </div>
                <Progress
                  percent={
                    userMeetings?.totalActionPlans
                      ? (userMeetings.resolvedActionPlans /
                          userMeetings.totalActionPlans) *
                        100
                      : 0
                  }
                  strokeColor="#3b82f6"
                  trailColor="#e5e7eb"
                  strokeWidth={6}
                  showInfo={false}
                  className="w-24 sm:w-32 !m-0"
                  data-cy="feedback-conversation-component-conversationdashboard-progress-action-plans"
                />
              </div>
            </div>
          </Link>

          <div className="text-right w-full sm:w-24" data-cy="feedback-conversation-component-conversationdashboard-div-upcoming-meetings" id="feedback-conversation-component-conversationdashboard-div-upcoming-meetings">
            <div className="text-base sm:text-lg font-bold text-gray-900" data-cy="feedback-conversation-component-conversationdashboard-div-upcoming-meetings-count" id="feedback-conversation-component-conversationdashboard-div-upcoming-meetings-count">
              {userMeetings?.totalUpcomingMeetings}
            </div>
            <Text className="text-gray-500 text-[11px] sm:text-[12px]" data-cy="feedback-conversation-component-conversationdashboard-text-upcoming-meetings-label" id="feedback-conversation-component-conversationdashboard-text-upcoming-meetings-label">
              Upcoming
            </Text>
          </div>
        </div>

        {userMeetings?.upcomingMeetings?.length > 0 ? (
          <div className="space-y-2 overflow-y-auto scrollbar-none h-28" data-cy="feedback-conversation-component-conversationdashboard-div-upcoming-meetings-list" id="feedback-conversation-component-conversationdashboard-div-upcoming-meetings-list">
            {userMeetings?.upcomingMeetings?.map(
              (meeting: any, index: number) => (
                <Link
                  href={`/feedback/meeting/${meeting?.id}`}
                  key={index}
                  className="flex items-center justify-between bg-light_purple/50 px-2 py-1 rounded-lg"
                  data-cy={`feedback-conversation-component-conversationdashboard-link-meeting-${meeting?.id}`}
                  id={`feedback-conversation-component-conversationdashboard-link-meeting-${meeting?.id}`}
                >
                  <div className="flex flex-col items-start gap-0 rounded-lg min-w-0 flex-1" data-cy={`feedback-conversation-component-conversationdashboard-div-meeting-info-${meeting?.id}`} id={`feedback-conversation-component-conversationdashboard-div-meeting-info-${meeting?.id}`}>
                    <Text className="font-medium text-gray-800 text-[11px] sm:text-[12px] truncate w-full" data-cy={`feedback-conversation-component-conversationdashboard-text-meeting-title-${meeting?.id}`} id={`feedback-conversation-component-conversationdashboard-text-meeting-title-${meeting?.id}`}>
                      {meeting?.title}
                    </Text>
                    <div className="flex items-center gap-1" data-cy={`feedback-conversation-component-conversationdashboard-div-meeting-time-${meeting?.id}`} id={`feedback-conversation-component-conversationdashboard-div-meeting-time-${meeting?.id}`}>
                      <ClockCircleOutlined className="text-blue-500 text-[9px] sm:text-[10px]" data-cy={`feedback-conversation-component-conversationdashboard-icon-clock-${meeting?.id}`} id={`feedback-conversation-component-conversationdashboard-icon-clock-${meeting?.id}`} />
                      <Text className="text-[9px] sm:text-[10px] text-blue" data-cy={`feedback-conversation-component-conversationdashboard-text-meeting-time-${meeting?.id}`} id={`feedback-conversation-component-conversationdashboard-text-meeting-time-${meeting?.id}`}>
                        {formatSmartDateTime(meeting?.startAt)}
                      </Text>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2" data-cy={`feedback-conversation-component-conversationdashboard-div-meeting-attendees-${meeting?.id}`} id={`feedback-conversation-component-conversationdashboard-div-meeting-attendees-${meeting?.id}`}>
                    <div className="w-5 h-5 sm:w-7 sm:h-7 bg-blue-100 rounded-lg flex items-center justify-center bg-light_purple" data-cy={`feedback-conversation-component-conversationdashboard-div-meeting-attendees-icon-container-${meeting?.id}`} id={`feedback-conversation-component-conversationdashboard-div-meeting-attendees-icon-container-${meeting?.id}`}>
                      <FiUsers className="text-blue-500 text-xs sm:text-sm text-blue" data-cy={`feedback-conversation-component-conversationdashboard-icon-users-${meeting?.id}`} id={`feedback-conversation-component-conversationdashboard-icon-users-${meeting?.id}`} />
                    </div>
                    <Text className="font-bold text-gray-900 text-[11px] sm:text-[12px]" data-cy={`feedback-conversation-component-conversationdashboard-text-meeting-attendees-count-${meeting?.id}`} id={`feedback-conversation-component-conversationdashboard-text-meeting-attendees-count-${meeting?.id}`}>
                      {meeting?.totalAttendees}
                    </Text>
                  </div>
                </Link>
              ),
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-28" data-cy="feedback-conversation-component-conversationdashboard-div-no-meetings" id="feedback-conversation-component-conversationdashboard-div-no-meetings">
            <Text className="text-gray-500 text-sm" data-cy="feedback-conversation-component-conversationdashboard-text-no-meetings" id="feedback-conversation-component-conversationdashboard-text-no-meetings">No upcoming meetings</Text>
          </div>
        )}
      </Card>

      {/* Surveys Card */}
      <Card
        bodyStyle={{ padding: 0 }}
        className="flex-1 shadow-sm border-0 rounded-lg p-4 sm:p-6 h-72 lg:h-72"
        data-cy="feedback-conversation-component-conversationdashboard-card-surveys"
        id="feedback-conversation-component-conversationdashboard-card-surveys"
      >
        <div className="flex items-center gap-3 mb-2 border-b pb-2" data-cy="feedback-conversation-component-conversationdashboard-div-surveys-header" id="feedback-conversation-component-conversationdashboard-div-surveys-header">
          <div className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-100 rounded-lg flex items-center justify-center bg-light_purple animate-pulse" data-cy="feedback-conversation-component-conversationdashboard-div-surveys-icon-container" id="feedback-conversation-component-conversationdashboard-div-surveys-icon-container"></div>
          <Link href={`/feedback/categories`} data-cy="feedback-conversation-component-conversationdashboard-link-surveys" id="feedback-conversation-component-conversationdashboard-link-surveys">
            <Title
              level={5}
              className="!mb-0 !text-gray-800 text-sm sm:text-base"
              data-cy="feedback-conversation-component-conversationdashboard-title-surveys"
              id="feedback-conversation-component-conversationdashboard-title-surveys"
            >
              Surveys
            </Title>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 items-start sm:items-center mb-2" data-cy="feedback-conversation-component-conversationdashboard-div-surveys-stats" id="feedback-conversation-component-conversationdashboard-div-surveys-stats">
          <div className="flex gap-2 justify-between items-center border rounded-lg p-2 w-full" data-cy="feedback-conversation-component-conversationdashboard-div-surveys-stats-action-plans" id="feedback-conversation-component-conversationdashboard-div-surveys-stats-action-plans">
            <div className="" data-cy="feedback-conversation-component-conversationdashboard-div-surveys-stats-action-plans-count" id="feedback-conversation-component-conversationdashboard-div-surveys-stats-action-plans-count">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-100 rounded-lg flex items-center justify-center bg-light_purple animate-pulse" data-cy="feedback-conversation-component-conversationdashboard-div-surveys-stats-action-plans-count-icon" id="feedback-conversation-component-conversationdashboard-div-surveys-stats-action-plans-count-icon"></div>
              <div className="text-gray-500 text-[11px] sm:text-[12px] w-24 sm:w-32 h-4 sm:h-5 my-1 bg-light_purple/50 animate-pulse rounded" data-cy="feedback-conversation-component-conversationdashboard-div-surveys-stats-action-plans-count-text" id="feedback-conversation-component-conversationdashboard-div-surveys-stats-action-plans-count-text"></div>
            </div>
            <div className="" data-cy="feedback-conversation-component-conversationdashboard-div-surveys-stats-action-plans-progress-container" id="feedback-conversation-component-conversationdashboard-div-surveys-stats-action-plans-progress-container">
              <div className="w-24 sm:w-32 h-2 bg-blue-100 rounded-lg flex items-center justify-center bg-light_purple mt-4 sm:mt-5 animate-pulse" data-cy="feedback-conversation-component-conversationdashboard-div-surveys-stats-action-plans-progress" id="feedback-conversation-component-conversationdashboard-div-surveys-stats-action-plans-progress"></div>
              <div className="text-gray-500 text-[11px] sm:text-[12px] w-24 sm:w-32 h-4 sm:h-5 my-1 bg-light_purple/50 animate-pulse rounded" data-cy="feedback-conversation-component-conversationdashboard-div-surveys-stats-action-plans-progress-text" id="feedback-conversation-component-conversationdashboard-div-surveys-stats-action-plans-progress-text"></div>
            </div>
          </div>

          <div className="text-right w-full sm:w-auto" data-cy="feedback-conversation-component-conversationdashboard-div-surveys-stats-upcoming-meetings" id="feedback-conversation-component-conversationdashboard-div-surveys-stats-upcoming-meetings">
            <div className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-100 rounded-lg flex items-center justify-center bg-light_purple animate-pulse mx-auto sm:mx-0" data-cy="feedback-conversation-component-conversationdashboard-div-surveys-stats-upcoming-meetings-icon" id="feedback-conversation-component-conversationdashboard-div-surveys-stats-upcoming-meetings-icon"></div>
            <div className="text-gray-500 text-[11px] sm:text-[12px] w-24 sm:w-32 h-4 sm:h-5 my-1 bg-light_purple/50 animate-pulse rounded mx-auto sm:mx-0" data-cy="feedback-conversation-component-conversationdashboard-div-surveys-stats-upcoming-meetings-text" id="feedback-conversation-component-conversationdashboard-div-surveys-stats-upcoming-meetings-text"></div>
          </div>
        </div>

        <div className="space-y-2 overflow-y-auto scrollbar-none h-28" data-cy="feedback-conversation-component-conversationdashboard-div-surveys-stats-list" id="feedback-conversation-component-conversationdashboard-div-surveys-stats-list">
          <div className="flex items-center justify-between bg-light_purple/50 px-2 py-1 rounded-lg animate-pulse" data-cy="feedback-conversation-component-conversationdashboard-div-surveys-stats-list-item-1" id="feedback-conversation-component-conversationdashboard-div-surveys-stats-list-item-1">
            <div className="flex flex-col items-start gap-0 rounded-lg h-6 sm:h-8 w-full" data-cy="feedback-conversation-component-conversationdashboard-div-surveys-stats-list-item-1" id="feedback-conversation-component-conversationdashboard-div-surveys-stats-list-item-1"></div>
          </div>
          <div className="flex items-center justify-between bg-light_purple/50 px-2 py-1 rounded-lg animate-pulse" data-cy="feedback-conversation-component-conversationdashboard-div-surveys-stats-list-item-2" id="feedback-conversation-component-conversationdashboard-div-surveys-stats-list-item-2">
            <div className="flex flex-col items-start gap-0 rounded-lg h-6 sm:h-8 w-full" data-cy="feedback-conversation-component-conversationdashboard-div-surveys-stats-list-item-2" id="feedback-conversation-component-conversationdashboard-div-surveys-stats-list-item-2"></div>
          </div>
          <div className="flex items-center justify-between bg-light_purple/50 px-2 py-1 rounded-lg animate-pulse" data-cy="feedback-conversation-component-conversationdashboard-div-surveys-stats-list-item-3" id="feedback-conversation-component-conversationdashboard-div-surveys-stats-list-item-3">
            <div className="flex flex-col items-start gap-0 rounded-lg h-6 sm:h-8 w-full" data-cy="feedback-conversation-component-conversationdashboard-div-surveys-stats-list-item-3" id="feedback-conversation-component-conversationdashboard-div-surveys-stats-list-item-3"></div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardComponent;
