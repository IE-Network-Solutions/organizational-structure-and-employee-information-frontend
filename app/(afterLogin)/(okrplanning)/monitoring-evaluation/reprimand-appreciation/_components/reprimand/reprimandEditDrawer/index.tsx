import CustomButton from '@/components/common/buttons/customButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { useUpdateRepLog } from '@/store/server/features/okrplanning/monitoring-evaluation/reprimand-log/mutations';
import { useGetReprimandType } from '@/store/server/features/okrplanning/monitoring-evaluation/reprimand-type/queries';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import { ReprimandLog } from '@/store/uistate/features/okrplanning/monitoring-evaluation/reprimand-log/interface';
import { Form, Select, Input, Avatar } from 'antd';
import React, { useEffect } from 'react';
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

  const renderEmployeeOption = (option: any) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Avatar
        size={20}
        src={
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3'
        }
      />
      {option.firstName}
    </div>
  );

  const customTagRender = (props: any) => {
    const { label, closable, onClose } = props;
    return (
      <div className="flex gap-1 items-center bg-gray-100 p-2 rounded-lg mx-1 my-1">
        <Avatar
          size={20}
          src={
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3'
          }
        />
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
  const { mutate: updateRepLog } = useUpdateRepLog();

  const handleDrawerClose = () => {
    form.resetFields(); // Reset all form fields
    onClose();
  };

  const onFinish = (values: any) => {
    const value = { ...values, type: 'appreciation' };
    updateRepLog(
      { ...value, id: repLog?.id },
      {
        onSuccess: () => {
          handleDrawerClose();
        },
      },
    );
  };

  // Set form values when appType changes
  useEffect(() => {
    if (repLog) {
      form.setFieldsValue(repLog); // Set form fields with appType values
    } else {
      form.resetFields(); // Reset form if appType is null
    }
  }, [repLog, form]);
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
      width={window.innerWidth < 768 ? '90%' : '50%'} // Responsive drawer width
      footer={footer}
    >
      <Form
        form={form}
        name="reprimandForm"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
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
        <Form.Item name="carbonCopies" label="CC">
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
export default ReprimandEditDrawer;
