import React from 'react';
import { Form, Input } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomButton from '@/components/common/buttons/customButton';
import useDrawerStore from '@/store/uistate/features/okrplanning/okrSetting/assignTargetDrawerStore';

const Drawer: React.FC = () => {
  const { isDrawerVisible, closeDrawer } = useDrawerStore();

  const onFinish = async () => {};

  return (
    <CustomDrawerLayout
      open={isDrawerVisible}
      onClose={closeDrawer}
      modalHeader={
        <span className="text-xl font-semibold">New Bank Information</span>
      }
      width="700px"
      footer={
        <div className="flex justify-center items-center w-full h-full">
          <div className="flex justify-between items-center gap-4">
            <CustomButton
              type="default"
              title="Cancel"
              onClick={() => {
                closeDrawer();
              }}
            />
            <CustomButton
              title="Create"
              onClick={() => {
                // form.submit()
              }}
            />
          </div>
        </div>
      }
    >
      <Form
        //   form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item label="Full Name" name="name">
          <Input placeholder="Abraham Dulla" className="h-12" />
        </Form.Item>

        <Form.Item label="Short Form" name="short-form">
          <Input type="text" placeholder="short form" className="h-12" />
        </Form.Item>

        <Form.Item label="Contact Branch" name="contact-branch">
          <Input type="text" placeholder="Contact Branch" className="h-12" />
        </Form.Item>

        <Form.Item label="Address" name="address">
          <Input type="text" placeholder="10" className="w-full h-12"></Input>
        </Form.Item>
        <Form.Item label="Email" name="email">
          <Input type="email" placeholder="10" className="w-full h-12"></Input>
        </Form.Item>
      </Form>
    </CustomDrawerLayout>
  );
};

export default Drawer;
