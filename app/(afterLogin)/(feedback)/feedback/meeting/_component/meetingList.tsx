'use client'; // if using Next.js 13+ App Router
// components/MeetingList.tsx
import React, { useEffect } from 'react';
import { Input, Select, DatePicker, Card, Avatar, Tooltip, Spin } from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  EnvironmentOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { FiUsers } from 'react-icons/fi';
import { useGetMeetings } from '@/store/server/features/CFR/meeting/queries';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import Link from 'next/link';
import CustomPagination from '@/components/customPagination';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import { useGetUserDepartment } from '@/store/server/features/okrplanning/okr/department/queries';
import { useGetMeetingType } from '@/store/server/features/CFR/meeting/type/queries';

const { RangePicker } = DatePicker;

const MeetingList = () => {
  const {
    pageSize,
    setPagesize,
    current,
    setCurrent,
    setDepartmentId,
    departmentId,
    meetingTypeId,
    setMeetingTypeId,
  } = useMeetingStore();

  const {
    data: meetings,
    isLoading: meetingLoading,
    refetch,
  } = useGetMeetings(
    pageSize,
    current,
    meetingTypeId ?? '',
    departmentId ?? '',
  );
  useEffect(() => {
    refetch();
  }, [pageSize, current, meetingTypeId, departmentId, refetch]);
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
      <div className="flex gap-2 items-center">
        <Tooltip title={type == 'all' ? '' : userName}>
          <Avatar src={profileImage} icon={<UserOutlined />} />
        </Tooltip>

        {type == 'all' && <div>{userName}</div>}
      </div>
    );
  };
  const onMeetingChange = (page: number, pageSize?: number) => {
    setCurrent(page);
    if (pageSize) {
      setPagesize(pageSize);
    }
  };
  const { data: Departments } = useGetUserDepartment();
  const { data: meetTypes } = useGetMeetingType();

  const departmentOptions = Departments?.map((i) => ({
    value: i.id,
    label: i?.name,
  }));
  const meetingOptions = meetTypes?.items?.map((i: any) => ({
    value: i.id,
    label: i?.name,
  }));

  return (
    <Spin spinning={meetingLoading} tip="Loading...">
      <div className=" space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-12 gap-2 items-center">
          <Input.Search placeholder="Search Meeting" className="col-span-3  " />
          <Select
            showSearch
            placeholder="Select meeting type"
            allowClear
            maxTagCount={1}
            filterOption={(input: any, option: any) =>
              (option?.label ?? '')?.toLowerCase().includes(input.toLowerCase())
            }
            options={meetingOptions}
            className="col-span-3"
            onChange={(value) => setMeetingTypeId(value)}
          />

          <Select
            showSearch
            placeholder="Select department"
            allowClear
            filterOption={(input: any, option: any) =>
              (option?.label ?? '')?.toLowerCase().includes(input.toLowerCase())
            }
            mode="multiple"
            options={departmentOptions}
            maxTagCount={1}
            className="col-span-3"
            onChange={(value) => setDepartmentId(value)}
          />

          <RangePicker format="DD MMM YYYY" className="col-span-3" />
        </div>

        {/* Meeting Cards */}
        {meetings?.items?.length !== 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetings?.items?.map((meeting: any, index: number) => (
              <Link
                key={index}
                href={`/feedback/meeting/${meeting.id}`}
                passHref
              >
                <Card
                  loading={meetingLoading}
                  bodyStyle={{ padding: 10 }}
                  title={
                    <div className="flex flex-col">
                      {' '}
                      <span className="text-md"> {meeting.title}</span>{' '}
                      <span className="text-sm font-normal text-gray-500">
                        {meeting.meetingType?.name || '-'}
                      </span>
                    </div>
                  }
                  className="shadow-md rounded-xl h-full"
                >
                  <div className="space-y-1 text-sm text-gray-600 ">
                    <div className="flex items-center gap-2">
                      <CalendarOutlined className="text-blue" />
                      <div className="flex flex-col">
                        <span className="font-bold">Date</span>
                        <span>
                          {dayjs(meeting.createdAt).format('YYYY-MM-DD')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserOutlined className="text-blue" />
                      <div className="flex flex-col">
                        <span className="font-bold">Chair person:</span>
                        <span>
                          <EmployeeDetails
                            type="all"
                            empId={meeting.chairpersonId}
                          />
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserOutlined className="text-blue" />
                      <div className="flex flex-col">
                        <span className="font-bold">Facilitator:</span>
                        <span>
                          <EmployeeDetails
                            type="all"
                            empId={meeting.facilitatorId}
                          />
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <EnvironmentOutlined className="text-blue" />
                      <div className="flex flex-col">
                        <span className="font-bold">Location</span>
                        <span>
                          <span>
                            {meeting.locationType} •{' '}
                            <strong>
                              {meeting.locationType == 'virtual'
                                ? meeting.virtualLink
                                : meeting?.physicalLocation}
                            </strong>
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <FiUsers className="text-blue" />
                      <div className="flex flex-col">
                        <div className="font-bold">Attendees</div>
                        {meeting?.attendees?.length > 0 ? (
                          <Avatar.Group
                            maxCount={5}
                            maxStyle={{
                              color: '#f56a00',
                              backgroundColor: '#fde3cf',
                            }}
                            className="mt-1"
                          >
                            {meeting.attendees
                              ?.filter((i: any) => i.userId)
                              .map((attendee: any) => (
                                <EmployeeDetails
                                  key={attendee.userId}
                                  type="avatar"
                                  empId={attendee.userId}
                                />
                              ))}
                          </Avatar.Group>
                        ) : (
                          '-'
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className=" text-2xl text-gray-500">You Have No Meetings</p>
          </div>
        )}
        <CustomPagination
          current={meetings?.meta?.currentPage}
          total={meetings?.meta?.totalItems}
          pageSize={pageSize}
          onChange={onMeetingChange}
          onShowSizeChange={onMeetingChange}
        />
      </div>
    </Spin>
  );
};

export default MeetingList;
