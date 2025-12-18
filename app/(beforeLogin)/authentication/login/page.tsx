'use client';
import { FC } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import {
  auth,
  googleProvider,
  microsoftProvider,
} from '@/utils/firebaseConfig';
import type { FormProps } from 'antd';
import { Button, Checkbox, Form, Input } from 'antd';
import { Microsoft } from '@/components/Icons/microsoft';
import { Google } from '@/components/Icons/google';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useHandleSignIn } from './_components/signinHandler';
import Link from 'next/link';
import TwoFactorAuth from './_components/2fa';
import SimpleLogo from '@/components/common/logo/simpleLogo';
import { useGet2FACode } from '@/store/server/features/authentication/mutation';

type FieldType = {
  email: string;
  password: string;
  remember?: string;
};

const Login: FC = () => {
  const { loading, is2FA, setIs2FA, setLocalId, setUser2FA } =
    useAuthenticationStore();
  const { mutate: get2FACode, isLoading: isGet2FACodeLoading } =
    useGet2FACode();
  const { handleSignIn } = useHandleSignIn();

  const handleEmailPasswordSignIn: FormProps<FieldType>['onFinish'] = async (
    values,
  ) => {
    get2FACode(
      {
        values: {
          email: values.email.toLowerCase(),
          pass: values.password,
        },
      },
      {
        onSuccess: async (data) => {
          if (data?.is2FAEnabled === false) {
            return await handleSignIn(() =>
              signInWithEmailAndPassword(
                auth,
                values.email.toLowerCase(),
                values.password,
              ),
            );
          } else {
            setUser2FA({
              email: values.email.toLowerCase(),
              pass: values.password,
            });
            setLocalId(data?.uid);
            setIs2FA(true);
          }
        },
      },
    );
  };

  const handleGoogleSignIn = async () => {
    await handleSignIn(
      () => signInWithPopup(auth, googleProvider),
      'google.com',
    );
  };

  const handleMicrosoftSignIn = async () => {
    await handleSignIn(
      () => signInWithPopup(auth, microsoftProvider),
      'microsoft.com',
    );
  };

  return is2FA ? (
    <TwoFactorAuth />
  ) : (
    <div
      id="login-background"
      data-cy="login-background"
      className="h-screen w-full flex flex-col justify-center items-center bg-cover bg-center bg-no-repeat px-4"
      style={{ backgroundImage: 'url(/Background.png)', margin: 0 }}
    >
      <div
        id="div-login-form"
        data-cy="div-login-form"
        className="bg-[#FAFAFA] w-full max-w-md py-8 px-8 rounded-2xl my-5 shadow-2xl"
      >
        <div
          id="login-logo"
          data-cy="login-logo"
          className="flex justify-center mb-2"
        >
          <SimpleLogo />
        </div>
        <h2
          id="login-title"
          data-cy="login-title"
          className="text-center text-2xl font-bold text-gray-900 mb-6"
        >
          Login
        </h2>

        <Form
          id="login-form"
          data-cy="login-form"
          name="login-form"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          initialValues={{ remember: true }}
          onFinish={handleEmailPasswordSignIn}
          autoComplete="off"
        >
          <Form.Item
            id="login-email"
            data-cy="login-email"
            label={<span className="text-gray-700 font-medium">Email</span>}
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
              id="login-email-input"
              data-cy="login-email-input"
              placeholder="Enter email"
              className="w-full h-11 rounded-lg"
              allowClear
            />
          </Form.Item>

          <Form.Item
            id="login-password"
            data-cy="login-password"
            label={<span className="text-gray-700 font-medium">Password</span>}
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              id="login-password-input"
              data-cy="login-password-input"
              placeholder="Enter password"
              className="w-full h-11 rounded-lg"
              allowClear
            />
          </Form.Item>

          <div
            id="login-remember-forgot"
            data-cy="login-remember-forgot"
            className="flex justify-between items-center mb-2"
          >
            <Form.Item
              id="login-remember"
              data-cy="login-remember"
              name="remember"
              valuePropName="checked"
              noStyle
            >
              <Checkbox
                id="login-remember-checkbox"
                data-cy="login-remember-checkbox"
                className="text-black font-medium"
              >
                Remember me
              </Checkbox>
            </Form.Item>
            <Link
              id="login-forgot-password"
              data-cy="login-forgot-password"
              href="/authentication/forget-password"
              className="text-[#4e4ef1] hover:text-blue-600 font-medium"
            >
              Forgot password
            </Link>
          </div>

          <Form.Item id="login-submit" data-cy="login-submit" className="mb-4">
            <Button
              id="login-submit-button"
              data-cy="login-submit-button"
              loading={loading || isGet2FACodeLoading}
              className="h-12 rounded-md text-base font-medium"
              type="primary"
              htmlType="submit"
              block
            >
              Submit
            </Button>
          </Form.Item>
        </Form>

        <p
          id="login-or-login-with"
          data-cy="login-or-login-with"
          className="text-center text-sm text-black mb-4"
        >
          Or login with
        </p>

        <div
          id="login-social-buttons"
          data-cy="login-social-buttons"
          className="flex flex-row gap-3"
        >
          <Button
            id="login-google-button"
            data-cy="login-google-button"
            size="large"
            icon={<Google />}
            className="flex-1 h-11 text-sm bg-white border border-gray-200 rounded-lg hover:border-gray-300"
            onClick={handleGoogleSignIn}
          >
            Google
          </Button>
          <Button
            id="login-microsoft-button"
            data-cy="login-microsoft-button"
            size="large"
            icon={<Microsoft />}
            className="flex-1 h-11 text-sm bg-white border border-gray-200 rounded-lg hover:border-gray-300"
            onClick={handleMicrosoftSignIn}
          >
            Microsoft
          </Button>
        </div>
        {/* Footer */}
        <div
          id="login-footer"
          data-cy="login-footer"
          className="text-xs text-gray-500 text-center mt-4"
        >
          © {new Date().getFullYear().toString()} PEP. All-rights reserved.
          <Link href="/terms" className="text-black font-medium ml-2">
            Terms & Conditions
          </Link>
          <Link href="/privacy" className="text-black font-medium ml-2">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
