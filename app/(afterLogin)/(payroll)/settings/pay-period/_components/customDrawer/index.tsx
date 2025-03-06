import React, { useEffect } from 'react';
import CustomButton from '@/components/common/buttons/customButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { DatePicker, Form, Input } from 'antd';
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
      open={visible}
      onClose={onClose}
      modalHeader={
        <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
          Edit Pay Period
        </div>
      }
      width={width}
      footer={
        <div className="w-full flex justify-center items-center gap-4 pt-8">
          <CustomButton type="default" title="Cancel" onClick={onClose} />
          <CustomButton
            type="primary"
            title="Edit"
            onClick={() => form.submit()}
            loading={isLoading}
          />
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="flex flex-col gap-4"
      >
        <Form.Item
          label="Month"
          name="month"
          rules={[{ required: true, message: 'Please enter the month' }]}
        >
          <Input className="min-h-12" disabled />
        </Form.Item>

        <Form.Item
          label="Start Date"
          name="startDate"
          rules={[{ required: true, message: 'Please select a start date' }]}
        >
          <DatePicker
            className="min-h-12 w-full"
            value={form.getFieldValue('startDate')}
            onChange={(date) => form.setFieldValue('startDate', date)}
          />
        </Form.Item>

        <Form.Item
          label="End Date"
          name="endDate"
          rules={[{ required: true, message: 'Please select an end date' }]}
        >
          <DatePicker
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
