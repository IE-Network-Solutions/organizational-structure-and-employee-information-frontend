import { useLeaveManagementStore } from '@/store/uistate/features/timesheet/leaveManagement';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { Avatar, Button, Col, Divider, Input, Row, Upload } from 'antd';
import React from 'react';
import { UserOutlined } from '@ant-design/icons';
import { classNames } from '@/utils/classNames';
import { TbFileDownload } from 'react-icons/tb';
import CommentCard from './commentCard';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import ApprovalStatusesInfo from '@/components/common/approvalStatuses/approvalStatusesInfo';
import ApprovalStatusCard, {
  ApprovalStatusCardProps,
} from '@/components/common/approvalStatuses/approvalStatusCard';
import UserCard from '@/components/common/userCard/userCard';
import CommentInput from '@/app/(afterLogin)/(timesheetInformation)/timesheet/leave-management/_components/leaveRequestManagementSidebar/commentInput';

const LeaveRequestManagementSidebar = () => {
  const {
    isShowLeaveRequestManagementSidebar: isShow,
    setIsShowLeaveRequestManagementSidebar: setIsShow,
  } = useLeaveManagementStore();

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Reject',
      key: 'reject',
      className: 'h-[56px] text-base bg-error',
      size: 'large',
      type: 'primary',
      onClick: () => setIsShow(false),
    },
    {
      label: 'Approve',
      key: 'approve',
      className: 'h-[56px] text-base bg-success',
      size: 'large',
      type: 'primary',
      onClick: () => setIsShow(false),
    },
  ];

  const labelClass = 'text-sm text-gray-900 font-medium mb-2.5';

  const approvalCards: ApprovalStatusCardProps[] = [
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
        modalHeader={
          <CustomDrawerHeader>Leave Requests Management</CustomDrawerHeader>
        }
        footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
        width="40%"
      >
        <div className="flex items-center gap-[15px] mb-8">
          <div className="text-xs text-gray-900">Requester:</div>
          <UserCard name="Name" size="small" />
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
            <Upload>
              <button className="w-full h-[54px] border border-gray-200 rounded-[10px] flex items-center justify-between px-5 mt-2.5">
                <div className="text-sm font-medium text-gray-900">
                  Select File
                </div>

                <TbFileDownload size={20} />
              </button>
            </Upload>
          </Col>
          <Col span={24}>
            <div className={labelClass}>
              Note <span className="text-error">*</span>
            </div>
            <Input.TextArea
              className="w-full py-4 px-5 mt-2.5"
              placeholder="Input note"
              rows={6}
            />
          </Col>
        </Row>
        <Divider className="my-8 h-[5px] bg-gray-200" />
        <div>
          <div className="text-lg font-semibold text-gray-900">
            Approval Levels Status
          </div>

          <div className="my-2.5">
            <ApprovalStatusesInfo />
          </div>

          {approvalCards.map((approvalCard, idx) => (
            <ApprovalStatusCard key={idx} {...approvalCard} />
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

          <CommentInput />
        </div>
      </CustomDrawerLayout>
    )
  );
};

export default LeaveRequestManagementSidebar;
