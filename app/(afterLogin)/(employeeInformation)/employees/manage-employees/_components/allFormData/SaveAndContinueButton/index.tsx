import { useEmployeeManagmentStore } from '@/store/uistate/features/employees/employeeManagment';
import { Button, Form } from 'antd';
import React from 'react';
interface Props {
  isLoading?: boolean;
}
const ButtonContinue: React.FC<Props> = ({ isLoading }) => {
  const { setCurrent, current, setOpen } = useEmployeeManagmentStore();

  const handleBackClick = () => {
    if (current !== 0) {
      setCurrent(current - 1);
    } else {
      setOpen(false);
    }
  };

  const handleContinueClick = () => {
    if (current !== 2) {
      setCurrent(current + 1);
    }
  };

  const isFinalStep = current === 2;

  return (
    <Form.Item className="font-semibold text-xs">
      <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-6 sm:mt-8">
        <Button
          name={
            current !== 0 ? 'cancelUserSidebarButton' : 'cancelSidebarButtonId'
          }
          id={current !== 0 ? 'BackSidebarButtonId' : 'cancelSidebarButtonId'}
          className="px-6 py-3 text-xs font-bold"
          onClick={handleBackClick}
        >
          {current !== 0 ? 'Back' : 'Cancel'}
        </Button>
        <Button
          loading={isLoading}
          onClick={handleContinueClick}
          id={
            isFinalStep
              ? `sidebarActionCreateSubmit${current}`
              : `sidebarActionSubmitAndContinue${current}`
          }
          className="px-6 py-3 text-xs font-bold"
          htmlType={isFinalStep ? 'submit' : 'button'}
          type="primary"
        >
          {isFinalStep ? 'Submit' : 'Save and Continue'}
        </Button>
      </div>
    </Form.Item>
  );
};

export default ButtonContinue;
