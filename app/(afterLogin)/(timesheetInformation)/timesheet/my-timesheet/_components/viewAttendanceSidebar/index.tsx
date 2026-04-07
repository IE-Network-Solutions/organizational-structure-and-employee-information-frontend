import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import CustomDrawerLayout from '@/components/common/customDrawer';
import React, { useEffect, useState } from 'react';
import UserCard from '@/components/common/userCard/userCard';
import { Col, Row, Space, Spin } from 'antd';
import InfoItem from './infoItem';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { AttendanceRequestBody } from '@/store/server/features/timesheet/attendance/interface';
import { useGetAttendances } from '@/store/server/features/timesheet/attendance/queries';
import {
  AttendanceBreak,
  AttendanceRecord,
  AttendanceRecordTypeBadgeTheme,
} from '@/types/timesheet/attendance';
import dayjs from 'dayjs';
import { DATE_FORMAT, TIME_FORMAT } from '@/utils/constants';
import {
  calculateAttendanceRecordToTotalWorkTime,
  minuteToHour,
  minuteToLastMinute,
  timeToHour,
  timeToLastMinute,
} from '@/helpers/calculateHelper';
import { formatToAttendanceStatuses } from '@/helpers/formatTo';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';

const ViewAttendanceSidebar = () => {
  const {
    isShowViewSidebarAttendance,
    setIsShowViewSidebarAttendance,
    viewAttendanceId,
    setViewAttendanceId,
  } = useMyTimesheetStore();

  const [filter, setFilter] = useState<
    Partial<AttendanceRequestBody['filter']>
  >({});
  const [attendance, setAttendance] = useState<AttendanceRecord>();
  const [totalTime, setTotalTime] = useState(0);

  const { data: allUsers } = useGetAllUsers();

  const getUserName = (id: string) => {
    return allUsers?.items?.find((user: any) => user?.id === id) ?? {};
  };

  const { data, isFetching, refetch } = useGetAttendances(
    { page: '1', limit: '1' },
    { filter },
    false,
    false,
  );

  useEffect(() => {
    if (viewAttendanceId) {
      setFilter({ attendanceRecordIds: [viewAttendanceId] });
    }
  }, [viewAttendanceId]);

  useEffect(() => {
    if (filter) {
      refetch();
    }
  }, [filter]);

  useEffect(() => {
    if (data?.items?.length) {
      setAttendance(data.items[0]);
      const time = calculateAttendanceRecordToTotalWorkTime(data.items[0]);
      setTotalTime(time);
    }
  }, [data]);

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-[40px] sm:h-[56px] text-base',
      size: 'large',
      onClick: () => onClose(),
      id: 'time-attendance-view-attendance-sidebar-cancel-button',
      'data-cy': 'time-attendance-view-attendance-sidebar-cancel-button',
    },
  ];

  const onClose = () => {
    setViewAttendanceId(null);
    setIsShowViewSidebarAttendance(false);
  };

  const lateInfo = (record: AttendanceRecord | AttendanceBreak) => {
    return (
      <InfoItem
        value={
          record?.startAt ? dayjs(record?.startAt).format(TIME_FORMAT) : '-'
        }
        info={record?.geolocations[0]?.allowedArea?.title ?? ''}
        data-cy="time-attendance-view-attendance-sidebar-late-info"
      >
        {record.lateByMinutes > 0 && (
          <div
            className="text-error text-[10px]"
            id="time-attendance-view-attendance-sidebar-late-by"
            data-cy="time-attendance-view-attendance-sidebar-late-by"
          >
            <span
              id="time-attendance-view-attendance-sidebar-late-by-label"
              data-cy="time-attendance-view-attendance-sidebar-late-by-label"
              className="font-bold"
            >
              late by{' '}
            </span>{' '}
            &nbsp;
            {minuteToHour(record?.lateByMinutes)} hr &nbsp;
            {minuteToLastMinute(record?.lateByMinutes)} min
          </div>
        )}
      </InfoItem>
    );
  };

  const earlyInfo = (record: AttendanceRecord | AttendanceBreak) => {
    return (
      <InfoItem
        value={record?.endAt ? dayjs(record?.endAt).format(TIME_FORMAT) : '-'}
        info={
          record?.geolocations[record?.geolocations?.length - 1]?.allowedArea
            ?.title ?? ''
        }
        data-cy="time-attendance-view-attendance-sidebar-early-info"
      >
        {record.earlyByMinutes > 0 && (
          <div
            className="text-error text-[10px]"
            id="time-attendance-view-attendance-sidebar-early-by"
            data-cy="time-attendance-view-attendance-sidebar-early-by"
          >
            <span
              id="time-attendance-view-attendance-sidebar-early-by-label"
              data-cy="time-attendance-view-attendance-sidebar-early-by-label"
              className="font-bold"
            >
              early by{' '}
            </span>{' '}
            &nbsp;
            {minuteToHour(record?.earlyByMinutes)} hr &nbsp;
            {minuteToLastMinute(record?.earlyByMinutes)} min
          </div>
        )}
      </InfoItem>
    );
  };

  const userData = getUserName(attendance?.userId ?? '');
  return (
    isShowViewSidebarAttendance && (
      <CustomDrawerLayout
        open={isShowViewSidebarAttendance}
        onClose={() => onClose()}
        modalHeader={
          <CustomDrawerHeader
            className="flex justify-center"
            data-cy="time-attendance-view-attendance-sidebar-header"
          >
            View Attendance
          </CustomDrawerHeader>
        }
        footer={
          <div
            className="p-6 sm:p-0"
            id="time-attendance-view-attendance-sidebar-footer"
            data-cy="time-attendance-view-attendance-sidebar-footer"
          >
            <CustomDrawerFooterButton
              data-cy="time-attendance-view-attendance-sidebar-footer-button"
              className="w-1/2 mx-auto"
              buttons={footerModalItems}
            />
          </div>
        }
        width="40%"
        data-cy="time-attendance-view-attendance-sidebar"
      >
        {!(data && attendance) || isFetching ? (
          <div
            className="flex items-center justify-center py-20 "
            id="time-attendance-view-attendance-sidebar-loading"
            data-cy="time-attendance-view-attendance-sidebar-loading"
          >
            <Spin data-cy="time-attendance-view-attendance-sidebar-loading-spin" />
          </div>
        ) : (
          <>
            <Row
              gutter={[24, 24]}
              id="time-attendance-view-attendance-sidebar-info-row"
              data-cy="time-attendance-view-attendance-sidebar-info-row"
            >
              {attendance?.createdBy && (
                <Col
                  data-cy="time-attendance-view-attendance-sidebar-employee-column"
                  span={24}
                >
                  <div
                    className="text-sm text-gray-900 font-medium mb-2.5"
                    id="time-attendance-view-attendance-sidebar-employee-label"
                    data-cy="time-attendance-view-attendance-sidebar-employee-label"
                  >
                    Employee
                    <span
                      id="time-attendance-view-attendance-sidebar-employee-label-asterisk"
                      data-cy="time-attendance-view-attendance-sidebar-employee-label-asterisk"
                      className="text-error"
                    >
                      *
                    </span>
                  </div>
                  <div
                    className="pl-20"
                    id="time-attendance-view-attendance-sidebar-employee-card-container"
                    data-cy="time-attendance-view-attendance-sidebar-employee-card-container"
                  >
                    <UserCard
                      data={userData}
                      name={
                        userData?.firstName +
                        ' ' +
                        userData?.middleName +
                        ' ' +
                        userData?.middleName
                      }
                      description={userData?.email}
                      avatar={userData?.profileImage}
                      profileImage={userData?.profileImage}
                      size="small"
                      data-cy="time-attendance-view-attendance-sidebar-employee-card"
                    />
                  </div>
                </Col>
              )}
              <Col
                data-cy="time-attendance-view-attendance-sidebar-date-column"
                span={24}
              >
                <div
                  className="text-sm text-gray-900 font-medium mb-2.5"
                  id="time-attendance-view-attendance-sidebar-date-label"
                  data-cy="time-attendance-view-attendance-sidebar-date-label"
                >
                  Date
                </div>
                <InfoItem
                  value={dayjs(attendance?.createdAt).format(DATE_FORMAT)}
                  data-cy="time-attendance-view-attendance-sidebar-date-item"
                />
              </Col>
              <Col
                data-cy="time-attendance-view-attendance-sidebar-clock-in-column"
                span={12}
              >
                <div
                  className="text-xs text-gray-900 font-medium mb-2.5"
                  id="time-attendance-view-attendance-sidebar-clock-in-label"
                  data-cy="time-attendance-view-attendance-sidebar-clock-in-label"
                >
                  Clock-In
                </div>
                {lateInfo(attendance)}
              </Col>
              <Col
                data-cy="time-attendance-view-attendance-sidebar-clock-out-column"
                span={12}
              >
                <div
                  className="text-xs text-gray-900 font-medium mb-2.5"
                  id="time-attendance-view-attendance-sidebar-clock-out-label"
                  data-cy="time-attendance-view-attendance-sidebar-clock-out-label"
                >
                  Clock-Out
                </div>
                {earlyInfo(attendance)}
              </Col>

              {attendance.attendanceBreaks.map((item, breakIndex) => (
                <React.Fragment key={item.id}>
                  <Col
                    data-cy="time-attendance-view-attendance-sidebar-break-check-in-column"
                    span={12}
                  >
                    <div
                      className="text-sm text-gray-900 font-medium mb-2.5"
                      id={`time-attendance-view-attendance-sidebar-break-${breakIndex}-check-in-label`}
                      data-cy={`time-attendance-view-attendance-sidebar-break-${breakIndex}-check-in-label`}
                    >
                      {item?.breakType?.title} CheckIn
                    </div>
                    {lateInfo(item)}
                  </Col>
                  <Col
                    data-cy="time-attendance-view-attendance-sidebar-break-check-out-column"
                    span={12}
                  >
                    <div
                      className="text-sm text-gray-900 font-medium mb-2.5"
                      id={`time-attendance-view-attendance-sidebar-break-${breakIndex}-check-out-label`}
                      data-cy={`time-attendance-view-attendance-sidebar-break-${breakIndex}-check-out-label`}
                    >
                      {item?.breakType?.title} Checkout
                    </div>
                    {earlyInfo(item)}
                  </Col>
                </React.Fragment>
              ))}
            </Row>
            <div
              className="mt-6 mb-3"
              id="time-attendance-view-attendance-sidebar-status-container"
              data-cy="time-attendance-view-attendance-sidebar-status-container"
            >
              <div
                className="text-sm text-gray-900 font-medium mb-2.5"
                id="time-attendance-view-attendance-sidebar-status-label"
                data-cy="time-attendance-view-attendance-sidebar-status-label"
              >
                Status
              </div>
              <Space data-cy="time-attendance-view-attendance-sidebar-status-badges">
                {formatToAttendanceStatuses(attendance).map(
                  (status, statusIndex) => (
                    <StatusBadge
                      className="w-[154px] px-4 py-1 border-spacing-2"
                      theme={AttendanceRecordTypeBadgeTheme[status?.status]}
                      key={status.status}
                      data-cy={`time-attendance-view-attendance-sidebar-status-badge-${statusIndex}`}
                    >
                      <div
                        id={`time-attendance-view-attendance-sidebar-status-badge-${statusIndex}-div`}
                        data-cy={`time-attendance-view-attendance-sidebar-status-badge-${statusIndex}-div`}
                        className="text-center"
                      >
                        <div
                          id={`time-attendance-view-attendance-sidebar-status-badge-${statusIndex}-status-div`}
                          data-cy={`time-attendance-view-attendance-sidebar-status-badge-${statusIndex}-status-div`}
                        >
                          {status?.status}
                        </div>
                        {status?.text && (
                          <div
                            id={`time-attendance-view-attendance-sidebar-status-badge-${statusIndex}-text-div`}
                            data-cy={`time-attendance-view-attendance-sidebar-status-badge-${statusIndex}-text-div`}
                            className="font-normal"
                          >
                            {status?.text}
                          </div>
                        )}
                      </div>
                    </StatusBadge>
                  ),
                )}
              </Space>
            </div>

            <Row
              className="mb-6"
              gutter={24}
              id="time-attendance-view-attendance-sidebar-time-row"
              data-cy="time-attendance-view-attendance-sidebar-time-row"
            >
              <Col
                data-cy="time-attendance-view-attendance-sidebar-overtime-column"
                span={12}
              >
                <div
                  className="text-sm text-gray-900 font-medium mb-2.5"
                  id="time-attendance-view-attendance-sidebar-overtime-label"
                  data-cy="time-attendance-view-attendance-sidebar-overtime-label"
                >
                  Over time
                </div>
                <div
                  className="text-gray-900 text-sm font-semibold"
                  id="time-attendance-view-attendance-sidebar-overtime-value"
                  data-cy="time-attendance-view-attendance-sidebar-overtime-value"
                >
                  {minuteToHour(attendance?.overTimeMinutes)} hr &nbsp;
                  {minuteToLastMinute(attendance?.overTimeMinutes)} min
                </div>
              </Col>
              <Col
                data-cy="time-attendance-view-attendance-sidebar-total-time-column"
                span={12}
              >
                <div
                  className="text-sm text-gray-900 font-medium mb-2.5"
                  id="time-attendance-view-attendance-sidebar-total-time-label"
                  data-cy="time-attendance-view-attendance-sidebar-total-time-label"
                >
                  Total time
                </div>
                <div
                  className="text-gray-900 text-sm font-semibold"
                  id="time-attendance-view-attendance-sidebar-total-time-value"
                  data-cy="time-attendance-view-attendance-sidebar-total-time-value"
                >
                  {timeToHour(totalTime)} hr {timeToLastMinute(totalTime)} min
                </div>
              </Col>
            </Row>
            {attendance.import && (
              <div
                id="time-attendance-view-attendance-sidebar-additional-information-container"
                data-cy="time-attendance-view-attendance-sidebar-additional-information-container"
              >
                <div
                  id="time-attendance-view-attendance-sidebar-additional-information-label"
                  data-cy="time-attendance-view-attendance-sidebar-additional-information-label"
                  className="text-center text-base font-semibold text-gray-900 mb-6"
                >
                  Additional information
                </div>

                <div
                  id="time-attendance-view-attendance-sidebar-additional-information-imported-by-container"
                  data-cy="time-attendance-view-attendance-sidebar-additional-information-imported-by-container"
                  className="mb-6"
                >
                  <div
                    id="time-attendance-view-attendance-sidebar-additional-information-imported-by-label"
                    data-cy="time-attendance-view-attendance-sidebar-additional-information-imported-by-label"
                    className="text-sm text-gray-900 font-medium mb-2.5"
                  >
                    Imported by{' '}
                    <span
                      id="time-attendance-view-attendance-sidebar-additional-information-imported-by-label-asterisk"
                      data-cy="time-attendance-view-attendance-sidebar-additional-information-imported-by-label-asterisk"
                      className="text-error"
                    >
                      *
                    </span>
                  </div>

                  <UserCard
                    data-cy="time-attendance-view-attendance-sidebar-additional-information-imported-by-card"
                    data={userData}
                    name={
                      userData?.firstName +
                      ' ' +
                      userData?.middleName +
                      ' ' +
                      userData?.middleName
                    }
                    description={userData?.email}
                  />
                </div>

                <div data-cy="my-timesheet-components-viewattendancesidebar-index-tsx-index-div-460">
                  <div
                    id="time-attendance-view-attendance-sidebar-additional-information-imported-date-label"
                    data-cy="time-attendance-view-attendance-sidebar-additional-information-imported-date-label"
                    className="text-sm text-gray-900 font-medium mb-2.5"
                  >
                    Imported date{' '}
                    <span
                      id="time-attendance-view-attendance-sidebar-additional-information-imported-date-label-asterisk"
                      data-cy="time-attendance-view-attendance-sidebar-additional-information-imported-date-label-asterisk"
                      className="text-error"
                    >
                      *
                    </span>
                  </div>

                  <InfoItem
                    data-cy="time-attendance-view-attendance-sidebar-additional-information-imported-date-item"
                    size="large"
                    value="23 Mar 2023"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </CustomDrawerLayout>
    )
  );
};

export default ViewAttendanceSidebar;
