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
    isShowViewSidebar,
    setIsShowViewSidebar,
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
      className: 'h-14',
      size: 'large',
      onClick: () => onClose(),
    },
  ];

  const onClose = () => {
    setViewAttendanceId(null);
    setIsShowViewSidebar(false);
  };

  const lateInfo = (record: AttendanceRecord | AttendanceBreak) => {
    return (
      <InfoItem
        value={record.startAt ? dayjs(record.startAt).format(TIME_FORMAT) : '-'}
        info={record.geolocations[0]?.allowedArea?.title ?? ''}
      >
        {record.lateByMinutes > 0 && (
          <div className="text-error text-[10px]">
            <span className="font-bold">late by </span> &nbsp;
            {minuteToHour(record.lateByMinutes)} hr &nbsp;
            {minuteToLastMinute(record.lateByMinutes)} min
          </div>
        )}
      </InfoItem>
    );
  };

  const earlyInfo = (record: AttendanceRecord | AttendanceBreak) => {
    return (
      <InfoItem
        value={record.endAt ? dayjs(record.endAt).format(TIME_FORMAT) : '-'}
        info={
          record.geolocations[record?.geolocations.length - 1]?.allowedArea
            ?.title ?? ''
        }
      >
        {record.earlyByMinutes > 0 && (
          <div className="text-error text-[10px]">
            <span className="font-bold">early by </span> &nbsp;
            {minuteToHour(record.earlyByMinutes)} hr &nbsp;
            {minuteToLastMinute(record.earlyByMinutes)} min
          </div>
        )}
      </InfoItem>
    );
  };

  const userData = getUserName(attendance?.userId ?? '');
  return (
    isShowViewSidebar && (
      <CustomDrawerLayout
        open={isShowViewSidebar}
        onClose={() => onClose()}
        modalHeader={
          <CustomDrawerHeader className="flex justify-center">
            View Attendance
          </CustomDrawerHeader>
        }
        footer={
          <CustomDrawerFooterButton
            className="w-1/2 mx-auto"
            buttons={footerModalItems}
          />
        }
        width="40%"
      >
        {!(data && attendance) || isFetching ? (
          <div className="flex items-center justify-center py-10">
            <Spin />
          </div>
        ) : (
          <>
            <Row gutter={[24, 24]}>
              {attendance?.createdBy && (
                <Col span={24}>
                  <div className="text-sm text-gray-900 font-medium mb-2.5">
                    Employee
                    <span className="text-error">*</span>
                  </div>
                  <div className="pl-20">
                    <UserCard
                      data={userData}
                      name={userData?.firstName + ' ' + userData?.middleName}
                      description={userData?.email}
                      avatar={userData?.profileImage}
                      profileImage={userData?.profileImage}
                      size="small"
                    />
                  </div>
                </Col>
              )}
              <Col span={24}>
                <div className="text-sm text-gray-900 font-medium mb-2.5">
                  Date
                </div>
                <InfoItem
                  value={dayjs(attendance.createdAt).format(DATE_FORMAT)}
                />
              </Col>
              <Col span={12}>
                <div className="text-sm text-gray-900 font-medium mb-2.5">
                  Clock-In
                </div>
                {lateInfo(attendance)}
              </Col>
              <Col span={12}>
                <div className="text-sm text-gray-900 font-medium mb-2.5">
                  Clock-Out
                </div>
                {earlyInfo(attendance)}
              </Col>

              {attendance.attendanceBreaks.map((item) => (
                <React.Fragment key={item.id}>
                  <Col span={12}>
                    <div className="text-sm text-gray-900 font-medium mb-2.5">
                      {item.breakType.title} CheckIn
                    </div>
                    {lateInfo(item)}
                  </Col>
                  <Col span={12}>
                    <div className="text-sm text-gray-900 font-medium mb-2.5">
                      {item.breakType.title} Checkout
                    </div>
                    {earlyInfo(item)}
                  </Col>
                </React.Fragment>
              ))}
            </Row>
            <div className="mt-12 mb-6">
              <div className="text-sm text-gray-900 font-medium mb-2.5">
                Status
              </div>
              <Space>
                {formatToAttendanceStatuses(attendance).map((status) => (
                  <StatusBadge
                    className="w-[155px]"
                    theme={AttendanceRecordTypeBadgeTheme[status.status]}
                    key={status.status}
                  >
                    <div className="text-center">
                      <div>{status.status}</div>
                      {status.text && (
                        <div className="font-normal">{status.text}</div>
                      )}
                    </div>
                  </StatusBadge>
                ))}
              </Space>
            </div>

            <Row className="mb-6" gutter={24}>
              <Col span={12}>
                <div className="text-sm text-gray-900 font-medium mb-2.5">
                  Over time
                </div>
                <div className="text-gray-900 text-sm font-semibold">
                  {minuteToHour(attendance.overTimeMinutes)} hr &nbsp;
                  {minuteToLastMinute(attendance.overTimeMinutes)} min
                </div>
              </Col>
              <Col span={12}>
                <div className="text-sm text-gray-900 font-medium mb-2.5">
                  Total time
                </div>
                <div className="text-gray-900 text-sm font-semibold">
                  {timeToHour(totalTime)} hr {timeToLastMinute(totalTime)} min
                </div>
              </Col>
            </Row>
            {attendance.import && (
              <div>
                <div className="text-center text-base font-semibold text-gray-900 mb-6">
                  Additional information
                </div>

                <div className="mb-6">
                  <div className="text-sm text-gray-900 font-medium mb-2.5">
                    Imported by <span className="text-error">*</span>
                  </div>

                  <UserCard
                    data={userData}
                    name={userData?.firstName + ' ' + userData?.middleName}
                    description={userData?.email}
                  />
                </div>

                <div>
                  <div className="text-sm text-gray-900 font-medium mb-2.5">
                    Imported date <span className="text-error">*</span>
                  </div>

                  <InfoItem size="large" value="23 Mar 2023" />
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
