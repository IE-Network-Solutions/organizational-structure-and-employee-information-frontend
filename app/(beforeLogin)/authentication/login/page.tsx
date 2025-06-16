'use client';
import { FC, useState, useEffect } from 'react';
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
import { DownloadOutlined } from '@ant-design/icons';

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
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installable, setInstallable] = useState(false);
  const [swRegistered, setSwRegistered] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    // Log initial PWA detection
    console.log('🔍 PWA Detection Started');
    
    const handler = (e: any) => {
      e.preventDefault();
      console.log('✅ beforeinstallprompt fired!', e);
      setDeferredPrompt(e);
      setInstallable(true);
      setDebugInfo('Install prompt available!');
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    // Check for app already installed
    window.addEventListener('appinstalled', () => {
      console.log('✅ App was installed');
      setInstallable(false);
      setDeferredPrompt(null);
      setDebugInfo('App installed successfully!');
    });
    
    // Force service worker registration immediately
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('✅ SW registered successfully:', registration);
          setSwRegistered(true);
          setDebugInfo('Service worker registered');
          
          // Force check PWA criteria after registration
          setTimeout(() => {
            checkPWACriteria();
          }, 3000);
        })
        .catch((error) => {
          console.log('❌ SW registration failed:', error);
          setDebugInfo(`SW failed: ${error.message}`);
        });
    } else {
      setDebugInfo('Service workers not supported');
    }
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const checkPWACriteria = () => {
    const criteria = {
      hasServiceWorker: 'serviceWorker' in navigator,
      isSecure: location.protocol === 'https:' || location.hostname === 'localhost',
      hasManifest: document.querySelector('link[rel="manifest"]') !== null,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      hasInstallPrompt: !!deferredPrompt
    };
    
    console.log('🔍 PWA Criteria Check:', criteria);
    
    const issues = [];
    if (!criteria.isSecure) issues.push('Not HTTPS/localhost');
    if (!criteria.hasServiceWorker) issues.push('No Service Worker');
    if (!criteria.hasManifest) issues.push('No Manifest');
    if (criteria.isStandalone) issues.push('Already installed');
    
    if (issues.length > 0) {
      setDebugInfo(`Issues: ${issues.join(', ')}`);
    } else if (!criteria.hasInstallPrompt) {
      setDebugInfo('Waiting for install prompt...');
    }
  };

  const handleInstall = async () => {
    // First try the deferred prompt
    if (deferredPrompt) {
      const result = await deferredPrompt.prompt();
      console.log('Install result:', result);
      setDeferredPrompt(null);
      setInstallable(false);
      return;
    }
    
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      alert('✅ App is already installed!');
      return;
    }
    
    // Browser-specific instructions with exact locations
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome')) {
      const msg = `🔍 LOOK FOR THE INSTALL ICON IN YOUR ADDRESS BAR:
      
1. 📍 Check the RIGHT SIDE of your address bar for a download/install icon (⬇️)
2. 📍 Check the LEFT SIDE near the lock icon for an install icon
3. 📍 Right-click anywhere on this page → "Install Selamnew Workspace"
4. 📍 Chrome Menu (⋮) → "Install Selamnew Workspace"

⚠️ If you don't see it, wait 30 seconds and check again.`;
      alert(msg);
    } else {
      alert('🚨 Use Google Chrome browser for best PWA install experience!\n\nChrome has the most reliable PWA installation.');
    }
  };

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
        
        {/* INSTALL APP BUTTON */}
        <div className="mt-4">
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleInstall}
            block
            className={installable ? "bg-green-600 hover:bg-green-700 border-green-600" : "bg-blue-600 hover:bg-blue-700 border-blue-600"}
          >
            {installable ? '🎉 Install App Now!' : '📱 Install App'}
          </Button>
          {debugInfo && (
            <div className="mt-2 text-xs text-gray-600 text-center">
              Status: {debugInfo}
            </div>
          )}
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
