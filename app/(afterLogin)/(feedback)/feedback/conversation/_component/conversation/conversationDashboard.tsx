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
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      {/* Meetings Card */}
      <Card
        loading={isMeetingsLoading}
        bodyStyle={{ padding: 0 }}
        className="flex-1 shadow-sm border-0 rounded-lg p-4 sm:p-6 max-h-72 lg:max-h-72"
      >
        <div className="flex items-center gap-3 mb-2 border-b pb-2">
          <div className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-100 rounded-lg flex items-center justify-center bg-light_purple">
            <CalendarOutlined className="text-blue text-sm sm:text-lg" />
          </div>
          <Link href={`/feedback/meeting`}>
            <Title
              level={5}
              className="!mb-0 !text-gray-800 text-sm sm:text-base"
            >
              Meetings
            </Title>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 items-start sm:items-center mb-2">
          <Link href={`/feedback/action-plan`} className="w-full sm:w-auto">
            <div className="flex gap-2 justify-between items-center border rounded-lg p-2 w-full">
              <div className="">
                <div className="text-base sm:text-lg font-bold text-gray-900">
                  {userMeetings?.totalActionPlans}
                </div>
                <Text className="text-gray-500 text-[11px] sm:text-[12px]">
                  Action plans
                </Text>
              </div>
              <div className="">
                <div className="text-right">
                  <Text className="text-blue-600 text-[9px] sm:text-[10px] !mb-0 ">
                    <span className="font-bold text-blue">
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
                />
              </div>
            </div>
          </Link>

          <div className="text-right w-full sm:w-24">
            <div className="text-base sm:text-lg font-bold text-gray-900">
              {userMeetings?.totalUpcomingMeetings}
            </div>
            <Text className="text-gray-500 text-[11px] sm:text-[12px]">
              Upcoming
            </Text>
          </div>
        </div>

        {userMeetings?.upcomingMeetings?.length > 0 ? (
          <div className="space-y-2 overflow-y-auto scrollbar-none h-28">
            {userMeetings?.upcomingMeetings?.map(
              (meeting: any, index: number) => (
                <Link
                  href={`/feedback/meeting/${meeting?.id}`}
                  key={index}
                  className="flex items-center justify-between bg-light_purple/50 px-2 py-1 rounded-lg"
                >
                  <div className="flex flex-col items-start gap-0 rounded-lg min-w-0 flex-1">
                    <Text className="font-medium text-gray-800 text-[11px] sm:text-[12px] truncate w-full">
                      {meeting?.title}
                    </Text>
                    <div className="flex items-center gap-1">
                      <ClockCircleOutlined className="text-blue-500 text-[9px] sm:text-[10px]" />
                      <Text className="text-[9px] sm:text-[10px] text-blue">
                        {formatSmartDateTime(meeting?.startAt)}
                      </Text>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <div className="w-5 h-5 sm:w-7 sm:h-7 bg-blue-100 rounded-lg flex items-center justify-center bg-light_purple">
                      <FiUsers className="text-blue-500 text-xs sm:text-sm text-blue" />
                    </div>
                    <Text className="font-bold text-gray-900 text-[11px] sm:text-[12px]">
                      {meeting?.totalAttendees}
                    </Text>
                  </div>
                </Link>
              ),
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-28">
            <Text className="text-gray-500 text-sm">No upcoming meetings</Text>
          </div>
        )}
      </Card>

      {/* Surveys Card */}
      <Card
        bodyStyle={{ padding: 0 }}
        className="flex-1 shadow-sm border-0 rounded-lg p-4 sm:p-6 h-72 lg:h-72"
      >
        <div className="flex items-center gap-3 mb-2 border-b pb-2">
          <div className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-100 rounded-lg flex items-center justify-center bg-light_purple animate-pulse"></div>
          <Link href={`/feedback/categories`}>
            <Title
              level={5}
              className="!mb-0 !text-gray-800 text-sm sm:text-base"
            >
              Surveys
            </Title>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 items-start sm:items-center mb-2">
          <div className="flex gap-2 justify-between items-center border rounded-lg p-2 w-full">
            <div className="">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-100 rounded-lg flex items-center justify-center bg-light_purple animate-pulse"></div>
              <div className="text-gray-500 text-[11px] sm:text-[12px] w-24 sm:w-32 h-4 sm:h-5 my-1 bg-light_purple/50 animate-pulse rounded"></div>
            </div>
            <div className="">
              <div className="w-24 sm:w-32 h-2 bg-blue-100 rounded-lg flex items-center justify-center bg-light_purple mt-4 sm:mt-5 animate-pulse"></div>
              <div className="text-gray-500 text-[11px] sm:text-[12px] w-24 sm:w-32 h-4 sm:h-5 my-1 bg-light_purple/50 animate-pulse rounded"></div>
            </div>
          </div>

          <div className="text-right w-full sm:w-auto">
            <div className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-100 rounded-lg flex items-center justify-center bg-light_purple animate-pulse mx-auto sm:mx-0"></div>
            <div className="text-gray-500 text-[11px] sm:text-[12px] w-24 sm:w-32 h-4 sm:h-5 my-1 bg-light_purple/50 animate-pulse rounded mx-auto sm:mx-0"></div>
          </div>
        </div>

        <div className="space-y-2 overflow-y-auto scrollbar-none h-28">
          <div className="flex items-center justify-between bg-light_purple/50 px-2 py-1 rounded-lg animate-pulse">
            <div className="flex flex-col items-start gap-0 rounded-lg h-6 sm:h-8 w-full"></div>
          </div>
          <div className="flex items-center justify-between bg-light_purple/50 px-2 py-1 rounded-lg animate-pulse">
            <div className="flex flex-col items-start gap-0 rounded-lg h-6 sm:h-8 w-full"></div>
          </div>
          <div className="flex items-center justify-between bg-light_purple/50 px-2 py-1 rounded-lg animate-pulse">
            <div className="flex flex-col items-start gap-0 rounded-lg h-6 sm:h-8 w-full"></div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardComponent;
