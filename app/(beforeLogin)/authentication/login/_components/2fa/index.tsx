//2fa page
'use client';
import SimpleLogo from '@/components/common/logo/simpleLogo';
import {
  useGet2FACode,
  useVerify2FACode,
} from '@/store/server/features/authentication/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { Button, Form, Input, message } from 'antd';
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
    twoFactorAuthEmail,
    countdown,
    decrementCountdown,
    resetCountdown,
    setIs2FA,
    loading,
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

  const maskedEmail = (twoFactorAuthEmail || '').replace(
    /(^.{0,3})(.*?)(@.*$)/,
    (fullMatch: string, start: string, mid: string, domain: string) => {
      void fullMatch;
      return `${start}${mid.replace(/./g, '*')}${domain}`;
    },
  );

  const handleSubmit = (value: { otp: string }) => {
    const otp = String(value?.otp ?? '').trim();
    if (otp.length !== 6) {
      message.error('Please enter the 6-digit verification code.');
      return;
    }

    // Read latest credentials from the store to avoid stale closures.
    const { localId, user2FA } = useAuthenticationStore.getState();
    const email = user2FA?.email?.toLowerCase()?.trim();
    const password = user2FA?.pass;

    if (!localId) {
      message.error(
        'Verification session expired. Please sign in again from the login page.',
      );
      setIs2FA(false);
      return;
    }

    if (!email || !password) {
      message.error(
        'Login credentials are missing. Please sign in again from the login page.',
      );
      setIs2FA(false);
      return;
    }

    verify2FACode(
      {
        values: {
          uid: localId,
          code: otp,
        },
      },
      {
        onSuccess: async () => {
          await handleSignIn(() =>
            signInWithEmailAndPassword(auth, email, password),
          );
        },
      },
    );
  };

  const handleResendCode = () => {
    const { user2FA } = useAuthenticationStore.getState();
    const email = user2FA?.email?.toLowerCase()?.trim();
    const password = user2FA?.pass;

    if (!email || !password) {
      message.error(
        'Login credentials are missing. Please sign in again from the login page.',
      );
      setIs2FA(false);
      return;
    }

    get2FACode(
      {
        values: {
          email,
          pass: password,
        },
      },
      {
        onSuccess: () => {
          resetCountdown();
          setIs2FA(true);
        },
      },
    );
  };

  return (
    <div
      className="h-screen w-full flex flex-col justify-center items-center bg-cover bg-center bg-no-repeat px-4"
      style={{ backgroundImage: 'url(/login-background.png)', margin: 0 }}
      data-cy="authentication-2fa-container"
    >
      <div
        className="bg-[#F1F2F3] w-full max-w-md py-4 px-6 rounded-lg my-5"
        data-cy="authentication-2fa-form-container"
      >
        <p
          className="flex justify-center font-semibold"
          data-cy="authentication-2fa-logo"
        >
          <SimpleLogo />
        </p>
        <h5 className="text-center my-2" data-cy="authentication-2fa-title">
          Two-Step Authentication
        </h5>
        <p
          className="text-center text-xs mb-6"
          data-cy="authentication-2fa-description"
        >
          To continue, please enter the 6-digit verification code sent to your
          email address {maskedEmail || 'your email'}
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
              {
                len: 6,
                message: 'Please enter the 6-digit code.',
              },
            ]}
            className="flex justify-center"
          >
            <Input.OTP length={6} size="large" autoFocus />
          </Form.Item>
          {/* 5 minutes countdown */}
          <p className="text-center text-xs mb-6" data-cy="2fa-countdown">
            {countdown > 0 ? (
              <span className="font-bold text-sm" data-cy="2fa-countdown-time">
                {formatted}
              </span>
            ) : (
              <span data-cy="2fa-countdown-expired">Code expired</span>
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
        <p className="text-center text-xs mb-6" data-cy="2fa-resend-container">
          <span data-cy="2fa-resend-text">Didn&apos;t receive the code?</span>
          <Button
            type="link"
            className="text-blue cursor-pointer"
            onClick={handleResendCode}
            loading={isGet2FACodeLoading}
            data-cy="2fa-resend-button"
          >
            {' '}
            Resend Code
          </Button>
        </p>
      </div>

      <div className="text-xs font-thin text-center" data-cy="2fa-footer">
        <span data-cy="2fa-copyright">
          © {new Date().getFullYear().toString()} Selamnew Workspace .
          All-rights reserved.
        </span>
      </div>
    </div>
  );
};

export default TwoFactorAuth;
