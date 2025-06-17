//2fa page
'use client';
import SimpleLogo from '@/components/common/logo/simpleLogo';
import {
  useGet2FACode,
  useVerify2FACode,
} from '@/store/server/features/authentication/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { Button, Form, Input } from 'antd';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useEffect } from 'react';
import { useHandleSignIn } from '../signinHandler';
import { auth } from '@/utils/firebaseConfig';

const TwoFactorAuth = () => {
  const { mutate: verify2FACode, isLoading: isVerify2FACodeLoading } =
    useVerify2FACode();
  const { mutate: get2FACode, isLoading: isGet2FACodeLoading } =
    useGet2FACode();
    const { handleSignIn } = useHandleSignIn();

  const {
    localId,
    twoFactorAuthEmail,
    countdown,
    decrementCountdown,
    resetCountdown,
    setIs2FA,
    user2FA,
    loading
  } = useAuthenticationStore();

  useEffect(() => {
    resetCountdown();
    const timer = setInterval(() => {
      decrementCountdown();
    }, 1000);
    return () => clearInterval(timer);
  }, [resetCountdown, decrementCountdown]);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const handleSubmit = (value: { otp: string }) => {
    if (value.otp.length === 6) {
      verify2FACode(
        {
          values: {
            uid: localId,
            code: value.otp,
          },
        },
        {
          onSuccess: async () => {
            await handleSignIn(() =>
              signInWithEmailAndPassword(auth, user2FA.email, user2FA.pass),
            );
          },
        },
      );
    }
  };

  const handleResendCode = () => {
    get2FACode(
      {
        values: {
          email: user2FA.email,
          pass: user2FA.pass,
          recaptchaToken: user2FA.recaptchaToken,
        },
      },
      {
        onSuccess: () => {
          setIs2FA(true);
        },
      },
    );
  };

  return (
    <div
      className="h-screen w-full flex flex-col justify-center items-center bg-cover bg-center bg-no-repeat px-4"
      style={{ backgroundImage: 'url(/login-background.png)', margin: 0 }}
    >
      <div className="bg-[#F1F2F3] w-full max-w-md py-4 px-6 rounded-lg my-5">
        <p className="flex justify-center font-semibold">
          <SimpleLogo />
        </p>
        <h5 className="text-center my-2">Two-Step Authentication</h5>
        <p className="text-center text-xs mb-6">
          To continue, please enter the 6-digit verification code sent to your
          email address {twoFactorAuthEmail.replace(/(?<=.{3}).(?=.*@)/g, '*')}
        </p>
        <Form
          name="login-form"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          initialValues={{ remember: true }}
          onFinish={handleSubmit}
        >
          <Form.Item
            name="otp"
            rules={[
              {
                required: true,
                message: 'Please input your otp!',
              },
            ]}
            className="flex justify-center"
          >
            <Input.OTP length={6} size="large" autoFocus />
          </Form.Item>
          {/* 5 minutes countdown */}
          <p className="text-center text-xs mb-6">
            {countdown > 0 ? (
              <span className="font-bold text-sm">{formatted}</span>
            ) : (
              'Code expired'
            )}
          </p>
          <Form.Item>
            <Button
              loading={isVerify2FACodeLoading || loading}
              className="py-5 my-4"
              type="primary"
              htmlType="submit"
              block
            >
              Continue
            </Button>
          </Form.Item>
        </Form>
        <p className="text-center text-xs mb-6">
          Didn&apos;t receive the code?
          <Button
            type="link"
            className="text-blue cursor-pointer"
            onClick={handleResendCode}
            loading={isGet2FACodeLoading}
          >
            {' '}
            Resend Code
          </Button>
        </p>
      </div>
      {/* resend otp */}

      <div className="text-xs font-thin text-center">
        © {new Date().getFullYear().toString()} Selamnew Workspace . All-rights
        reserved.
        {/* <span className="font-semibold ml-1 cursor-pointer">
        Terms & Conditions
      </span>
      <span className="font-semibold ml-1 cursor-pointer">
        Privacy Settings
      </span> */}
      </div>
    </div>
  );
};

export default TwoFactorAuth;
