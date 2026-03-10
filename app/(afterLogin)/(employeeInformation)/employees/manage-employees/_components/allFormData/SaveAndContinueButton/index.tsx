import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { Button, Form, Popconfirm } from 'antd';
import React from 'react';

interface Props {
  isLoading?: boolean;
  handleContinueClick: any;
  handleBackClick: any;
}

const ButtonContinue: React.FC<Props> = ({
  isLoading,
  handleBackClick,
  handleContinueClick,
}) => {
  const { current } = useEmployeeManagementStore();

  return (
    <Form.Item
      className="font-semibold text-xs"
      data-cy="sidebar-action-form-item"
    >
      <div
        className="w-full flex  sm:flex-row justify-end  gap-4 sm:gap-6 mt-3 sm:mt-4"
        id="sidebar-action-button-row"
        data-cy="sidebar-action-button-row"
      >
        {current !== 0 ? (
          <Button
            name="cancelUserSidebarButton"
            id="cancelSidebarButtonId"
            className="px-6 py-3 text-xs border border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-500 hover:border-gray-400"
            type="default"
            onClick={handleBackClick}
            data-cy="sidebar-back-button"
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
            id="sidebar-cancel-button-popconfirm"
            data-cy="sidebar-cancel-button-popconfirm"
          >
            <Button
              type="default"
              name="cancelSidebarButtonId"
              id="sidebar-cancel-button"
              data-cy="sidebar-cancel-button"
              className="border border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-500 hover:border-gray-400"
            >
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
          data-cy={
            current === 2
              ? `sidebar-submit-button-${current}`
              : `sidebar-continue-button-${current}`
          }
          className="px-6 py-3 text-xs font-bold bg-[#1e40af]"
          htmlType="button"
          type="primary"
        >
          {current === 3 ? 'Submit' : 'Save and Continue'}
        </Button>
      </div>
    </Form.Item>
  );
};

export default ButtonContinue;
