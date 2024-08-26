import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import CustomDrawerLayout from '@/components/common/customDrawer';
import React from 'react';
import UserCard from '@/components/common/userCard/userCard';
import { Button, Col, Row } from 'antd';
import InfoItem from '@/app/(afterLogin)/(timesheetInformation)/timesheet/my-timesheet/_components/viewAttendanceSidebar/infoItem';
import StatusBadge from '@/components/common/statusBadge/statusBadge';

const ViewAttendanceSidebar = () => {
  const { isShowViewSidebar, setIsShowViewSidebar } = useMyTimesheetStore();

  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      View Attendance
    </div>
  );

  const modalFooter = (
    <div className="flex justify-center">
      <Button
        className="w-1/2 h-14 text-base"
        size="large"
        onClick={() => setIsShowViewSidebar(false)}
      >
        Cancel
      </Button>
    </div>
  );

  return (
    isShowViewSidebar && (
      <CustomDrawerLayout
        open={isShowViewSidebar}
        onClose={() => setIsShowViewSidebar(false)}
        modalHeader={modalHeader}
        modalFooter={modalFooter}
        width="50%"
      >
        <div className="mb-6">
          <div className="text-sm text-gray-900 font-medium mb-2.5">
            Employee
            <span className="text-error">*</span>
          </div>
          <div className="pl-20">
            <UserCard name="Prita Candra" description="lincoln@ienetwork.com" />
          </div>
        </div>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <div className="text-sm text-gray-900 font-medium mb-2.5">Date</div>
            <InfoItem value="01 Mar 2023" />
          </Col>
          <Col span={12}>
            <div className="text-sm text-gray-900 font-medium mb-2.5">
              Clock-In
            </div>
            <InfoItem value="08:00 AM" info="AAIT">
              <div className="text-error text-[10px]">
                <span className="font-bold">late by</span> 00 hr 1 min
              </div>
            </InfoItem>
          </Col>
          <Col span={12}>
            <div className="text-sm text-gray-900 font-medium mb-2.5">
              Clock-Out
            </div>
            <InfoItem value="08:00 AM" info="AAIT">
              <div className="text-error text-[10px]">
                <span className="font-bold">early by</span> 00 hr 1 min
              </div>
            </InfoItem>
          </Col>
          <Col span={12}>
            <div className="text-sm text-gray-900 font-medium mb-2.5">
              Lunch-in
            </div>
            <InfoItem value="08:00 AM" info="AAIT" />
          </Col>
          <Col span={12}>
            <div className="text-sm text-gray-900 font-medium mb-2.5">
              Lunch-Out
            </div>
            <InfoItem value="08:00 AM" info="AAIT" />
          </Col>
          <Col span={12}>
            <div className="text-sm text-gray-900 font-medium mb-2.5">
              Break Checkin
            </div>
            <InfoItem value="08:00 AM" info="AAIT">
              <div className="text-error text-[10px]">
                <span className="font-bold">late by</span> 00 hr 1 min
              </div>
            </InfoItem>
          </Col>
          <Col span={12}>
            <div className="text-sm text-gray-900 font-medium mb-2.5">
              Break Checkout
            </div>
            <InfoItem value="08:00 AM" info="AAIT" />
          </Col>
        </Row>

        <div className="mt-12 mb-6">
          <div className="text-sm text-gray-900 font-medium mb-2.5">Status</div>
          <StatusBadge className="w-[155px] h-[25px]" theme="success">
            Present
          </StatusBadge>
        </div>

        <Row className="mb-6" gutter={24}>
          <Col span={12}>
            <div className="text-sm text-gray-900 font-medium mb-2.5">
              Over time
            </div>
            <div className="text-gray-900 text-sm font-semibold">
              1 hr 01 min
            </div>
          </Col>
          <Col span={12}>
            <div className="text-sm text-gray-900 font-medium mb-2.5">
              Total time
            </div>
            <div className="text-gray-900 text-sm font-semibold">
              6 hr 01 min
            </div>
          </Col>
        </Row>

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
      </CustomDrawerLayout>
    )
  );
};

export default ViewAttendanceSidebar;
