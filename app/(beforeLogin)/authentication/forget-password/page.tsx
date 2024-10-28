'use client';
import { FC } from 'react';
import Logo from '@/components/common/logo/index';
import { Button, Form, Input } from 'antd';
import { usePasswordReset } from '@/store/server/features/employees/authentication/queries';

const RequestVerification: FC = () => {
  const { mutate: resetPassword, isLoading } = usePasswordReset();

  const handleFinish = async (values: { email: string }) => {
    resetPassword(values.email);
  };

  return (
    <div
      className="h-screen w-full flex flex-col justify-center items-center bg-cover bg-center bg-no-repeat px-4"
      style={{ backgroundImage: 'url(/login-background.png)', margin: 0 }}
    >
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
            name="request-reset-form"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            onFinish={handleFinish}
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
                className="w-full p-6 flex justify-center items-center rounded-full bg-[#F2F2F7] text-black font-semibold mt-8"
                type="primary"
                htmlType="submit"
                block
                loading={isLoading}
              >
                Send Reset Link
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default RequestVerification;
