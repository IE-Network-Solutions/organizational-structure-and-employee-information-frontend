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
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ml-4"
            data-cy="feedback-meeting-component-meetinglist-div-meetings-grid"
            id="feedback-meeting-component-meetinglist-div-meetings-grid"
          >
            {meetings?.items?.map((meeting: any, index: number) => (
              <Link
                key={index}
                href={`/feedback/meeting/${meeting.id}`}
                passHref
                data-cy={`feedback-meeting-component-meetinglist-link-meeting-${meeting.id}`}
                id={`feedback-meeting-component-meetinglist-link-meeting-${meeting.id}`}
              >
                <Card
                  loading={meetingLoading}
                  bodyStyle={{ padding: 10 }}
                  title={
                    <div
                      className="flex flex-col"
                      data-cy={`feedback-meeting-component-meetinglist-div-card-title-${meeting.id}`}
                      id={`feedback-meeting-component-meetinglist-div-card-title-${meeting.id}`}
                    >
                      <span
                        className="text-base font-semibold text-black"
                        data-cy={`feedback-meeting-component-meetinglist-span-meeting-title-${meeting.id}`}
                        id={`feedback-meeting-component-meetinglist-span-meeting-title-${meeting.id}`}
                      >
                        {' '}
                        {meeting.title}
                      </span>
                      <span
                        className="text-sm font-normal text-black"
                        data-cy={`feedback-meeting-component-meetinglist-span-meeting-type-${meeting.id}`}
                        id={`feedback-meeting-component-meetinglist-span-meeting-type-${meeting.id}`}
                      >
                        {meeting.meetingType?.name || '-'}
                      </span>
                    </div>
                  }
                  className="rounded-xl h-full border border-gray-200"
                  headStyle={{ borderBottom: 'none' }}
                  data-cy={`feedback-meeting-component-meetinglist-card-${meeting.id}`}
                  id={`feedback-meeting-component-meetinglist-card-${meeting.id}`}
                >
                  <div
                    className="space-y-2.5 text-sm text-gray-600"
                    data-cy={`feedback-meeting-component-meetinglist-div-card-content-${meeting.id}`}
                    id={`feedback-meeting-component-meetinglist-div-card-content-${meeting.id}`}
                  >
                    <div
                      className="flex items-center gap-2"
                      data-cy={`feedback-meeting-component-meetinglist-div-card-content-date-${meeting.id}`}
                      id={`feedback-meeting-component-meetinglist-div-card-content-date-${meeting.id}`}
                    >
                      <CalendarOutlined
                        className="text-blue text-xl"
                        data-cy={`feedback-meeting-component-meetinglist-icon-date-${meeting.id}`}
                        id={`feedback-component-meetinglist-icon-date-${meeting.id}`}
                      />
                      <div
                        className="flex flex-col"
                        data-cy={`feedback-meeting-component-meetinglist-div-card-content-date-text-${meeting.id}`}
                        id={`feedback-meeting-component-meetinglist-div-card-content-date-text-${meeting.id}`}
                      >
                        <span
                          className="font-semibold text-black"
                          data-cy={`feedback-meeting-component-meetinglist-span-card-content-date-label-${meeting.id}`}
                          id={`feedback-meeting-component-meetinglist-span-card-content-date-label-${meeting.id}`}
                        >
                          Date
                        </span>
                        <span
                          className="font-bold"
                          data-cy={`feedback-meeting-component-meetinglist-span-card-content-date-value-${meeting.id}`}
                          id={`feedback-meeting-component-meetinglist-span-card-content-date-value-${meeting.id}`}
                        >
                          {dayjs(meeting.createdAt).format('YYYY-MM-DD HH:mm')}
                        </span>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-2"
                      data-cy={`feedback-meeting-component-meetinglist-div-card-content-chairperson-${meeting.id}`}
                      id={`feedback-meeting-component-meetinglist-div-card-content-chairperson-${meeting.id}`}
                    >
                      <UserOutlined
                        className="text-blue text-xl"
                        data-cy={`feedback-meeting-component-meetinglist-icon-chairperson-${meeting.id}`}
                        id={`feedback-component-meetinglist-icon-chairperson-${meeting.id}`}
                      />
                      <div
                        className="flex flex-col"
                        data-cy={`feedback-meeting-component-meetinglist-div-card-content-chairperson-text-${meeting.id}`}
                        id={`feedback-meeting-component-meetinglist-div-card-content-chairperson-text-${meeting.id}`}
                      >
                        <span
                          className="font-semibold text-black"
                          data-cy={`feedback-meeting-component-meetinglist-span-card-content-chairperson-label-${meeting.id}`}
                          id={`feedback-meeting-component-meetinglist-span-card-content-chairperson-label-${meeting.id}`}
                        >
                          Chair person
                        </span>
                        <span
                          data-cy={`feedback-meeting-component-meetinglist-span-card-content-chairperson-value-${meeting.id}`}
                          id={`feedback-meeting-component-meetinglist-span-card-content-chairperson-value-${meeting.id}`}
                        >
                          <EmployeeDetails
                            type="all"
                            empId={meeting.chairpersonId}
                            data-cy={`feedback-meeting-component-meetinglist-span-card-content-chairperson-value-${meeting.id}`}
                          />
                        </span>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-2"
                      data-cy={`feedback-meeting-component-meetinglist-div-card-content-facilitator-${meeting.id}`}
                      id={`feedback-meeting-component-meetinglist-div-card-content-facilitator-${meeting.id}`}
                    >
                      <UserOutlined
                        className="text-blue text-xl"
                        data-cy={`feedback-meeting-component-meetinglist-icon-facilitator-${meeting.id}`}
                        id={`feedback-meeting-component-meetinglist-icon-facilitator-${meeting.id}`}
                      />
                      <div
                        className="flex flex-col"
                        data-cy={`feedback-meeting-component-meetinglist-div-card-content-facilitator-text-${meeting.id}`}
                        id={`feedback-meeting-component-meetinglist-div-card-content-facilitator-text-${meeting.id}`}
                      >
                        <span
                          className="font-semibold text-black"
                          data-cy={`feedback-meeting-component-meetinglist-span-card-content-facilitator-label-${meeting.id}`}
                          id={`feedback-meeting-component-meetinglist-span-card-content-facilitator-label-${meeting.id}`}
                        >
                          Facilitator
                        </span>
                        <span
                          data-cy={`feedback-meeting-component-meetinglist-span-card-content-facilitator-value-${meeting.id}`}
                          id={`feedback-meeting-component-meetinglist-span-card-content-facilitator-value-${meeting.id}`}
                        >
                          <EmployeeDetails
                            type="all"
                            empId={meeting.facilitatorId}
                          />
                        </span>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-2"
                      data-cy={`feedback-meeting-component-meetinglist-div-card-content-location-${meeting.id}`}
                      id={`feedback-meeting-component-meetinglist-div-card-content-location-${meeting.id}`}
                    >
                      <EnvironmentOutlined
                        className="text-blue text-xl"
                        data-cy={`feedback-meeting-component-meetinglist-icon-location-${meeting.id}`}
                        id={`feedback-meeting-component-meetinglist-icon-location-${meeting.id}`}
                      />
                      <div
                        className="flex flex-col"
                        data-cy={`feedback-meeting-component-meetinglist-div-card-content-location-text-${meeting.id}`}
                        id={`feedback-meeting-component-meetinglist-div-card-content-location-text-${meeting.id}`}
                      >
                        <span
                          className="font-semibold text-black"
                          data-cy={`feedback-meeting-component-meetinglist-span-card-content-location-label-${meeting.id}`}
                          id={`feedback-meeting-component-meetinglist-span-card-content-location-label-${meeting.id}`}
                        >
                          Location
                        </span>
                        <span
                          data-cy={`feedback-meeting-component-meetinglist-span-card-content-location-value-${meeting.id}`}
                          id={`feedback-meeting-component-meetinglist-span-card-content-location-value-${meeting.id}`}
                        >
                          <span
                            data-cy={`feedback-meeting-component-meetinglist-span-card-content-location-type-${meeting.id}`}
                            id={`feedback-meeting-component-meetinglist-span-card-content-location-type-${meeting.id}`}
                          >
                            {meeting.locationType} •{' '}
                            <strong
                              data-cy={`feedback-meeting-component-meetinglist-strong-card-content-location-${meeting.id}`}
                              id={`feedback-meeting-component-meetinglist-strong-card-content-location-${meeting.id}`}
                            >
                              {meeting.locationType == 'virtual'
                                ? meeting.virtualLink
                                : meeting?.physicalLocation}
                            </strong>
                          </span>
                        </span>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-2"
                      data-cy={`feedback-meeting-component-meetinglist-div-card-content-attendees-${meeting.id}`}
                      id={`feedback-meeting-component-meetinglist-div-card-content-attendees-${meeting.id}`}
                    >
                      <FiUsers
                        className="text-blue text-xl"
                        data-cy={`feedback-meeting-component-meetinglist-icon-attendees-${meeting.id}`}
                        id={`feedback-meeting-component-meetinglist-icon-attendees-${meeting.id}`}
                      />
                      <div
                        className="flex flex-col"
                        data-cy={`feedback-meeting-component-meetinglist-div-card-content-attendees-text-${meeting.id}`}
                        id={`feedback-meeting-component-meetinglist-div-card-content-attendees-text-${meeting.id}`}
                      >
                        <div
                          className="font-semibold text-black"
                          data-cy={`feedback-meeting-component-meetinglist-div-card-content-attendees-label-${meeting.id}`}
                          id={`feedback-meeting-component-meetinglist-div-card-content-attendees-label-${meeting.id}`}
                        >
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
                            data-cy={`feedback-meeting-component-meetinglist-avatar-group-${meeting.id}`}
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
