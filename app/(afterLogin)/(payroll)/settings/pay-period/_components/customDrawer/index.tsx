import React, { useEffect } from 'react';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { Button, DatePicker, Form, Input } from 'antd';
import useEditDrawerStore from '@/store/uistate/features/payroll/settings/drawer';
import dayjs from 'dayjs';
import { useEditPayPeriod } from '@/store/server/features/payroll/setting/tax-rule/mutation';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

interface CustomDrawerProps {
  visible: boolean;
  onClose: () => void;
  width?: string;
}

const CustomDrawer: React.FC<CustomDrawerProps> = ({
  visible,
  onClose,
  width = '30%',
}) => {
  const { id, startDate, endDate, reset } = useEditDrawerStore();
  const { mutate: editPayPeriod, isLoading } = useEditPayPeriod();

  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      month: startDate ? dayjs(startDate).format('MMMM') : '',
      startDate: startDate ? dayjs(startDate) : null,
      endDate: endDate ? dayjs(endDate) : null,
    });
  }, [form, startDate, endDate, reset]);

  const onFinish = () => {
    const values = form.getFieldsValue();
    editPayPeriod(
      {
        payPeriodId: id,
        data: {
          startDate: values.startDate
            ? dayjs(values.startDate).format('YYYY-MM-DD')
            : null,
          endDate: values.endDate
            ? dayjs(values.endDate).format('YYYY-MM-DD')
            : null,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <CustomDrawerLayout
      data-cy="payroll-payperiod-edit-drawer"
      open={visible}
      onClose={onClose}
      modalHeader={
        <div
          id="payroll-payperiod-edit-drawer-header"
          data-cy="payroll-payperiod-edit-drawer-header"
          className="flex justify-center text-xl font-extrabold text-gray-800 p-4"
        >
          Edit Pay Period
        </div>
      }
      width={width}
      footer={
        <div
          id="payroll-payperiod-edit-drawer-footer"
          data-cy="payroll-payperiod-edit-drawer-footer"
          className="w-full flex justify-center items-center gap-4 p-4"
        >
          <Button
            id="payroll-payperiod-edit-drawer-cancel"
            data-cy="payroll-payperiod-edit-drawer-cancel"
            type="default"
            className="h-10"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            id="payroll-payperiod-edit-drawer-submit"
            data-cy="payroll-payperiod-edit-drawer-submit"
            type="primary"
            className="h-10"
            onClick={() => form.submit()}
            loading={isLoading}
          >
            Edit
          </Button>
        </div>
      }
    >
      <Form
        id="payroll-payperiod-edit-drawer-form"
        data-cy="payroll-payperiod-edit-drawer-form"
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="flex flex-col gap-4"
      >
        <Form.Item
          id="payroll-payperiod-edit-drawer-month-formitem"
          data-cy="payroll-payperiod-edit-drawer-month-formitem"
          label="Month"
          name="month"
          rules={[{ required: true, message: 'Please enter the month' }]}
        >
          <Input
            id="payroll-payperiod-edit-drawer-month-input"
            data-cy="payroll-payperiod-edit-drawer-month-input"
            className="h-10"
            disabled
          />
        </Form.Item>

        <Form.Item
          id="payroll-payperiod-edit-drawer-start-formitem"
          data-cy="payroll-payperiod-edit-drawer-start-formitem"
          label="Start Date"
          name="startDate"
          rules={[{ required: true, message: 'Please select a start date' }]}
        >
          <DatePicker
            id="payroll-payperiod-edit-drawer-start-date-picker"
            data-cy="payroll-payperiod-edit-drawer-start-date-picker"
            className="h-10 w-full"
            value={form.getFieldValue('startDate')}
            onChange={(date) => form.setFieldValue('startDate', date)}
          />
        </Form.Item>

        <Form.Item
          id="payroll-payperiod-edit-drawer-end-formitem"
          data-cy="payroll-payperiod-edit-drawer-end-formitem"
          label="End Date"
          name="endDate"
          rules={[{ required: true, message: 'Please select an end date' }]}
        >
          <DatePicker
            id="payroll-payperiod-edit-drawer-end-date-picker"
            data-cy="payroll-payperiod-edit-drawer-end-date-picker"
            className="min-h-12 w-full"
            value={form.getFieldValue('endDate')}
            onChange={(date) => form.setFieldValue('endDate', date)}
          />
        </Form.Item>
      </Form>
    </CustomDrawerLayout>
  );
};

export default CustomDrawer;
