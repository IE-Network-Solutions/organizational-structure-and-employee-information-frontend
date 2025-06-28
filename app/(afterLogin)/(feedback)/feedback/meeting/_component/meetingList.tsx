'use client'; // if using Next.js 13+ App Router
// components/MeetingList.tsx
import React, { useEffect, useState } from 'react';
import {
  Input,
  Select,
  DatePicker,
  Card,
  Avatar,
  Tooltip,
  Spin,
  Modal,
  Button,
} from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  EnvironmentOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { FiUsers } from 'react-icons/fi';
import { VscSettings } from 'react-icons/vsc';
import { useGetMeetings } from '@/store/server/features/CFR/meeting/queries';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import Link from 'next/link';
import CustomPagination from '@/components/customPagination';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import { useGetUserDepartment } from '@/store/server/features/okrplanning/okr/department/queries';
import { useGetAllMeetingType } from '@/store/server/features/CFR/meeting/type/queries';
import { useDebounce } from '../../../../../../utils/useDebounce';
import { useIsMobile } from '@/hooks/useIsMobile';

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
    startAt,
    setStartAt,
    endAt,
    setEndAt,
    title,
    setTitle,
  } = useMeetingStore();

  const { isMobile } = useIsMobile();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const {
    data: meetings,
    isLoading: meetingLoading,
    refetch,
  } = useGetMeetings(
    pageSize,
    current,
    meetingTypeId ?? '',
    departmentId ?? '',
    startAt ?? '',
    endAt ?? '',
    title ?? '',
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
          <Avatar size={24} src={profileImage} icon={<UserOutlined />} />
        </Tooltip>

        {type == 'all' && (
          <div title={userName} className="font-bold">
            {userName?.length >= 24 ? userName?.slice(0, 24) + '...' : userName}
          </div>
        )}
      </div>
    );
  };

  const { data: Departments } = useGetUserDepartment();
  const { data: meetTypes } = useGetAllMeetingType();

  const departmentOptions = Departments?.map((i) => ({
    value: i.id,
    label: i?.name,
  }));
  const meetingOptions = meetTypes?.items?.map((i: any) => ({
    value: i.id,
    label: i?.name,
  }));
  const handleChangeRange = (values: any) => {
    if (values) {
      setStartAt(values[0]);
      setEndAt(values[1]);
    } else {
      setStartAt('');
      setEndAt('');
    }
  };
  const handleTitleChange = (value: any) => {
    setTitle(value);
  };
  const onSearchChange = useDebounce(handleTitleChange, 2000);
  const handleSearchInput = (value: string) => {
    onSearchChange(value);
  };
  return (
    <Spin spinning={meetingLoading} tip="Loading...">
      <div className=" space-y-6 ">
        {/* Filters */}
        <div className="">
          {/* Filter Button for Mobile */}
          {isMobile && (
            <div className="flex justify-end items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 text-black border border-gray-300 rounded-lg">
                <VscSettings
                  size={20}
                  onClick={() => setIsFilterModalOpen(true)}
                />
              </div>
            </div>
          )}

          {/* Desktop Filters */}
          <div
            className={`grid gap-2 items-center ${isMobile ? 'hidden' : 'grid-cols-12'}`}
          >
            <Input
              allowClear
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="Search Meeting"
              className={isMobile ? 'col-span-12' : 'col-span-4 h-12'}
            />
            <Select
              showSearch
              placeholder="Select meeting type"
              allowClear
              maxTagCount={1}
              filterOption={(input: any, option: any) =>
                (option?.label ?? '')
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={meetingOptions}
              className={isMobile ? 'col-span-12' : 'col-span-2 h-12'}
              onChange={(value) => setMeetingTypeId(value)}
            />

            <Select
              showSearch
              placeholder="Select department"
              allowClear
              filterOption={(input: any, option: any) =>
                (option?.label ?? '')
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              mode="multiple"
              options={departmentOptions}
              maxTagCount={1}
              className={isMobile ? 'col-span-12' : 'col-span-2 h-12'}
              onChange={(value) => setDepartmentId(value)}
            />

            <RangePicker
              value={[startAt, endAt]}
              onChange={handleChangeRange}
              format="DD MMM YYYY"
              className={isMobile ? 'col-span-12' : 'col-span-4 h-12'}
            />
          </div>
        </div>

        {/* Meeting Cards */}
        {meetings?.items?.length !== 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ml-4">
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
                      <span className="text-base font-semibold text-black">
                        {' '}
                        {meeting.title}
                      </span>
                      <span className="text-sm font-normal text-black">
                        {meeting.meetingType?.name || '-'}
                      </span>
                    </div>
                  }
                  className="rounded-xl h-full border border-gray-200"
                  headStyle={{ borderBottom: 'none' }}
                >
                  <div className="space-y-2.5 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CalendarOutlined className="text-blue text-xl" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-black">Date</span>
                        <span className="font-bold">
                          {dayjs(meeting.createdAt).format('YYYY-MM-DD HH:mm')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserOutlined className="text-blue text-xl" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-black">
                          Chair person
                        </span>
                        <span>
                          <EmployeeDetails
                            type="all"
                            empId={meeting.chairpersonId}
                          />
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserOutlined className="text-blue text-xl" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-black">
                          Facilitator
                        </span>
                        <span>
                          <EmployeeDetails
                            type="all"
                            empId={meeting.facilitatorId}
                          />
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <EnvironmentOutlined className="text-blue text-xl" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-black">
                          Location
                        </span>
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
                      <FiUsers className="text-blue text-xl" />
                      <div className="flex flex-col">
                        <div className="font-semibold text-black">
                          Attendees
                        </div>
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
            <p className="text-xl font-bold text-gray-500">
              You Have No Meetings
            </p>
          </div>
        )}

        {meetings?.items?.length !== 0 && (
          <CustomPagination
            current={meetings?.meta?.currentPage || 1}
            total={meetings?.meta?.totalItems || 1}
            pageSize={pageSize}
            onChange={(page, pageSize) => {
              setCurrent(page);
              setPagesize(pageSize);
            }}
            onShowSizeChange={(size) => {
              setPagesize(size);
              setCurrent(1);
            }}
          />
        )}

        {/* Filter Modal for Mobile */}
        <Modal
          title="Filters"
          open={isFilterModalOpen}
          onCancel={() => setIsFilterModalOpen(false)}
          footer={
            <div className="flex justify-end items-center gap-2">
              <Button key="cancel" onClick={() => setIsFilterModalOpen(false)}>
                Cancel
              </Button>
              <Button
                key="apply"
                type="primary"
                onClick={() => setIsFilterModalOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          }
          width={isMobile ? '95%' : '50%'}
          centered
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Meeting
              </label>
              <Input
                allowClear
                onChange={(e) => handleSearchInput(e.target.value)}
                placeholder="Search Meeting"
                className="h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Type
              </label>
              <Select
                showSearch
                placeholder="Select meeting type"
                allowClear
                maxTagCount={1}
                filterOption={(input: any, option: any) =>
                  (option?.label ?? '')
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={meetingOptions}
                className="w-full h-12"
                onChange={(value) => setMeetingTypeId(value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <Select
                showSearch
                placeholder="Select department"
                allowClear
                filterOption={(input: any, option: any) =>
                  (option?.label ?? '')
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                mode="multiple"
                options={departmentOptions}
                maxTagCount={1}
                className="w-full h-12"
                onChange={(value) => setDepartmentId(value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <RangePicker
                value={[startAt, endAt]}
                onChange={handleChangeRange}
                format="DD MMM YYYY"
                className="w-full h-12"
              />
            </div>
          </div>
        </Modal>
      </div>
    </Spin>
  );
};

export default MeetingList;
