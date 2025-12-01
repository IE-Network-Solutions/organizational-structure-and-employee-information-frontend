import CustomButton from '@/components/common/buttons/customButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import {
  useCreateRepType,
  useUpdateRepType,
} from '@/store/server/features/okrplanning/monitoring-evaluation/reprimand-type/mutations';
import { useRepTypeStore } from '@/store/uistate/features/okrplanning/monitoring-evaluation/reprimand-type';
import { ReprimandType } from '@/store/uistate/features/okrplanning/monitoring-evaluation/reprimand-type/interface';
import { Form, Input, InputNumber } from 'antd';
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
    <div
      className="flex justify-center text-xl font-extrabold text-gray-800 p-4"
      id="okr-reprimand-type-drawer-header"
      data-cy="okr-reprimand-type-drawer-header"
    >
      {repType ? 'Edit Reprimand Type' : 'Add Reprimand Type'}
    </div>
  );
  const footer = (
    <div
      className="w-full flex justify-center items-center gap-4 pt-8"
      id="okr-reprimand-type-drawer-footer"
      data-cy="okr-reprimand-type-drawer-footer"
    >
      <CustomButton
        type="default"
        title="Cancel"
        onClick={handleDrawerClose}
        style={{ marginRight: 8 }}
        id="okr-reprimand-type-drawer-cancel-button"
        data-cy="okr-reprimand-type-drawer-cancel-button"
      />
      <CustomButton
        htmlType="submit"
        title={repType ? 'Update' : 'Add'}
        type="primary"
        onClick={() => form.submit()}
        id="okr-reprimand-type-drawer-submit-button"
        data-cy="okr-reprimand-type-drawer-submit-button"
      />
    </div>
  );
  return (
    <CustomDrawerLayout
      open={open}
      onClose={handleDrawerClose}
      modalHeader={modalHeader}
      footer={footer}
      data-cy="okr-reprimand-type-drawer"
    >
      <Form
        form={form}
        name="reprimandForm"
        layout="vertical"
        onFinish={onFinish}
        initialValues={repType || {}}
        id="okr-reprimand-type-drawer-form"
        data-cy="okr-reprimand-type-drawer-form"
      >
        <Form.Item
          label="Reprimand Type"
          name="name"
          rules={[
            { required: true, message: 'Please enter appreciation type' },
          ]}
          id="okr-reprimand-type-drawer-name-field"
          data-cy="okr-reprimand-type-drawer-name-field"
        >
          <Input
            placeholder="Enter appreciation type"
            id="okr-reprimand-type-drawer-name-input"
            data-cy="okr-reprimand-type-drawer-name-input"
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please enter a description' }]}
          id="okr-reprimand-type-drawer-description-field"
          data-cy="okr-reprimand-type-drawer-description-field"
        >
          <Input.TextArea
            placeholder="Description of the reprimand"
            id="okr-reprimand-type-drawer-description-input"
            data-cy="okr-reprimand-type-drawer-description-input"
          />
        </Form.Item>

        <Form.Item
          label="Weight"
          name="weight"
          className="w-full"
          rules={[
            { required: true, message: 'Please enter appreciation weight' },
          ]}
          id="okr-reprimand-type-drawer-weight-field"
          data-cy="okr-reprimand-type-drawer-weight-field"
        >
          <InputNumber
            className="w-full"
            min={1}
            max={10}
            placeholder="Please enter appreciation weight"
            id="okr-reprimand-type-drawer-weight-input"
            data-cy="okr-reprimand-type-drawer-weight-input"
          />
        </Form.Item>
        <div
          className="flex gap-3 items-center"
          id="okr-reprimand-type-drawer-info"
          data-cy="okr-reprimand-type-drawer-info"
        >
          <MdInfo
            id="okr-reprimand-type-drawer-info-icon"
            data-cy="okr-reprimand-type-drawer-info-icon"
          />
          <span
            className="font-normal text-md"
            id="okr-reprimand-type-drawer-info-text"
            data-cy="okr-reprimand-type-drawer-info-text"
          >
            The weight is from 1- 10 Scale
          </span>
        </div>
      </Form>
    </CustomDrawerLayout>
  );
};
export default ReprimandTypeDrawer;
