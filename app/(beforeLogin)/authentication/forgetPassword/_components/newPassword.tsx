'use client';
import { FC } from 'react';
import Logo from '../../../../../components/common/logo';
import { useRouter } from 'next/navigation';
import { Button, Form, Input } from 'antd';

const NewPassword: FC = () => {
  const router = useRouter();

  const handleNextClick = () => {
    router.push('/authentication/login');
  };
  return (
    <div className="flex justify-center items-center w-[80%] md:w-[35%] ">
      <div className="flex flex-col items-center gap-8 w-[80%] ">
        <div className="flex flex-row items-center gap-8">
          <Logo type="selamnew" />
        </div>

        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-semibold">Create New Password</h2>
        </div>

        <Form
          name="login-form"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          initialValues={{ remember: true }}
          onFinish={handleNextClick}
          autoComplete="off"
          className="w-full"
        >
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              className="rounded-[24px] border border-[#E9EBED] bg-[#FFF] w-full p-3"
              placeholder="Type your password"
              allowClear
            />
          </Form.Item>
          <Form.Item
            label="New Password"
            name="New password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              placeholder="Type your password"
              className="rounded-[24px] border border-[#E9EBED] bg-[#FFF] w-full p-3"
              allowClear
            />
          </Form.Item>

          <Form.Item>
            <Button
              //   loading={loading}
              className="w-full p-6 flex justify-center items-center rounded-full bg-[#F2F2F7] text-black font-semibold border-none mt-4"
              type="default"
              htmlType="submit"
            >
              Next
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default NewPassword;
