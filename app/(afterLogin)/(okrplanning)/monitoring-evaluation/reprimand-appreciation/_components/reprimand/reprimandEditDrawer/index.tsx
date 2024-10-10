import CustomButton from '@/components/common/buttons/customButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { useUpdateRepLog } from '@/store/server/features/okrplanning/monitoring-evaluation/reprimand-log/mutations';
import { useGetReprimandType } from '@/store/server/features/okrplanning/monitoring-evaluation/reprimand-type/queries';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import { ReprimandLog } from '@/store/uistate/features/okrplanning/monitoring-evaluation/reprimand-log/interface';
import { Form, Select, Input, Avatar } from 'antd';
import React, { useEffect } from 'react';
import { UserOutlined } from '@ant-design/icons';

interface RepDrawerProps {
  open: boolean;
  onClose: () => void;
  repLog?: ReprimandLog | null;
}

const ReprimandEditDrawer: React.FC<RepDrawerProps> = ({
  open,
  onClose,
  repLog,
}) => {
  const { data: allUsers } = useGetAllUsers();
  const { data: repTypes } = useGetReprimandType();
  const [form] = Form.useForm();
  const { mutate: updateRepLog } = useUpdateRepLog();

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

  const handleDrawerClose = () => {
    form.resetFields(); // Reset all form fields
    onClose();
  };

  const onFinish = (values: any) => {
    const value = { ...values, type: 'appreciation' };
    updateRepLog(
      { ...value, id: repLog?.id },
      {
        onSuccess: handleDrawerClose,
      },
    );
  };

  const cc = repLog?.carbonCopies?.map((copy: any) => copy.copyUserId) || []; // Ensure it's an array
  const reprimandLog = { ...repLog, cc }; // Create a new object with the updated cc field

  useEffect(() => {
    if (repLog) {
      form.setFieldsValue(reprimandLog); // Set form fields with reprimandLog values
    } else {
      form.resetFields(); // Reset form if repLog is null
    }
  }, [reprimandLog, form]);

  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Edit Reprimand
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
        title={'Update'}
        type="primary"
        htmlType="submit"
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
        name="reprimandForm"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        initialValues={reprimandLog}
      >
        {/* Select Employee */}
        <Form.Item
          name="recipientId"
          label="Select Employee"
          rules={[{ required: true, message: 'Please select employees' }]}
        >
          <Select
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
            {repTypes?.items?.map((item) => (
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
            value={cc} // This should now hold the correct array of selected user IDs
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

export default ReprimandEditDrawer;
