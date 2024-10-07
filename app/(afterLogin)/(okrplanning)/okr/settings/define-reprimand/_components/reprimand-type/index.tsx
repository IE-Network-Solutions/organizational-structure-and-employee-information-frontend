import CustomButton from '@/components/common/buttons/customButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import {
  useCreateRepType,
  useUpdateRepType,
} from '@/store/server/features/okrplanning/monitoring-evaluation/reprimand-type/mutations';
import { useRepTypeStore } from '@/store/uistate/features/okrplanning/monitoring-evaluation/reprimand-type';
import { ReprimandType } from '@/store/uistate/features/okrplanning/monitoring-evaluation/reprimand-type/interface';
import { Form, Input, InputNumber, Button } from 'antd';
import React, { useEffect } from 'react';
import { MdInfo } from 'react-icons/md';
interface RepTypeDrawerProps {
  open: boolean;
  onClose: () => void;
  repType?: ReprimandType;
}

const ReprimandTypeDrawer: React.FC<RepTypeDrawerProps> = ({
  repType,
  open,
  onClose,
}) => {
  const { setRepType } = useRepTypeStore();
  const [form] = Form.useForm();
  const { mutate: createRepType } = useCreateRepType();
  const { mutate: updateRepType } = useUpdateRepType();

  const handleDrawerClose = () => {
    form.resetFields(); // Reset all form fields
    onClose();
    setRepType(null);
  };

  const onFinish = (values: any) => {
    const value = { ...values, type: 'reprimand' };
    repType
      ? updateRepType(
          { ...value, id: repType?.id },
          {
            onSuccess: () => {
              handleDrawerClose();
            },
          },
        )
      : createRepType(value, {
          onSuccess: () => {
            handleDrawerClose();
          },
        });
  };

  // Set form values when appType changes
  useEffect(() => {
    if (repType) {
      form.setFieldsValue(repType); // Set form fields with appType values
    } else {
      form.resetFields(); // Reset form if appType is null
    }
  }, [repType, form]);

  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      {repType ? 'Edit Reprimand Type' : 'Add Reprimand Type'}
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
      <CustomButton title={'Add'} type="primary" />
    </div>
  );
  return (
    <CustomDrawerLayout
      open={open}
      onClose={handleDrawerClose}
      modalHeader={modalHeader}
      width={window.innerWidth < 768 ? '90%' : '35%'} // Responsive drawer width
      footer={footer}
    >
      <Form
        name="appreciationForm"
        layout="vertical"
        onFinish={onFinish}
        initialValues={repType || {}}
      >
        <Form.Item
          label="Reprimand Type"
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
            className="w-full"
            min={1}
            max={10}
            placeholder="Please enter appreciation weight"
          />
        </Form.Item>
        <div className="flex gap-3 items-center">
          <MdInfo />
          <span className="font-normal text-md">
            The weight is from 1- 10 Scale
          </span>
        </div>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </CustomDrawerLayout>
  );
};
export default ReprimandTypeDrawer;
