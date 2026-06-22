import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { Button, Form, Popconfirm } from 'antd';
import React from 'react';

interface Props {
  isLoading?: boolean;
  handleContinueClick: any;
  handleBackClick: any;
  showSkip?: boolean;
  onSkipClick?: () => void;
  isSkipLoading?: boolean;
}

const ButtonContinue: React.FC<Props> = ({
  isLoading,
  handleBackClick,
  handleContinueClick,
  showSkip = false,
  onSkipClick,
  isSkipLoading = false,
}) => {
  const { current } = useEmployeeManagementStore();

  return (
    <Form.Item
      className="font-semibold text-xs"
      data-cy="sidebar-action-form-item"
    >
      <div
        className="w-full flex sm:flex-row justify-between items-center gap-2 mt-3 sm:mt-4"
        id="sidebar-action-button-row"
        data-cy="sidebar-action-button-row"
      >
        <div data-cy="sidebar-skip-button-div" className="flex shrink-0">
          {showSkip && current === 0 && (
            <Button
              type="link"
              onClick={onSkipClick}
              loading={isSkipLoading}
              disabled={isLoading}
              className="px-0 text-sm font-normal text-[#1E40AF] hover:text-[#1D4ED8]"
              id="sidebar-skip-button"
              data-cy="sidebar-skip-button"
            >
              Skip
            </Button>
          )}
        </div>

        <div
          className="flex sm:flex-row justify-end gap-2 w-full sm:w-auto"
          data-cy="sidebar-action-button-group"
        >
          {current !== 0 ? (
            <Button
              name="cancelUserSidebarButton"
              id="cancelSidebarButtonId"
              className="text-sm font-normal border border-[#D9D9D9] text-[#4d4d4d]"
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
                className="border border-[#D9D9D9] text-[#4d4d4d] text-sm font-normal"
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
            className="text-sm font-normal"
            htmlType="button"
            type="primary"
          >
            {current === 3 ? 'Submit' : 'Continue'}
          </Button>
        </div>
      </div>
    </Form.Item>
  );
};

export default ButtonContinue;
