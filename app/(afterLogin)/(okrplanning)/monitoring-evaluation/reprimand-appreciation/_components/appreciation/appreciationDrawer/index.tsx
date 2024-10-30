import CustomButton from '@/components/common/buttons/customButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import {
  useCreateAppLog,
  useUpdateAppLog,
} from '@/store/server/features/okrplanning/monitoring-evaluation/appreciation-log/mutations';
import { useGetAppreciationType } from '@/store/server/features/okrplanning/monitoring-evaluation/appreciation-type/queries';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { AppreciationLog } from '@/store/uistate/features/okrplanning/monitoring-evaluation/appreciation-log/interface';
import { Form, Select, Input, Avatar } from 'antd';
import React from 'react';
import { UserOutlined } from '@ant-design/icons';

interface AppDrawerProps {
  open: boolean;
  onClose: () => void;
  appLog?: AppreciationLog | null;
}

const AppreciationDrawer: React.FC<AppDrawerProps> = ({
  appLog,
  onClose,
  open,
}) => {
  const { data: allUsers } = useGetAllUsers();
  const { data: appTypes } = useGetAppreciationType();

  const renderEmployeeOption = (option: any) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Avatar size={20} icon={<UserOutlined />} />
      {option.firstName}
    </div>
  );

  const customTagRender = (props: any) => {
    const { label, closable, onClose } = props;
    return (
      <div className="flex gap-1 items-center bg-gray-100 p-2 rounded-lg mx-1 my-1">
        <Avatar size={20} icon={<UserOutlined />} />
        <span>{label}</span>
        {closable && (
          <span onClick={onClose} className="text-black text-xs">
            ✖
          </span>
        )}
      </div>
    );
  };

  const [form] = Form.useForm();
  const { mutate: createAppLog } = useCreateAppLog();
  const { mutate: updateAppLog } = useUpdateAppLog();
  const { userId } = useAuthenticationStore();

  const onFinish = (values: any) => {
    const value = { ...values, issuerId: userId };
    appLog
      ? updateAppLog(
          { ...value, id: appLog?.id },
          {
            onSuccess: () => {
              handleDrawerClose();
            },
          },
        )
      : createAppLog(value, {
          onSuccess: () => {
            handleDrawerClose();
          },
        });
  };

  const handleDrawerClose = () => {
    form.resetFields(); // Reset all form fields
    onClose();
  };

  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Appreciate
    </div>
  );

  const footer = (
    <div className="w-full flex justify-center items-center gap-4 pt-8">
      <CustomButton
        type="default"
        title="Cancel"
        onClick={handleDrawerClose}
        style={{ marginRight: 8 }}
      />
      <CustomButton
        title={'Add'}
        type="primary"
        htmlType="submit" // Add this line
        onClick={() => form.submit()} // Trigger form submission
      />
    </div>
  );

  return (
    <CustomDrawerLayout
      open={open}
      onClose={handleDrawerClose}
      modalHeader={modalHeader}
      footer={footer}
    >
      <Form
        form={form}
        name="appLogForm"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        {/* Select Employee */}
        <Form.Item
          name="recipientIds"
          label="Select Employee"
          rules={[{ required: true, message: 'Please select employees' }]}
        >
          <Select
            mode="multiple"
            allowClear
            placeholder="Select Employees"
            optionLabelProp="label"
            tagRender={customTagRender}
          >
            {allUsers?.items.map((option: any) => (
              <Select.Option
                key={option.id}
                value={option.id}
                label={option.firstName}
              >
                {renderEmployeeOption(option)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Select Type */}
        <Form.Item
          name="typeId"
          label="Select Type"
          rules={[{ required: true, message: 'Please select a type' }]}
        >
          <Select placeholder="Select Reprimand Type">
            {appTypes?.items?.map((item) => (
              <Select.Option key={item?.id} value={item?.id}>
                {item?.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* Reason */}
        <Form.Item
          name="action"
          label="Reason"
          rules={[{ required: true, message: 'Please enter the reason' }]}
        >
          <Input.TextArea rows={4} placeholder="Enter reason here..." />
        </Form.Item>

        {/* CC */}
        <Form.Item name="cc" label="CC">
          <Select
            mode="multiple"
            allowClear
            placeholder="Select Employees"
            optionLabelProp="label"
            tagRender={customTagRender}
          >
            {allUsers?.items.map((option: any) => (
              <Select.Option
                key={option.id}
                value={option.id}
                label={option.firstName}
              >
                {renderEmployeeOption(option)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </CustomDrawerLayout>
  );
};

export default AppreciationDrawer;
