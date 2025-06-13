'use client';
import { FC } from 'react';
import { signInWithPopup } from 'firebase/auth';
import {
  auth,
  googleProvider,
  microsoftProvider,
} from '@/utils/firebaseConfig';
import type { FormProps } from 'antd';
import { Button, Checkbox, Form, Input, message } from 'antd';
import { Microsoft } from '@/components/Icons/microsoft';
import { Google } from '@/components/Icons/google';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useHandleSignIn } from './_components/signinHandler';
import Link from 'next/link';
import TwoFactorAuth from './_components/2fa';
import SimpleLogo from '@/components/common/logo/simpleLogo';
import { useGet2FACode } from '@/store/server/features/authentication/mutation';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

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
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleEmailPasswordSignIn: FormProps<FieldType>['onFinish'] = async (
    values,
  ) => {
    if (!executeRecaptcha) {
      message.error('reCAPTCHA not yet available');
      return;
    }
    const recaptchaToken = await executeRecaptcha('login');
    if (!recaptchaToken) {
      message.error('reCAPTCHA verification failed. Please try again.');
      return;
    }
    get2FACode(
      {
        values: {
          email: values.email,
          pass: values.password,
          recaptchaToken,
        },
      },
      {
        onSuccess: (data) => {
          setUser2FA({
            email: values.email,
            pass: values.password,
            recaptchaToken,
          });
          setLocalId(data?.uid);
          setIs2FA(true);
        },
      },
    );
  };

  const handleGoogleSignIn = async () => {
    await handleSignIn(() => signInWithPopup(auth, googleProvider));
  };

  const handleMicrosoftSignIn = async () => {
    await handleSignIn(() => signInWithPopup(auth, microsoftProvider));
  };

  return is2FA ? (
    <TwoFactorAuth />
  ) : (
    <div
      className="h-screen w-full flex flex-col justify-center items-center bg-cover bg-center bg-no-repeat px-4"
      style={{ backgroundImage: 'url(/login-background.png)', margin: 0 }}
    >
      <div className="bg-[#F1F2F3] w-full max-w-md py-4 px-6 rounded-lg my-5">
        <p className="flex justify-center font-semibold">
          <SimpleLogo />
        </p>
        <h5 className="text-center my-2">Login</h5>
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
              placeholder="Type your email"
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
              placeholder="Type your password"
              className="w-full h-10"
              allowClear
            />
          </Form.Item>

          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox className="m-1">Remember me</Checkbox>
            </Form.Item>
            <Link
              href="/authentication/forget-password"
              className="float-right m-0 p-0"
            >
              Forgot password
            </Link>
          </Form.Item>

          <Form.Item>
            <Button
              loading={loading || isGet2FACodeLoading}
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
      </div>
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

export default Login;
