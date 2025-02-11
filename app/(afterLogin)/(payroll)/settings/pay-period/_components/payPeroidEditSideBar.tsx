import React, { useState } from 'react';
import { DatePicker, Form, Select, Spin } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';

const { RangePicker } = DatePicker;

const PayPeriodEditSidebar = () => {
  const [range, setRange] = useState();

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-14',
      size: 'large',
      loading: false,
      // onClick: () => onclose(),
    },
    {
      label: <span>Edit</span>,
      key: 'Edit',
      className: 'h-14',
      type: 'primary',
      size: 'large',
      loading: false,
      // onClick: () => form.submit(),
    },
  ];

  return (
    <CustomDrawerLayout
      open={true}
      onClose={() => {}}
      modalHeader={
        <CustomDrawerHeader className="flex justify-center">
          <span>Edit Pay Period</span>
        </CustomDrawerHeader>
      }
      footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
      width="600px"
    >
      <Spin spinning={false}>
        <Form
          layout="vertical"
          // form={form}
          // onFinish={() => onFormSubmit()}
          // requiredMark={CustomLabel}
        >
          <Form.Item name="month" label="Month">
            <Select disabled placeholder="Select a month" />
          </Form.Item>

          <Form.Item
            name="payPeriodRange"
            label="Pay Period Range"
            rules={[
              { required: true, message: 'Please select pay period Range' },
            ]}
          >
            <RangePicker
              value={range}
              //   onChange={setRange}
              allowClear
              format="YYYY-MM-DD"
              disabledDate={(current) => false} // Customize this as needed
            />
          </Form.Item>
        </Form>
      </Spin>
    </CustomDrawerLayout>
  );
};

export default PayPeriodEditSidebar;
