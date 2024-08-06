import { useEmployeeManagmentStore } from '@/store/uistate/features/employees/employeeManagment';
import { Button, Form } from 'antd';
import React from 'react';

const ButtonContinue = () => {
  const { setCurrent, current, setOpen } = useEmployeeManagmentStore();

  return (
    <div>
      <Form.Item className="font-semibold text-xs">
        <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-6 sm:mt-8">
          {current !== 0 ? (
            <Button
              name="cancelUserSidebarButton"
              id="cancelSidebarButtonId"
              className="px-6 py-3 text-xs font-bold"
              onClick={() => setCurrent(current - 1)}
            >
              Back
            </Button>
          ) : (
            <Button
              name="cancelUserSidebarButton"
              id="cancelSidebarButtonId"
              className="px-6 py-3 text-xs font-bold"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          )}
          {current !== 2 ? (
            <Button
              onClick={() => setCurrent(current + 1)}
              id="sidebarActionCreate"
              className="px-6 py-3 text-xs font-bold"
              htmlType="button"
              type="primary"
            >
              save and continue
            </Button>
          ) : (
            <Button
              id="sidebarActionCreate"
              className="px-6 py-3 text-xs font-bold"
              htmlType="submit"
              type="primary"
            >
              submit
            </Button>
          )}
        </div>
      </Form.Item>
    </div>
  );
};

export default ButtonContinue;
