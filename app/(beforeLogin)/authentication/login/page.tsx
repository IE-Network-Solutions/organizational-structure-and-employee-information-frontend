'use client';
import React, { useEffect, useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import {
  auth,
  googleProvider,
  microsoftProvider,
} from '@/utils/firebaseConfig';

import type { FormProps } from 'antd';
import { Button, Checkbox, Form, Input, message } from 'antd';
import { Microsoft } from '@/components/Icons/microsoft';
import { Google } from '@/components/Icons/google';
import { useGetTenantId } from '@/store/server/features/employees/authentication/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { redirect } from 'next/navigation'

type FieldType = {
  email: string;
  password: string;
  remember?: string;
};

const Login: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const { setToken, localId, setLocalId, setTenantId } = useAuthenticationStore();

  // Call the React Query hook
  const { data: fetchedTenantId, refetch } = useGetTenantId(localId);

  // Update tenantId in store when fetched
  useEffect(() => {
    if (fetchedTenantId) {
      setTenantId(fetchedTenantId?.tenantId);
      redirect(`/employees/manage-employees`) 
    }
  }, [fetchedTenantId, setTenantId]);

  // Trigger refetch when localId is set
  useEffect(() => {
    if (localId) {
      refetch();
    }
  }, [localId, refetch]);

  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    setError('');
    try {
      const response = await signInWithPopup(auth, googleProvider);
      const user = response.user;
      const uId = user.uid;
      // Get the ID token
      const idToken = await user.getIdToken();
      setToken(idToken);
      setLocalId(uId);
    } catch (err: any) {
      setError(err.message);
      console.log(err, "data error");
    }
  };
  const handleEmailPasswordSignIn: FormProps<FieldType>['onFinish'] = async (
    values,
  ) => {
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);

      // Handle successful sign-in
      const user = userCredential.user;
      console.log(userCredential,"response")

      message.success(`Welcome back, ${user.displayName || 'User'}!`);
  
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };


  const handleMicrosoftSignIn = async () => {
    setError('');
    try {
      await signInWithPopup(auth, microsoftProvider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div
      className="h-screen w-full flex flex-col justify-center items-center bg-cover bg-center bg-no-repeat px-4"
      style={{ backgroundImage: 'url(/login-background.png)', margin: 0 }}
    >
      <div className="bg-[#F1F2F3] w-full max-w-md py-4 px-6 rounded-lg my-5">
        <p className="text-center font-semibold">PEP</p>
        <h5 className="text-center my-2">Admin Login</h5>
        <Form
          name="login-form"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          initialValues={{ remember: true }}
          onFinish={handleEmailPasswordSignIn}
          autoComplete="off"
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
              placeholder="type your email"
              className="w-full h-10"
              allowClear
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              placeholder="type your email"
              className="w-full h-10"
              allowClear
            />
          </Form.Item>

          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox className="m-1">Remember me</Checkbox>
            </Form.Item>
            <Button className="float-right m-0 p-0" type="link">
              Forgot password
            </Button>
          </Form.Item>

          <Form.Item>
            <Button
              loading={loading}
              className="py-5 my-4"
              type="primary"
              htmlType="submit"
              block
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
        <p className="text-center text-xs font-light mb-5">Or login with</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            size="small"
            icon={<Google />}
            className="p-4 text-sm bg-transparent"
            onClick={handleGoogleSignIn}
            block
          >
            Google
          </Button>
          <Button
            size="small"
            icon={<Microsoft />}
            className="p-4 text-sm bg-transparent"
            onClick={handleMicrosoftSignIn}
            block
          >
            Microsoft
          </Button>
        </div>

        {error && (
          <p className="text-red-500 mt-5 text-center">Something happened!</p>
        )}
      </div>
      <div className="text-xs font-thin text-center">
        © 2024 PEP. All-rights reserved.
        <span className="font-semibold ml-1 cursor-pointer">
          Terms & Conditions
        </span>
        <span className="font-semibold ml-1 cursor-pointer">
          Privacy Settings
        </span>
      </div>
    </div>
  );
};

export default Login;
