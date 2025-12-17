import { Steps } from 'antd';
import React from 'react';
import { IoCheckmarkSharp } from 'react-icons/io5';
const { Step } = Steps;
type Props = {
  numberOfSteps: number;
  setCurrent: (current: number) => void;
  current: number;
};
const Stepper: React.FC<Props> = ({ numberOfSteps, setCurrent, current }) => {
  const onChange = (value: number) => {
    setCurrent(value);
  };

  const customDot = (step: number) => (
    <div
      className={`border-2 rounded-full h-8 w-8 flex items-center justify-center ${current >= step ? 'bg-indigo-700 text-white' : 'bg-white border-gray-300 text-gray-500'}`}
      data-cy="stepper-dot"
    >
      <div
        style={{ fontSize: '24px', lineHeight: '24px' }}
        data-cy="stepper-dot-content"
      >
        {current >= step ? (
          <IoCheckmarkSharp className="text-xs font-bold" />
        ) : (
          '•'
        )}
      </div>
    </div>
  );
  return (
    <div data-cy="stepper-container">
      <Steps
        current={current}
        size="default"
        onChange={onChange}
        className="my-6 sm:my-10"
      >
        {/* eslint-disable @typescript-eslint/naming-convention  */}
        {Array.from({ length: numberOfSteps }, (__, index) => (
          <Step key={index} icon={customDot(index)} />
        ))}
      </Steps>
    </div>
  );
};

export default Stepper;
