'use client';

import React, { useEffect } from 'react';
import { Form, Select, InputNumber, Modal, Button } from 'antd';

import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import { useGetActiveMonth } from '@/store/server/features/payroll/payroll/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useUpdateEmployeeSurvey } from '@/store/server/features/conversation/survey/mutation';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { EmployeeSurveyStore } from '@/store/uistate/features/conversation/survey';

interface EmployeeSurveyDrawerProps {
  open: boolean;
  onClose: () => void;
}

const EmployeeSurveyModal: React.FC<EmployeeSurveyDrawerProps> = ({
  open,
  onClose,
}) => {
  const [form] = Form.useForm();
  const { data: userData, isLoading } = useGetAllUsers();
  const users = userData?.items || [];
  const { survey } = EmployeeSurveyStore();
  const createdBy = useAuthenticationStore.getState().userId;
  const updatedBy = useAuthenticationStore.getState().userId;
  const { data: month } = useGetActiveMonth();
  const { mutate: updateEmployeeSurvey, isLoading: updateLoading } =
    useUpdateEmployeeSurvey();

  const handleDrawerClose = () => {
    form.resetFields();
    onClose();
  };

  useEffect(() => {
    if (open) {
      form.setFieldsValue(survey);
    }
  }, [open, survey]);

  const onFinish = (values: any) => {
    const payload = {
      ...values,
      monthId: month?.id,
      createdBy,
      updatedBy,
      id: survey?.id,
    };

    updateEmployeeSurvey(payload, {
      onSuccess: () => {
        NotificationMessage.success({
          message: 'Successfully updated',
          description: 'Employee Survey Updated Successfully',
        });
        handleDrawerClose();
      },
    });
  };

  const modalHeader = (
    <div className="flex  text-lg font-extrabold text-gray-800 ">
      Create Employee Survey
    </div>
  );

  const footer = (
    <div className="w-full flex justify-end items-center gap-4 pt-4">
      <Button
        type="default"
        onClick={handleDrawerClose}
        loading={updateLoading}
      >
        Cancel
      </Button>
      <Button
        title="Submit"
        type="primary"
        htmlType="submit"
        onClick={() => form.submit()}
        loading={updateLoading}
      >
        Submit
      </Button>
    </div>
  );

  return (
    <Modal
      open={open}
      onCancel={handleDrawerClose}
      title={modalHeader}
      footer={footer}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        name="employee_survey"
        onFinish={onFinish}
      >
        <Form.Item
          label="Employee"
          name="userId"
          rules={[{ required: true, message: 'Please select employee' }]}
        >
          <Select
            disabled={true}
            showSearch
            placeholder="Search Employee"
            className="w-full"
            allowClear
            loading={isLoading}
            filterOption={(input: any, option: any) =>
              (option?.label ?? '')?.toLowerCase().includes(input.toLowerCase())
            }
            options={users?.map((item: any) => ({
              ...item,
              value: item?.id,
              label:
                item?.firstName + ' ' + item?.middleName + ' ' + item?.lastName,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Score"
          name="score"
          rules={[{ required: true, message: 'Please input score' }]}
        >
          <InputNumber
            min={0}
            max={10}
            className="w-full"
            placeholder="Enter score"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EmployeeSurveyModal;
