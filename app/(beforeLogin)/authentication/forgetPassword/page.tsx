'use client';
import { FC, useState } from 'react';
import RequestVerification from './_components/requestVerification';
import OtpVerification from './_components/otpVerification';
import NewPassword from './_components/newPassword';

const ForgetPasswordPage: FC = () => {
  const [step, setStep] = useState(1);

  const nextStep = () => {
    setStep((prev) => prev + 1);
  };

  return (
    <div
      className="h-screen w-full flex flex-col justify-center items-center bg-cover bg-center bg-no-repeat px-4"
      style={{ backgroundImage: 'url(/login-background.png)', margin: 0 }}
    >
      {step === 1 && <RequestVerification onNext={nextStep} />}
      {step === 2 && <OtpVerification onNext={nextStep} />}
      {step === 3 && <NewPassword />}
    </div>
  );
};

export default ForgetPasswordPage;
