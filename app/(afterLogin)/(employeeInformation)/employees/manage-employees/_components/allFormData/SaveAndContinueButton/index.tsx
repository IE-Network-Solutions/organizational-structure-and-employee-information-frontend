import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { Button, Form, Popconfirm } from 'antd';
import React from 'react';

interface Props {
  isLoading?: boolean;
  form: any; // Add form prop to access the form instance
}

const ButtonContinue: React.FC<Props> = ({ isLoading, form }) => {
  const { setCurrent, current, setOpen } = useEmployeeManagementStore();

  const handleBackClick = () => {
    if (current !== 0) {
      setCurrent(current - 1);
    } else {
      form.resetFields();
      setCurrent(0);
      setOpen(false);
    }
  };

  const handleContinueClick = () => {
    if (current !== 2) {
      setCurrent(current + 1);
    } else {
      form.submit(); // Submit the form on the last step
    }
  };

  return (
    <Form.Item className="font-semibold text-xs">
      <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-6 sm:mt-8">
        {current !== 0 ? (
          <Button
            name="cancelUserSidebarButton"
            id="cancelSidebarButtonId"
            className="px-6 py-3 text-xs font-bold"
            onClick={handleBackClick}
          >
            Back
          </Button>
        ) : (
          <Popconfirm
            title="reset all you field"
            description="Are you sure to reset all fields value ?"
            onConfirm={handleBackClick}
            okText="Yes"
            cancelText="No"
          >
            <Button name="cancelSidebarButtonId" danger>
              Cancel
            </Button>
          </Popconfirm>
        )}

        <Button
          loading={isLoading}
          onClick={handleContinueClick}
          id={
            current === 2
              ? `sidebarActionCreateSubmit${current}`
              : `sidebarActionSubmitAndContinue${current}`
          }
          className="px-6 py-3 text-xs font-bold"
          htmlType="button"
          type="primary"
        >
          {current === 2 ? 'Submit' : 'Save and Continue'}
        </Button>
      </div>
    </Form.Item>
  );
};

export default ButtonContinue;
