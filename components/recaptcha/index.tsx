'use client';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { RECAPTCHA_SITE_KEY } from '@/utils/constants';
export default function RecaptchaProvider({ children }: { children: React.ReactNode }) {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY || ''}>
      {children}
    </GoogleReCaptchaProvider>
  );
}