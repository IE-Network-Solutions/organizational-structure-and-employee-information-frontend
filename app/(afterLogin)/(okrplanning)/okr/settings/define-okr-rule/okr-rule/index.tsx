import CustomButton from '@/components/common/buttons/customButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import {
  useCreateOkrRule,
  useUpdateOkrRule,
} from '@/store/server/features/okrplanning/monitoring-evaluation/okr-rule/mutations';
import { useOkrRuleStore } from '@/store/uistate/features/okrplanning/monitoring-evaluation/okr-rule';
import { OkrRule } from '@/store/uistate/features/okrplanning/monitoring-evaluation/okr-rule/interface';
import { Form, Input, InputNumber } from 'antd';
import React, { useEffect } from 'react';

interface OkrRuleDrawerProps {
  open: boolean;
  onClose: () => void;
  okrRule?: OkrRule | null;
}

const OkrRuleDrawer: React.FC<OkrRuleDrawerProps> = ({
  open,
  onClose,
  okrRule,
}) => {
  const { setOkrRule } = useOkrRuleStore();
  const [form] = Form.useForm();
  const { mutate: createOkrRule } = useCreateOkrRule();
  const { mutate: updateOkrRule } = useUpdateOkrRule();

  const handleDrawerClose = () => {
    form.resetFields(); // Reset all form fields
    onClose();
    setOkrRule(null);
  };

  const onFinish = (values: any) => {
    if (values?.myOkrPercentage + values?.teamOkrPercentage === 100) {
      okrRule
        ? updateOkrRule(
            { ...values, id: okrRule?.id },
            {
              onSuccess: () => {
                handleDrawerClose();
              },
            },
          )
        : createOkrRule(values, {
            onSuccess: () => {
              handleDrawerClose();
            },
          });
    } else {
      NotificationMessage.warning({
        message: 'OKR Rule Total Should be equal to 100',
      });
    }
  };

  // Set form values when OkrRule changes
  useEffect(() => {
    if (okrRule) {
      form.setFieldsValue(okrRule); // Set form fields with OkrRule values
    } else {
      form.resetFields(); // Reset form if OkrRule is null
    }
  }, [okrRule, form]);

  const modalHeader = (
    <div
      className="flex justify-center text-xl font-extrabold text-gray-800 p-4"
      id="okr-rule-drawer-header"
      data-cy="okr-rule-drawer-header"
    >
        {okrRule ? 'Edit OKR Rule' : 'Create OKR Rule'}
    </div>
  );

  const footer = (
    <div
      className="w-full flex justify-center items-center gap-4 pt-8"
      id="okr-rule-drawer-footer"
      data-cy="okr-rule-drawer-footer"
    >
      <CustomButton
        type="default"
        title="Cancel"
        onClick={handleDrawerClose}
        style={{ marginRight: 8 }}
        id="okr-rule-drawer-cancel-button"
        data-cy="okr-rule-drawer-cancel-button"
      />
      <CustomButton
        htmlType="submit"
        title={okrRule ? 'Update' : 'Create'}
        type="primary"
        onClick={() => form.submit()}
        id="okr-rule-drawer-submit-button"
        data-cy="okr-rule-drawer-submit-button"
      />
    </div>
  );

  return (
    <CustomDrawerLayout
      open={open}
      onClose={handleDrawerClose}
      modalHeader={modalHeader}
      footer={footer}
      width="30%"   
      data-cy="okr-rule-drawer"
    >
      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        id="okr-rule-drawer-form"
        data-cy="okr-rule-drawer-form"
      >
        <Form.Item
          label="OKR Rule Name"
          name="title"
          rules={[
            { required: true, message: 'Please enter the OKR rule name' },
          ]}
          id="okr-rule-drawer-title-field"
          data-cy="okr-rule-drawer-title-field"
        >
          <Input
            className="h-12"
            placeholder="Enter Name"
            id="okr-rule-drawer-title-input"
            data-cy="okr-rule-drawer-title-input"
          />
        </Form.Item>

        <div
          className="flex gap-4 w-full"
          id="okr-rule-drawer-percentage-wrapper"
          data-cy="okr-rule-drawer-percentage-wrapper"
        >
          <Form.Item
            label="Self Contribution Amount"
            name="myOkrPercentage"
            rules={[
              {
                required: true,
                message: 'Please enter self contribution amount',
              },
            ]}
            className="w-full"
            id="okr-rule-drawer-self-percentage-field"
            data-cy="okr-rule-drawer-self-percentage-field"
          >
            <InputNumber
              type="number"
              min={0}
              max={100}
              className="w-full  h-12 text-center "
              id="okr-rule-drawer-self-percentage-input"
              data-cy="okr-rule-drawer-self-percentage-input"
            />
          </Form.Item>

          <Form.Item
            label="Team's Contribution Amount"
            name="teamOkrPercentage"
            rules={[
              {
                required: true,
                message: "Please enter team's contribution amount",
              },
            ]}
            className="w-full"
            id="okr-rule-drawer-team-percentage-field"
            data-cy="okr-rule-drawer-team-percentage-field"
          >
            <InputNumber
              type="number"
              min={0}
              max={100}
              className="w-full  h-12 text-center "
              id="okr-rule-drawer-team-percentage-input"
              data-cy="okr-rule-drawer-team-percentage-input"
            />
          </Form.Item>
        </div>
      </Form>
    </CustomDrawerLayout>
  );
};

export default OkrRuleDrawer;
