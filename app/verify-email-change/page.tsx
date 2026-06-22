'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Result, Spin } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import Logo from '@/components/common/logo';
import { verifyEmailChange } from '@/store/server/features/employees/employeeManagment/mutations';
import { clearAuthState } from '@/utils/clearAuthState';

type VerifyState = 'loading' | 'success' | 'error';

const resolveRedirectPath = (continueUrl: string | null) => {
  if (!continueUrl) return '/authentication/login';

  try {
    const url = new URL(continueUrl, window.location.origin);
    if (url.origin !== window.location.origin) {
      return '/authentication/login';
    }
    return `${url.pathname}${url.search}${url.hash}` || '/authentication/login';
  } catch {
    return '/authentication/login';
  }
};

const mapVerifyEmailError = (error: any) => {
  const message =
    error?.response?.data?.message || error?.message || 'Verification failed';
  const lower = String(message).toLowerCase();

  if (
    lower.includes('already') ||
    lower.includes('in use') ||
    lower.includes('registered')
  ) {
    return {
      title: 'Email already in use',
      description: 'This email is already registered.',
    };
  }

  if (
    lower.includes('expired') ||
    lower.includes('invalid') ||
    lower.includes('token')
  ) {
    return {
      title: 'Invalid or expired link',
      description:
        'This link is invalid or has expired. Request a new email change from your profile.',
    };
  }

  return {
    title: 'Verification failed',
    description: message,
  };
};

const VerifyEmailChangeContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const continueUrl = searchParams.get('continueUrl');

  const [state, setState] = useState<VerifyState>('loading');
  const [newEmail, setNewEmail] = useState<string>('');
  const [errorContent, setErrorContent] = useState({
    title: 'Verification failed',
    description: 'We could not verify your email change.',
  });

  const redirectPath = useMemo(
    () => resolveRedirectPath(continueUrl),
    [continueUrl],
  );
  const verifyRequestRef = useRef<{
    token: string;
    promise: ReturnType<typeof verifyEmailChange>;
  } | null>(null);

  useEffect(() => {
    if (!token) {
      setErrorContent({
        title: 'Invalid or expired link',
        description:
          'This link is invalid or has expired. Request a new email change from your profile.',
      });
      setState('error');
      return;
    }

    let cancelled = false;

    const verify = async () => {
      if (
        !verifyRequestRef.current ||
        verifyRequestRef.current.token !== token
      ) {
        verifyRequestRef.current = {
          token,
          promise: verifyEmailChange({
            token,
            continueUrl: continueUrl ?? undefined,
          }),
        };
      }

      try {
        const response = await verifyRequestRef.current.promise;

        if (cancelled) return;

        clearAuthState();
        setNewEmail(response?.newEmail ?? '');
        setState('success');
      } catch (error: any) {
        if (cancelled) return;
        setErrorContent(mapVerifyEmailError(error));
        setState('error');
      }
    };

    verify();

    return () => {
      cancelled = true;
    };
  }, [token, continueUrl]);

  const handleGoToLogin = () => {
    router.push(redirectPath);
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-center items-center bg-cover bg-center bg-no-repeat px-4 py-10"
      style={{ backgroundImage: 'url(/login-background.png)' }}
      data-cy="verify-email-change-page"
    >
      <div data-cy="verify-email-change-page-content" className="w-full max-w-lg">
        <div data-cy="verify-email-change-page-logo" className="flex justify-center mb-8">
          <Logo type="selamnew" />
        </div>

        <div data-cy="verify-email-change-page-result" className="rounded-2xl bg-white px-6 py-8 shadow-sm">
          {state === 'loading' && (
            <div
              className="flex flex-col items-center justify-center py-10"
              data-cy="verify-email-change-loading"
            >
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />}
              />
              <p data-cy="verify-email-change-page-loading-text" className="mt-4 text-sm text-gray-600">
                Verifying your email change...
              </p>
            </div>
          )}

          {state === 'success' && (
            <Result
              icon={<CheckCircleOutlined className="text-[#1677ff]" />}
              title="Email updated successfully"
              subTitle={
                newEmail
                  ? `Your email has been updated to ${newEmail}. Please sign in with your new email.`
                  : 'Your email has been updated. Please sign in with your new email.'
              }
              extra={
                <Button type="primary" onClick={handleGoToLogin}>
                  Go to login
                </Button>
              }
              data-cy="verify-email-change-success"
            />
          )}

          {state === 'error' && (
            <Result
              icon={<CloseCircleOutlined className="text-red-500" />}
              title={errorContent.title}
              subTitle={errorContent.description}
              extra={[
                <Button key="login" type="primary" onClick={handleGoToLogin}>
                  Go to login
                </Button>,
              ]}
              data-cy="verify-email-change-error"
            />
          )}
        </div>
      </div>
    </div>
  );
};

const VerifyEmailChangePage = () => (
  <Suspense
    fallback={
      <div data-cy="verify-email-change-page-loading" className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    }
  >
    <VerifyEmailChangeContent />
  </Suspense>
);

export default VerifyEmailChangePage;
