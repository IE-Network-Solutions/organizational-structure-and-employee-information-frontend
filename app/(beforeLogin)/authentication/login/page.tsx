'use client';
import { FC } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import {
  auth,
  googleProvider,
  microsoftProvider,
} from '@/utils/firebaseConfig';
import type { FormProps } from 'antd';
import { Button, Form, Input } from 'antd';
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
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden font-['Manrope'] px-4 py-8"
      style={{
        background:
          'radial-gradient(ellipse at 85% 95%, rgba(255, 210, 180, 0.25) 0%, transparent 45%), radial-gradient(circle at 50% 30%, #fdfdfe 0%, #f0f4fa 55%, #e8edf5 100%)',
        margin: 0,
      }}
    >
      <main
        className="flex flex-col items-center w-full max-w-[400px] z-10"
        data-cy="login-main"
      >
        {/* Platform icon */}
        <div
          className="flex items-center justify-center w-[72px] h-[72px] rounded-2xl bg-[#eef2fb] mb-6"
          data-cy="login-logo-wrapper"
        >
          <div className="scale-[0.65]" data-cy="login-platform-icon">
            <SimpleLogo />
          </div>
        </div>

        {/* Welcome text */}
        <h1
          id="login-title"
          data-cy="login-title"
          className="text-[26px] font-bold text-[#111827] mb-2 text-center tracking-tight"
        >
          Welcome back!
        </h1>
        <p
          className="text-[15px] text-[#6b7280] mb-8 text-center leading-snug"
          data-cy="login-subtitle"
        >
          Sign in to open your Selamnew workspace.
        </p>

        {/* OAuth buttons */}
        <div
          className="flex flex-col gap-3 w-full mb-6"
          data-cy="login-social-buttons"
        >
          <Button
            icon={<Google />}
            className="w-full h-[46px] text-[14px] font-medium bg-white border border-[#e5e7eb] rounded-xl hover:bg-gray-50 flex items-center justify-center gap-3 text-[#374151] shadow-none"
            onClick={handleGoogleSignIn}
            data-cy="login-google-button"
          >
            Continue with Google
          </Button>
          <Button
            icon={<Microsoft />}
            className="w-full h-[46px] text-[14px] font-medium bg-white border border-[#e5e7eb] rounded-xl hover:bg-gray-50 flex items-center justify-center gap-3 text-[#374151] shadow-none"
            onClick={handleMicrosoftSignIn}
            data-cy="login-microsoft-button"
          >
            Continue with Microsoft
          </Button>
        </div>

        {/* Divider */}
        <div className="relative w-full mb-6" data-cy="login-divider-wrapper">
          <div
            className="absolute inset-0 flex items-center"
            data-cy="login-divider-line-wrap"
          >
            <div
              className="w-full border-t border-[#e5e7eb]"
              data-cy="login-divider-line"
            />
          </div>
          <div
            className="relative flex justify-center text-[13px] text-[#9ca3af] px-3"
            data-cy="login-divider-text"
          >
            <span className="bg-[#f0f4fa] px-3" data-cy="login-divider-or-text">
              or
            </span>
          </div>
        </div>

        {/* Email / password form */}
        <div id="div-login-form" data-cy="div-login-form" className="w-full">
          <Form
            id="login-form"
            data-cy="login-form"
            name="login-form"
            layout="vertical"
            onFinish={handleEmailPasswordSignIn}
            autoComplete="off"
            requiredMark={false}
          >
            <Form.Item
              id="login-email"
              data-cy="login-email"
              name="email"
              className="mb-3 [&_.ant-form-item-explain-error]:text-[12px]"
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
                placeholder="email@example.com"
                className="w-full h-[46px] px-4 rounded-xl border-none bg-[#eef2f8] hover:bg-[#e8edf5] focus:bg-[#e8edf5] text-[#374151] text-[14px] placeholder:text-[#9ca3af] shadow-none"
              />
            </Form.Item>

            <Form.Item
              id="login-password"
              data-cy="login-password"
              name="password"
              className="mb-5 [&_.ant-form-item-explain-error]:text-[12px]"
              rules={[
                { required: true, message: 'Please input your password!' },
              ]}
            >
              <Input.Password
                id="login-password-input"
                data-cy="login-password-input"
                placeholder="Password"
                className="w-full h-[46px] px-4 rounded-xl border-none bg-[#eef2f8] hover:bg-[#e8edf5] focus:bg-[#e8edf5] text-[#374151] text-[14px] placeholder:text-[#9ca3af] [&_.ant-input]:bg-transparent [&_.ant-input-affix-wrapper]:bg-[#eef2f8] [&_.ant-input-affix-wrapper]:border-none [&_.ant-input-affix-wrapper]:rounded-xl [&_.ant-input-affix-wrapper]:h-[46px] [&_.ant-input-affix-wrapper:hover]:bg-[#e8edf5] [&_.ant-input-affix-wrapper-focused]:bg-[#e8edf5] [&_.ant-input-affix-wrapper-focused]:shadow-none"
              />
            </Form.Item>

            <Form.Item className="mb-4">
              <Button
                loading={loading || isGet2FACodeLoading}
                className="h-[46px] rounded-xl text-[15px] font-semibold bg-[#1a3278] hover:bg-[#152a66] border-none shadow-none"
                type="primary"
                htmlType="submit"
                block
                data-cy="login-submit-button"
              >
                Log In
              </Button>
            </Form.Item>
          </Form>

          <div
            className="text-center mb-10"
            data-cy="login-forgot-password-row"
          >
            <Link
              href="/authentication/forget-password"
              className="text-[#1a3278] hover:text-[#152a66] text-[14px] font-medium transition-colors"
              data-cy="login-forgot-password-link"
            >
              Forgot Password?
            </Link>
          </div>
        </div>
      </main>

      {/* Help link */}
      <footer className="absolute bottom-6 z-20" data-cy="login-footer">
        <Link
          href="/help"
          className="text-[13px] text-[#9ca3af] hover:text-[#6b7280] transition-colors"
          data-cy="login-help-link"
        >
          Need help?
        </Link>
      </footer>
    </div>
  );
};

export default Login;
