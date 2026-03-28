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
  Timeline,
  Tag,
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
    <Spin
      spinning={meetingLoading}
      tip="Loading..."
      data-cy="feedback-meeting-component-meetinglist-spin"
    >
      <div
        className=" space-y-6 "
        data-cy="feedback-meeting-component-meetinglist-div"
        id="feedback-meeting-component-meetinglist-div"
      >
        {/* Filters */}
        <div
          className=""
          data-cy="feedback-meeting-component-meetinglist-div-filters"
          id="feedback-meeting-component-meetinglist-div-filters"
        >
          {/* Filter Button for Mobile */}
          {isMobile && (
            <div
              className="flex justify-end items-center gap-2 mb-4"
              data-cy="feedback-meeting-component-meetinglist-div-mobile-filter"
              id="feedback-meeting-component-meetinglist-div-mobile-filter"
            >
              <div
                className="flex items-center justify-center w-10 h-10 text-black border border-gray-300 rounded-lg"
                data-cy="feedback-meeting-component-meetinglist-div-filter-icon-container"
                id="feedback-meeting-component-meetinglist-div-filter-icon-container"
              >
                <VscSettings
                  size={20}
                  onClick={() => setIsFilterModalOpen(true)}
                  data-cy="feedback-meeting-component-meetinglist-icon-settings"
                  id="feedback-meeting-component-meetinglist-icon-settings"
                />
              </div>
            </div>
          )}

          {/* Desktop Filters */}
          <div
            className={`grid gap-2 items-center ${isMobile ? 'hidden' : 'grid-cols-12'}`}
            data-cy="feedback-meeting-component-meetinglist-div-desktop-filters"
            id="feedback-meeting-component-meetinglist-div-desktop-filters"
          >
            <Input
              allowClear
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="Search Meeting"
              className={isMobile ? 'col-span-12' : 'col-span-4 h-12'}
              data-cy="feedback-meeting-component-meetinglist-input-search"
              id="feedback-meeting-component-meetinglist-input-search"
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
              data-cy="feedback-meeting-component-meetinglist-select-meeting-type"
              id="feedback-meeting-component-meetinglist-select-meeting-type"
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
              data-cy="feedback-meeting-component-meetinglist-select-department"
              id="feedback-meeting-component-meetinglist-select-department"
            />

            <RangePicker
              value={[startAt, endAt]}
              onChange={handleChangeRange}
              format="DD MMM YYYY"
              className={isMobile ? 'col-span-12' : 'col-span-4 h-12'}
              data-cy="feedback-meeting-component-meetinglist-range-picker"
              id="feedback-meeting-component-meetinglist-range-picker"
            />
          </div>
        </div>

        {/* Meeting Cards */}
        {meetings?.items?.length !== 0 ? (
          <div className="mt-6">
            <Timeline
              mode="left"
              data-cy="feedback-meeting-component-meetinglist-timeline"
              className="custom-meeting-timeline ml-[100px] mt-2"
              items={meetings?.items?.map((meeting: any) => ({
                style: { height: '76px', paddingBottom: 0 },
                dot: (
                  <div className="relative flex items-center justify-center top-1">
                    <div className="absolute right-6 w-24 text-right text-black/70 text-[13px] font-medium leading-none">
                      {dayjs(meeting.createdAt).format('YYYY-M-D')}
                    </div>
                    <div className="w-3.5 h-3.5 rounded-full border-[2.5px] border-[#1E40AF] bg-white translate-x-[0.5px]" />
                  </div>
                ),
                children: (
                  <Link
                    href={`/feedback/meeting/${meeting.id}`}
                    passHref
                    key={meeting.id}
                    className="block hover:no-underline group w-full ml-1 px-4 py-2 border border-transparent rounded-xl hover:border-[#B3D0F6] hover:bg-[#F2F7FF] transition-all -mt-2"
                  >
                    <div className="flex items-start justify-between w-full h-full">
                      <div className="flex flex-col gap-1">
                        <span className="text-black/70 font-medium text-[15px] max-w-[500px] truncate group-hover:text-blue-600 transition-colors">
                          {meeting.title}
                        </span>

                        <div className="flex items-center gap-4">
                          <Avatar.Group
                            maxCount={3}
                            size={24}
                            className="border-none"
                          >
                            {meeting.attendees?.slice(0, 3).map((att: any) => (
                              <EmployeeDetails
                                key={att.userId}
                                empId={att.userId}
                                type="avatar"
                              />
                            ))}
                          </Avatar.Group>
                          {meeting.attendees?.length > 3 && (
                            <span className="text-xs text-black/70">
                              +{meeting.attendees.length - 3}
                            </span>
                          )}

                          {meeting.virtualLink ||
                          meeting.locationType === 'virtual' ? (
                            <div
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.open(meeting.virtualLink, '_blank');
                              }}
                              className="px-3 py-1 bg-[#EBF4FF] text-[#1E57A3] text-[12px] font-medium rounded-md flex items-center gap-2 cursor-pointer hover:bg-blue-100 transition-all border border-[#DFEDFF]"
                            >
                              Zoom Meeting
                            </div>
                          ) : (
                            <div className="text-xs text-black/70 italic">
                              {meeting.physicalLocation || meeting.locationType}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-black/70 text-[11px] font-medium px-3 py-1 rounded border border-gray-200 mt-0">
                        {dayjs(meeting.createdAt).format('h:mmA')}
                      </div>
                    </div>
                  </Link>
                ),
              }))}
            />
          </div>
        ) : (
          <div
            className="flex justify-center items-center h-64"
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
            data-cy="feedback-meeting-component-meetinglist-pagination"
          />
        )}

        {/* Filter Modal for Mobile */}
        <Modal
          title="Filters"
          open={isFilterModalOpen}
          onCancel={() => setIsFilterModalOpen(false)}
          footer={
            <div
              className="flex justify-end items-center gap-2"
              data-cy="feedback-meeting-component-meetinglist-modal-footer"
              id="feedback-meeting-component-meetinglist-modal-footer"
            >
              <Button
                key="cancel"
                onClick={() => setIsFilterModalOpen(false)}
                data-cy="feedback-meeting-component-meetinglist-modal-button-cancel"
                id="feedback-meeting-component-meetinglist-modal-button-cancel"
              >
                Cancel
              </Button>
              <Button
                key="apply"
                type="primary"
                onClick={() => setIsFilterModalOpen(false)}
                data-cy="feedback-meeting-component-meetinglist-modal-button-apply"
                id="feedback-meeting-component-meetinglist-modal-button-apply"
              >
                Apply Filters
              </Button>
            </div>
          }
          width={isMobile ? '95%' : '50%'}
          centered
          data-cy="feedback-meeting-component-meetinglist-modal"
        >
          <div
            className="space-y-4"
            data-cy="feedback-meeting-component-meetinglist-modal-div-fields"
            id="feedback-meeting-component-meetinglist-modal-div-fields"
          >
            <div
              data-cy="feedback-meeting-component-meetinglist-modal-field-search"
              id="feedback-meeting-component-meetinglist-modal-field-search"
            >
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                data-cy="feedback-meeting-component-meetinglist-modal-label-search"
                id="feedback-meeting-component-meetinglist-modal-label-search"
              >
                Search Meeting
              </label>
              <Input
                allowClear
                onChange={(e) => handleSearchInput(e.target.value)}
                placeholder="Search Meeting"
                className="h-12"
                data-cy="feedback-meeting-component-meetinglist-modal-input-search"
                id="feedback-meeting-component-meetinglist-modal-input-search"
              />
            </div>

            <div
              data-cy="feedback-meeting-component-meetinglist-modal-field-meeting-type"
              id="feedback-meeting-component-meetinglist-modal-field-meeting-type"
            >
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                data-cy="feedback-meeting-component-meetinglist-modal-label-meeting-type"
                id="feedback-meeting-component-meetinglist-modal-label-meeting-type"
              >
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
                data-cy="feedback-meeting-component-meetinglist-modal-select-meeting-type"
                id="feedback-meeting-component-meetinglist-modal-select-meeting-type"
              />
            </div>

            <div
              data-cy="feedback-meeting-component-meetinglist-modal-field-department"
              id="feedback-meeting-component-meetinglist-modal-field-department"
            >
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                data-cy="feedback-meeting-component-meetinglist-modal-label-department"
                id="feedback-meeting-component-meetinglist-modal-label-department"
              >
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
                data-cy="feedback-meeting-component-meetinglist-modal-select-department"
                id="feedback-meeting-component-meetinglist-modal-select-department"
              />
            </div>

            <div
              data-cy="feedback-meeting-component-meetinglist-modal-field-date-range"
              id="feedback-meeting-component-meetinglist-modal-field-date-range"
            >
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                data-cy="feedback-meeting-component-meetinglist-modal-label-date-range"
                id="feedback-meeting-component-meetinglist-modal-label-date-range"
              >
                Date Range
              </label>
              <RangePicker
                value={[startAt, endAt]}
                onChange={handleChangeRange}
                format="DD MMM YYYY"
                className="w-full h-12"
                data-cy="feedback-meeting-component-meetinglist-modal-range-picker"
                id="feedback-meeting-component-meetinglist-modal-range-picker"
              />
            </div>
          </div>
        </Modal>
      </div>
    </Spin>
  );
};

export default MeetingList;
