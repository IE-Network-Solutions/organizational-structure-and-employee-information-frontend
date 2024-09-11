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

  const lateInfo = (date: string | null, late: number) => {
    return (
      <InfoItem
        value={date ? dayjs(date).format(TIME_FORMAT) : '-'}
        info="AAIT"
      >
        {late > 0 && (
          <div className="text-error text-[10px]">
            <span className="font-bold">late by </span> &nbsp;
            {minuteToHour(late)} hr &nbsp;
            {minuteToLastMinute(late)} min
          </div>
        )}
      </InfoItem>
    );
  };

  const earlyInfo = (date: string | null, early: number) => {
    return (
      <InfoItem
        value={date ? dayjs(date).format(TIME_FORMAT) : '-'}
        info="AAIT"
      >
        {early > 0 && (
          <div className="text-error text-[10px]">
            <span className="font-bold">early by </span> &nbsp;
            {minuteToHour(early)} hr &nbsp;
            {minuteToLastMinute(early)} min
          </div>
        )}
      </InfoItem>
    );
  };

  return (
    isShowViewSidebar && (
      <CustomDrawerLayout
        open={isShowViewSidebar}
        onClose={() => onClose()}
        modalHeader={
          <CustomDrawerHeader className="flex justify-center">
            {' '}
            View Attendance
          </CustomDrawerHeader>
        }
        footer={
          <CustomDrawerFooterButton
            className="w-1/2 mx-auto"
            buttons={footerModalItems}
          />
        }
        width="50%"
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
                      name="Prita Candra"
                      description="lincoln@ienetwork.com"
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
                {lateInfo(attendance.startAt, attendance.lateByMinutes)}
              </Col>
              <Col span={12}>
                <div className="text-sm text-gray-900 font-medium mb-2.5">
                  Clock-Out
                </div>
                {earlyInfo(attendance.endAt, attendance.earlyByMinutes)}
              </Col>

              {attendance.attendanceBreaks.map((item) => (
                <React.Fragment key={item.id}>
                  <Col span={12}>
                    <div className="text-sm text-gray-900 font-medium mb-2.5">
                      {item.breakType.title} Checkin
                    </div>
                    {lateInfo(item.startAt, item.lateByMinutes)}
                  </Col>
                  <Col span={12}>
                    <div className="text-sm text-gray-900 font-medium mb-2.5">
                      {item.breakType.title} Checkout
                    </div>
                    {earlyInfo(item.endAt, item.earlyByMinutes)}
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

                  <UserCard name="Prita Candra" description="designer" />
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
