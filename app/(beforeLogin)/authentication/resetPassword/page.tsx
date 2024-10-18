'use client';
import { FC, useEffect, useState } from 'react';
import Logo from '../../../../components/common/logo';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Form, Input, message } from 'antd';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '@/utils/firebaseConfig';

const NewPassword: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get('oobCode'); // Get the oobCode from the URL
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if oobCode is missing
  useEffect(() => {
    if (!oobCode) {
      message.error('Invalid or expired reset link.');
      router.push('/authentication/forgotPassword');
    }
  }, [oobCode, router]);

  const handleFinish = async (values: {
    newPassword: string;
    confirmPassword: string;
  }) => {
    const { newPassword, confirmPassword } = values;

    if (newPassword !== confirmPassword) {
      message.error("Passwords don't match!");
      return;
    }

    try {
      setIsLoading(true);
      if (oobCode) {
        // Use Firebase's confirmPasswordReset to reset the password
        await confirmPasswordReset(auth, oobCode, newPassword);
        message.success('Password successfully reset!');
        router.push('/authentication/login');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      message.error('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="h-screen w-full flex flex-col justify-center items-center bg-cover bg-center bg-no-repeat px-4"
      style={{ backgroundImage: 'url(/login-background.png)', margin: 0 }}
    >
      <div className="flex justify-center items-center w-[80%] md:w-[35%] ">
        <div className="flex flex-col items-center gap-8 w-[80%] ">
          <div className="flex flex-row items-center gap-8">
            <Logo type="selamnew" />
          </div>

          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-semibold">Create New Password</h2>
          </div>

          <Form
            name="new-password-form"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            onFinish={handleFinish}
            autoComplete="off"
            className="w-full"
          >
            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[
                { required: true, message: 'Please input your new password!' },
              ]}
            >
              <Input.Password
                className="rounded-[24px] border border-[#E9EBED] bg-[#FFF] w-full p-3"
                placeholder="Type your new password"
                allowClear
              />
            </Form.Item>

            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              rules={[
                { required: true, message: 'Please confirm your password!' },
              ]}
            >
              <Input.Password
                placeholder="Confirm your new password"
                className="rounded-[24px] border border-[#E9EBED] bg-[#FFF] w-full p-3"
                allowClear
              />
            </Form.Item>

            <Form.Item>
              <Button
                className="w-full p-6 flex justify-center items-center rounded-full bg-[#F2F2F7] text-black font-semibold border-none mt-4"
                type="primary"
                htmlType="submit"
                loading={isLoading}
              >
                Set New Password
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default NewPassword;
