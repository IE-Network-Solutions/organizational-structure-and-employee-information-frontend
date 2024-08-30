import CustomDrawerLayout from '@/components/common/customDrawer';
import { Avatar, Divider, Form, Input, Select, Space, Upload } from 'antd';
import React from 'react';
import { UserOutlined } from '@ant-design/icons';
import { TbFileDownload } from 'react-icons/tb';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import ApprovalStatusesInfo from '@/components/common/approvalStatuses/approvalStatusesInfo';
import ApprovalStatusCard, {
  ApprovalStatusCardProps,
} from '@/components/common/approvalStatuses/approvalStatusCard';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import CustomLabel from '@/components/form/customLabel/customLabel';
import UserCard from '@/components/common/userCard/userCard';

const LeaveRequestManagementSidebar = () => {
  const {
    isShowLeaveRequestSidebar: isShow,
    setIsShowLeaveRequestSidebar: setIsShow,
  } = useTimesheetSettingsStore();

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Reject',
      key: 'reject',
      className: 'h-[56px] text-base',
      danger: true,
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

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[54px] w-full';

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
        modalHeader={<CustomDrawerHeader>Leave Requests</CustomDrawerHeader>}
        footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
        width="400px"
      >
        <div className="flex items-center gap-[15px] mb-8">
          <div className="text-xs text-gray-900">Requester:</div>
          <UserCard name="Name" size="small" />
        </div>

        <Form
          layout="vertical"
          requiredMark={CustomLabel}
          autoComplete="off"
          className={itemClass}
        >
          <Space direction="vertical" className="w-full" size={24}>
            <Form.Item label="Leave Type" required name="type">
              <Select
                className={controlClass}
                options={[
                  { value: 'day', label: 'Day' },
                  { value: 'month', label: 'Month' },
                ]}
              />
            </Form.Item>
            <Form.Item label="Attachment" required name="attachment">
              <Upload>
                <button className="w-full h-[54px] border border-gray-200 rounded-[10px] flex items-center justify-between px-5 mt-2.5">
                  <div className="text-sm font-medium text-gray-900">
                    Select File
                  </div>

                  <TbFileDownload size={20} />
                </button>
              </Upload>
            </Form.Item>
            <Form.Item label="Note" required name="note">
              <Input.TextArea
                className="w-full py-4 px-5 mt-2.5"
                placeholder="Input note"
                rows={6}
              />
            </Form.Item>
          </Space>
        </Form>

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
      </CustomDrawerLayout>
    )
  );
};

export default LeaveRequestManagementSidebar;
