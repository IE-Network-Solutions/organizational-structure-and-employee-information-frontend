'use client';
import { FC } from 'react';
import Logo from '../../../../../components/common/logo';
import { Button, Form, Input } from 'antd';

const RequestVerification: FC<{ onNext: () => void }> = ({ onNext }) => {
  return (
    <div className="flex justify-center items-center w-[80%] md:w-[35%]">
      <div className="flex flex-col items-center gap-8 w-[80%] ">
        <div className="flex flex-row items-center gap-8">
          <Logo type="selamnew" />
        </div>

        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-semibold">Forgot Password</h2>
          <p className="text-center text-sm">Recover your account password</p>
        </div>
        <Form
          name="login-form"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          initialValues={{ remember: true }}
          onFinish={onNext}
          autoComplete="off"
          className="w-full"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: 'Please input your email!',
                type: 'email',
              },
            ]}
          >
            <Input
              placeholder="Type your email"
              className="w-full h-[52px] pl-[16px] flex items-center self-stretch border border-[#E9EBED] bg-white rounded-full"
              allowClear
            />
          </Form.Item>

          <Form.Item>
            <Button
              // loading={loading}
              className="w-full p-6 flex justify-center items-center rounded-full bg-[#F2F2F7] text-black font-semibold mt-8"
              type="primary"
              htmlType="submit"
              block
            >
              Next
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default RequestVerification;
