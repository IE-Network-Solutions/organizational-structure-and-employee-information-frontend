import CustomButton from '@/components/common/buttons/customButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import {
  useCreateAppType,
  useUpdateAppType,
} from '@/store/server/features/okrplanning/monitoring-evaluation/appreciation-type/mutations';
import { useAppTypeStore } from '@/store/uistate/features/okrplanning/monitoring-evaluation/appreciation-type';
import { AppreciationType } from '@/store/uistate/features/okrplanning/monitoring-evaluation/appreciation-type/interface';
import { Form, Input, InputNumber } from 'antd';
import React, { useEffect } from 'react';
import { MdInfo } from 'react-icons/md';

interface AppTypeDrawerProps {
  open: boolean;
  onClose: () => void;
  appType?: AppreciationType | null;
}

const AppreciationTypeDrawer: React.FC<AppTypeDrawerProps> = ({
  open,
  onClose,
  appType,
}) => {
  const { setAppType } = useAppTypeStore();
  const [form] = Form.useForm();
  const { mutate: createAppType } = useCreateAppType();
  const { mutate: updateAppType } = useUpdateAppType();

  const handleDrawerClose = () => {
    form.resetFields(); // Reset all form fields
    onClose();
    setAppType(null);
  };

  const onFinish = (values: any) => {
    const value = { ...values, type: 'appreciation' };
    appType
      ? updateAppType(
          { ...value, id: appType?.id },
          {
            onSuccess: () => {
              handleDrawerClose();
              form.resetFields();
            },
          },
        )
      : createAppType(value, {
          onSuccess: () => {
            handleDrawerClose();
            form.resetFields();
          },
        });
  };

  // Set form values when appType changes
  useEffect(() => {
    if (appType) {
      form.setFieldsValue(appType); // Set form fields with appType values
    } else {
      form.resetFields(); // Reset form if appType is null
    }
  }, [appType, form]);

  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      {appType ? 'Edit Appreciation Type' : 'Add Appreciation Type'}
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
        htmlType="submit"
        title={appType ? 'Update' : 'Add'}
        type="primary"
        onClick={() => form.submit()}
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
        name="appreciationForm"
        layout="vertical"
        onFinish={onFinish}
        initialValues={appType || {}}
      >
        <Form.Item
          label="Appreciation Type"
          name="name"
          rules={[
            { required: true, message: 'Please enter appreciation type' },
          ]}
        >
          <Input placeholder="Enter appreciation type" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please enter a description' }]}
        >
          <Input.TextArea placeholder="Description of the reprimand" />
        </Form.Item>

        <Form.Item
          label="Weight"
          name="weight"
          className="w-full"
          rules={[
            { required: true, message: 'Please enter appreciation weight' },
          ]}
        >
          <InputNumber
            type="number"
            className="w-full"
            min={1}
            max={10}
            placeholder="Please enter appreciation weight"
          />
        </Form.Item>

        <div className="flex gap-3 items-center">
          <MdInfo />
          <span className="font-normal text-md">
            The weight is from 1-10 Scale
          </span>
        </div>
      </Form>
    </CustomDrawerLayout>
  );
};

export default AppreciationTypeDrawer;
