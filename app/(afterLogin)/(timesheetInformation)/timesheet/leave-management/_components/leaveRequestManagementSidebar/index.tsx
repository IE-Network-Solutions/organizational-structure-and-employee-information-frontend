import { useLeaveManagementStore } from '@/store/uistate/features/timesheet/leaveManagement';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { Avatar, Button, Col, Divider, Row } from 'antd';
import React from 'react';
import { UserOutlined } from '@ant-design/icons';
import { classNames } from '@/utils/classNames';
import { TbFileDownload } from 'react-icons/tb';
import Image from 'next/image';
import ApprovalCard, {
  ApprovalCardProps,
} from '@/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/_components/leaveRequestManagementSidebar/approvalCard';
import CommentCard from '@/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/_components/leaveRequestManagementSidebar/commentCard';

const LeaveRequestManagementSidebar = () => {
  const {
    isShowLeaveRequestManagementSidebar: isShow,
    setIsShowLeaveRequestManagementSidebar: setIsShow,
  } = useLeaveManagementStore();

  const modalHeader = (
    <div className="text-xl font-extrabold text-gray-800">
      Leave Requests Management
    </div>
  );
  const modalFooter = (
    <Row gutter={20}>
      <Col span={12}>
        <Button
          className="w-full h-[56px] text-base bg-error"
          size="large"
          type="primary"
          onClick={() => setIsShow(false)}
        >
          Reject
        </Button>
      </Col>
      <Col span={12}>
        <Button
          className="w-full h-[56px] text-base bg-success"
          size="large"
          type="primary"
          onClick={() => setIsShow(false)}
        >
          Approve
        </Button>
      </Col>
    </Row>
  );

  const labelClass = 'text-sm text-gray-900 font-medium mb-2.5';

  const statuses = [
    {
      text: 'Approved',
      img: '/icons/status/verify.svg',
    },
    {
      text: 'Pending',
      img: '/icons/status/information.svg',
    },
    {
      text: 'Reject',
      img: '/icons/status/reject.svg',
    },
  ];

  const approvalCards: ApprovalCardProps[] = [
    {
      employee: {
        name: 'Abeselom G/Gidan',
        description: 'Saas Teamlead',
      },
      status: '/icons/status/verify.svg',
    },
    {
      employee: {
        name: 'Dawit Amanauel',
        description: 'Operation Teamlead',
      },
      status: '/icons/status/reject.svg',
      reason:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
    },
  ];

  return (
    isShow && (
      <CustomDrawerLayout
        open={isShow}
        onClose={() => setIsShow(false)}
        modalHeader={modalHeader}
        footer={modalFooter}
        width="40%"
      >
        <div className="flex items-center gap-[15px] mb-8">
          <div className="text-xs text-gray-900">Requester:</div>
          <div className="flex items-center gap-2.5">
            <Avatar size={24} icon={<UserOutlined />} />
            <div className="text-[10px] text-gray-900 font-semibold">
              Abeselom G/kidan
            </div>
          </div>
        </div>
        <Row gutter={[32, 32]}>
          <Col span={12}>
            <div className={labelClass}>Leave Type</div>
            <div
              className={classNames(labelClass, undefined, [
                'font-semibold',
                'mb-0',
              ])}
            >
              Sick Leave
            </div>
          </Col>
          <Col span={12}>
            <div className={labelClass}>Date</div>
            <div
              className={classNames(labelClass, undefined, [
                'font-semibold',
                'mb-0',
              ])}
            >
              Sick Leave
            </div>
          </Col>
          <Col span={24}>
            <div className={labelClass}>
              Attachment <span className="text-error">*</span>
            </div>
            <button className="w-full h-[54px] border border-gray-200 rounded-[10px] flex items-center justify-between px-5">
              <div className="text-sm font-medium text-gray-900">
                Sick_Leave.pdf
              </div>

              <TbFileDownload size={20} />
            </button>
          </Col>
          <Col span={24}>
            <div className={labelClass}>
              Note <span className="text-error">*</span>
            </div>
            <div className="h-36 border border-gray-200 rounded-[10px] px-5 py-4 text-xs text-gray-900">
              I am feeling not normal which I am feeling not normal which I am
              feeling not normal which I am feeling not normal which I am
              feeling not normal which
            </div>
          </Col>
        </Row>
        <Divider className="my-8 h-[5px] bg-gray-200" />
        <div>
          <div className="text-lg font-semibold text-gray-900">
            Approval Levels Status
          </div>

          <div className="flex items-center gap-2.5 py-[5px] px-3 rounded-lg border border-gray-100 w-max mx-auto my-2.5">
            {statuses.map((status) => (
              <div key={status.text} className="flex items-center gap-[5px]">
                <Image width={24} height={24} src={status.img} alt="" />
                <span className="text-xs font-medium text-gray-900">
                  {status.text}
                </span>
              </div>
            ))}
          </div>

          {approvalCards.map((approvalCard, idx) => (
            <ApprovalCard key={idx} {...approvalCard} />
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mt-[54px] mb-4">
            <div className="text-sm font-semibold text-gray-900">Comments</div>
            <Button type="primary" size="large">
              Comment
            </Button>
          </div>

          <div className="pl-10">
            <CommentCard />
          </div>
        </div>
      </CustomDrawerLayout>
    )
  );
};

export default LeaveRequestManagementSidebar;
