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
    <div
      className="flex justify-center text-xl font-extrabold text-gray-800 p-4"
      id="okr-appreciation-type-drawer-header"
      data-cy="okr-appreciation-type-drawer-header"
    >
      {appType ? 'Edit Appreciation Type' : 'Add Appreciation Type'}
    </div>
  );

  const footer = (
    <div
      className="w-full flex justify-center items-center gap-4 pt-8"
      id="okr-appreciation-type-drawer-footer"
      data-cy="okr-appreciation-type-drawer-footer"
    >
      <CustomButton
        type="default"
        title="Cancel"
        onClick={handleDrawerClose}
        style={{ marginRight: 8 }}
        id="okr-appreciation-type-drawer-cancel-button"
        data-cy="okr-appreciation-type-drawer-cancel-button"
      />
      <CustomButton
        htmlType="submit"
        title={appType ? 'Update' : 'Add'}
        type="primary"
        onClick={() => form.submit()}
        id="okr-appreciation-type-drawer-submit-button"
        data-cy="okr-appreciation-type-drawer-submit-button"
      />
    </div>
  );

  return (
    <CustomDrawerLayout
      open={open}
      onClose={handleDrawerClose}
      modalHeader={modalHeader}
      footer={footer}
      data-cy="okr-appreciation-type-drawer"
    >
      <Form
        form={form}
        name="appreciationForm"
        layout="vertical"
        onFinish={onFinish}
        initialValues={appType || {}}
        id="okr-appreciation-type-drawer-form"
        data-cy="okr-appreciation-type-drawer-form"
      >
        <Form.Item
          label="Appreciation Type"
          name="name"
          rules={[
            { required: true, message: 'Please enter appreciation type' },
          ]}
          id="okr-appreciation-type-drawer-name-field"
          data-cy="okr-appreciation-type-drawer-name-field"
        >
          <Input
            placeholder="Enter appreciation type"
            id="okr-appreciation-type-drawer-name-input"
            data-cy="okr-appreciation-type-drawer-name-input"
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please enter a description' }]}
          id="okr-appreciation-type-drawer-description-field"
          data-cy="okr-appreciation-type-drawer-description-field"
        >
          <Input.TextArea
            placeholder="Description of the reprimand"
            id="okr-appreciation-type-drawer-description-input"
            data-cy="okr-appreciation-type-drawer-description-input"
          />
        </Form.Item>

        <Form.Item
          label="Weight"
          name="weight"
          className="w-full"
          rules={[
            { required: true, message: 'Please enter appreciation weight' },
          ]}
          id="okr-appreciation-type-drawer-weight-field"
          data-cy="okr-appreciation-type-drawer-weight-field"
        >
          <InputNumber
            type="number"
            className="w-full"
            min={1}
            max={10}
            placeholder="Please enter appreciation weight"
            id="okr-appreciation-type-drawer-weight-input"
            data-cy="okr-appreciation-type-drawer-weight-input"
          />
        </Form.Item>

        <div
          className="flex gap-3 items-center"
          id="okr-appreciation-type-drawer-info"
          data-cy="okr-appreciation-type-drawer-info"
        >
          <MdInfo
            id="okr-appreciation-type-drawer-info-icon"
            data-cy="okr-appreciation-type-drawer-info-icon"
          />
          <span
            className="font-normal text-md"
            id="okr-appreciation-type-drawer-info-text"
            data-cy="okr-appreciation-type-drawer-info-text"
          >
            The weight is from 1-10 Scale
          </span>
        </div>
      </Form>
    </CustomDrawerLayout>
  );
};

export default AppreciationTypeDrawer;
