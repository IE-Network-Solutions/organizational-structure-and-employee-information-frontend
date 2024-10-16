'use client';
import { FC, useState } from 'react';
import Logo from '../../../../../components/common/logo';
import { Input } from 'antd';

const OtpVerification: FC<{ onNext: () => void }> = ({ onNext }) => {
  const [code, setCode] = useState(['', '', '', '', '']);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const value = e.target.value;

    if (/^[0-9]*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value.slice(0, 1); // Only allow a single digit
      setCode(newCode);

      // Move focus to the next input
      if (value && index < code.length - 1) {
        (
          document.getElementById(`code-input-${index + 1}`) as HTMLInputElement
        ).focus();
      }
    }
  };

  const handleBackspace = (index: number) => {
    if (index > 0 && code[index] === '') {
      (
        document.getElementById(`code-input-${index - 1}`) as HTMLInputElement
      ).focus();
    }
  };

  const handleSubmit = () => {
    // const verificationCode = code.join('');
    onNext();
  };
  return (
    <div className="flex justify-center items-center w-[80%] md:w-[35%]">
      <div className="flex flex-col items-center gap-8 w-[80%]">
        {/* Icon and Text */}
        <div className="flex flex-row items-center gap-8">
          <Logo type="selamnew" />
        </div>

        {/* Reset Password Text */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-semibold">Reset Password</h2>
          <p className="text-center text-sm">Recover your account password</p>
        </div>

        <div className="flex gap-2 mb-4">
          {code.map((digit, index) => (
            <div
              key={index}
              className="w-12 h-12 flex justify-center items-center border rounded-full border-gray-300"
            >
              <Input
                className="w-[100%] h-[100%] text-center rounded-2xl"
                id={`code-input-${index}`}
                maxLength={1}
                value={digit ? '*' : ''} // Show * if there's a digit
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace') handleBackspace(index);
                }}
              />
            </div>
          ))}
        </div>

        <div className="w-full">
          <button
            className="w-full py-4 px-4 flex justify-center items-center rounded-[24px] bg-[#F2F2F7] text-black font-semibold"
            type="button"
            onClick={handleSubmit}
          >
            Next
          </button>
        </div>

        {/* Resend Link */}
        <div>
          <button
            className="flex justify-items-center items-center m-0 p-0 text-[#4864E1] font-poppins text-[16px] font-medium leading-[24px] tracking-[0.08px]"
            type="button"
          >
            Resend
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
