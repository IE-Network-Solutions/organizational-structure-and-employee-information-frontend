'use client';
import { FC, useEffect, useState } from 'react';
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
// Images from local _assets (bundled by Next.js)
import imgGroup2 from './_assets/Group2.png';
import imgGroup3 from './_assets/Group3.png';
import img14 from './_assets/image14.png';
import img15 from './_assets/image15.png';
import img16 from './_assets/image16.png';

type FieldType = {
  email: string;
  password: string;
  remember?: string;
};

// Use imported assets from _assets folder (Next.js resolves these at build time)
const IMG = {
  backgroundLeft: imgGroup2.src,
  backgroundRight: imgGroup3.src,
  card1: img14.src,
  card2: img15.src,
  card3: img16.src,
} as const;

const Login: FC = () => {
  const { loading, is2FA, setIs2FA, setLocalId, setUser2FA } =
    useAuthenticationStore();
  const { mutate: get2FACode, isLoading: isGet2FACodeLoading } =
    useGet2FACode();
  const { handleSignIn } = useHandleSignIn();

  const [positionCycle, setPositionCycle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPositionCycle((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  // Adjusted position definitions for rotation
  const pos1 = {
    transform: 'translate(0, 0) rotate(-4deg) scale(0.85)',
    zIndex: 10,
    opacity: 0.7,
    top: '5%',
    left: '0%',
  };
  const pos2 = {
    transform: 'translate(60px, -15px) rotate(5deg) scale(0.9)',
    zIndex: 20,
    opacity: 0.85,
    top: '2%',
    left: '12%',
  };
  const pos3 = {
    transform: 'translate(30px, 80px) rotate(-6deg) scale(1)',
    zIndex: 30,
    opacity: 1,
    top: '12%',
    left: '5%',
  };

  return is2FA ? (
    <TwoFactorAuth />
  ) : (
    <div
      id="login-background"
      data-cy="login-background"
      className="h-screen w-full flex flex-col relative overflow-hidden font-['Manrope']"
      style={{
        background:
          'radial-gradient(circle at 70% 50%, #fdfdfe 0%, #f7f9fc 40%, #eff3f9 100%)',
        margin: 0,
      }}
    >
      {/* Background decorative shapes - absolute paths from public */}
      <img
        src={IMG.backgroundLeft}
        alt=""
        className="absolute left-0 bottom-0 w-[400px] h-[400px] object-contain object-left-bottom pointer-events-none z-0 opacity-40 mix-blend-multiply"
        aria-hidden
        style={{ maxWidth: '30vw', maxHeight: '30vh' }}
        data-cy="login-bg-left"
      />
      <img
        src={IMG.backgroundRight}
        alt=""
        className="absolute right-0 bottom-0 w-[500px] h-[500px] object-contain object-right-bottom pointer-events-none z-0 opacity-40 mix-blend-multiply"
        aria-hidden
        style={{ maxWidth: '35vw', maxHeight: '35vh' }}
        data-cy="login-bg-right"
      />

      {/* Animation Styles */}
      <style data-cy="login-animation-styles">{`
        .image-transition {
          transition: all 2.5s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform, top, left, opacity, z-index;
        }
      `}</style>

      {/* Main Content Container - Centered Row */}
      <main
        className="flex-1 flex items-center justify-center p-4 lg:p-0 z-10 w-full h-full relative"
        data-cy="login-main"
      >
        {/* Adjusted grid layout to bring sections closer */}
        <div
          className="grid lg:grid-cols-[1fr,400px] gap-4 lg:gap-8 w-full max-w-[1200px] items-start relative px-4 lg:px-6"
          data-cy="login-grid"
        >
          {/* Left Section - Branding and Animated Images */}
          <div
            className="hidden lg:flex flex-col h-full pt-4 pl-4"
            data-cy="login-left-section"
          >
            {/* Logo Branding - Top Aligned with Login Card */}
            <div
              className="flex items-center gap-2 mb-6"
              style={{ transform: 'translateY(10px)' }}
              data-cy="login-logo-row"
            >
              <div
                className="scale-[0.8] origin-left"
                data-cy="login-logo-wrapper"
              >
                <SimpleLogo />
              </div>
              <div
                className="flex flex-col leading-none"
                data-cy="login-brand-labels"
              >
                <span
                  className="text-[20px] font-extrabold text-[#3636F0]"
                  data-cy="login-brand-name"
                >
                  SelamNew
                </span>
                <span
                  className="text-[16px] text-[#3636F0] font-medium opacity-80 font-['Manrope']"
                  data-cy="login-brand-workspace"
                >
                  Workspace
                </span>
              </div>
            </div>

            {/* Tagline - Reduced size */}
            <div className="mb-8 max-w-[450px]" data-cy="login-tagline-wrapper">
              <h1
                className="text-[24px] lg:text-[26px] font-extrabold text-[#1a1a1a] leading-[1.3] tracking-tight"
                data-cy="login-tagline"
              >
                The operating system for your Business growth.
              </h1>
            </div>

            {/* Image Rotation Container */}
            <div
              className="relative flex-1 mt-2"
              style={{ minHeight: '380px' }}
              data-cy="login-images-container"
            >
              <div
                className="absolute image-transition"
                style={
                  positionCycle === 0 ? pos1 : positionCycle === 1 ? pos2 : pos3
                }
                data-cy="login-card1-wrapper"
              >
                <img
                  src={IMG.card1}
                  alt="UI 1"
                  className="w-[340px] h-auto pointer-events-none"
                  data-cy="login-card1"
                />
              </div>
              <div
                className="absolute image-transition"
                style={
                  positionCycle === 0 ? pos2 : positionCycle === 1 ? pos3 : pos1
                }
                data-cy="login-card2-wrapper"
              >
                <img
                  src={IMG.card2}
                  alt="UI 2"
                  className="w-[340px] h-auto pointer-events-none"
                  data-cy="login-card2"
                />
              </div>
              <div
                className="absolute image-transition"
                style={
                  positionCycle === 0 ? pos3 : positionCycle === 1 ? pos1 : pos2
                }
                data-cy="login-card3-wrapper"
              >
                <img
                  src={IMG.card3}
                  alt="UI 3"
                  className="w-[340px] h-auto pointer-events-none"
                  data-cy="login-card3"
                />
              </div>
            </div>
          </div>

          {/* Right Section - Login Card */}
          <div
            className="flex flex-col items-center lg:items-start w-full"
            data-cy="login-right-section"
          >
            <div
              id="div-login-form"
              data-cy="div-login-form"
              className="bg-white w-full max-w-[400px] py-10 px-8 rounded-2xl shadow-xl"
            >
              <h2
                id="login-title"
                data-cy="login-title"
                className="text-center text-[22px] font-bold text-[#1f2937] mb-8"
              >
                Login
              </h2>

              <Form
                id="login-form"
                data-cy="login-form"
                name="login-form"
                layout="vertical"
                initialValues={{ remember: true }}
                onFinish={handleEmailPasswordSignIn}
                autoComplete="off"
                requiredMark={false}
              >
                <Form.Item
                  id="login-email"
                  data-cy="login-email"
                  label={
                    <span
                      className="text-gray-700 text-[13px] font-semibold"
                      data-cy="login-email-label"
                    >
                      Email
                    </span>
                  }
                  name="email"
                  className="mb-5"
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
                    className="w-full h-[42px] px-3 rounded-lg border-gray-200 hover:border-blue-500 focus:border-blue-500 bg-white text-gray-800 text-[14px]"
                    allowClear
                  />
                </Form.Item>

                <Form.Item
                  id="login-password"
                  data-cy="login-password"
                  label={
                    <span
                      className="text-gray-700 text-[13px] font-semibold"
                      data-cy="login-password-label"
                    >
                      Password
                    </span>
                  }
                  name="password"
                  className="mb-1"
                  rules={[
                    { required: true, message: 'Please input your password!' },
                  ]}
                >
                  <Input.Password
                    id="login-password-input"
                    data-cy="login-password-input"
                    placeholder="Password"
                    className="w-full h-[42px] px-3 rounded-lg border-gray-200 hover:border-blue-500 focus:border-blue-500 bg-white text-gray-800 text-[14px]"
                    allowClear
                  />
                </Form.Item>

                <div
                  className="flex justify-between items-center mb-6 mt-2"
                  data-cy="login-remember-forgot-row"
                >
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox
                      className="text-gray-600 text-[13px]"
                      data-cy="login-remember-checkbox"
                    >
                      Remember me
                    </Checkbox>
                  </Form.Item>
                  <Link
                    href="/authentication/forget-password"
                    className="text-[#3636F0] hover:text-blue-700 text-[13px] font-medium transition-colors"
                    data-cy="login-forgot-password-link"
                  >
                    Forgot password
                  </Link>
                </div>

                <Form.Item className="mb-6">
                  <Button
                    loading={loading || isGet2FACodeLoading}
                    className="h-10 rounded-lg text-[14px] font-semibold bg-[#1d4ed8] hover:bg-[#1e40af] border-none shadow-sm"
                    type="primary"
                    htmlType="submit"
                    block
                  >
                    Sign In
                  </Button>
                </Form.Item>
              </Form>

              <div className="relative mb-6" data-cy="login-divider-wrapper">
                <div
                  className="absolute inset-0 flex items-center"
                  data-cy="login-divider-line-wrap"
                >
                  <div
                    className="w-full border-t border-gray-200"
                    data-cy="login-divider-line"
                  ></div>
                </div>
                <div
                  className="relative flex justify-center text-[12px] text-gray-500 bg-white px-2"
                  data-cy="login-divider-text"
                >
                  Or Continue With
                </div>
              </div>

              <div
                className="flex flex-row gap-3"
                data-cy="login-social-buttons"
              >
                <Button
                  icon={<Google />}
                  className="flex-1 h-10 text-[13px] font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-700 shadow-sm"
                  onClick={handleGoogleSignIn}
                >
                  Google
                </Button>
                <Button
                  icon={<Microsoft />}
                  className="flex-1 h-10 text-[13px] font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-700 shadow-sm"
                  onClick={handleMicrosoftSignIn}
                >
                  Microsoft
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="w-full pb-6 z-20 absolute bottom-0"
        data-cy="login-footer"
      >
        <div
          className="text-center text-[12px] text-gray-500 font-normal"
          data-cy="login-footer-inner"
        >
          <p className="mb-2" data-cy="login-footer-copyright">
            © {new Date().getFullYear()} Selamnew. All rights reserved.
          </p>
          <div
            className="flex justify-center gap-6"
            data-cy="login-footer-links"
          >
            <Link
              href="/terms"
              className="hover:text-[#3636F0] transition-colors font-medium"
              data-cy="login-footer-terms"
            >
              Terms and conditions
            </Link>
            <Link
              href="/privacy"
              className="hover:text-[#3636F0] transition-colors font-medium"
              data-cy="login-footer-privacy"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
