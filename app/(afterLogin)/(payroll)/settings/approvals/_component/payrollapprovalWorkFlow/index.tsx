import React, { ReactNode, useMemo } from 'react';
import { Radio, Steps } from 'antd';

interface PayrollApprovalWorkFlowProps {
  onChange: (a: string) => void;
  children?: ReactNode;
  finalizeContent?: ReactNode;
  currentStep?: 1 | 2 | 3;
  /** Selected approval type from parent store (step 1). */
  approverType?: string | null;
  id?: string;
  className?: string;
  'data-cy'?: string;
}

export const PayrollApprovalWorkFlow: React.FC<
  PayrollApprovalWorkFlowProps
> = ({
  onChange,
  children,
  finalizeContent,
  currentStep = 1,
  approverType = null,
  id,
  className,
}) => {
  const handleSelect = (type: string) => {
    onChange(type);
  };

  const stepItems = useMemo(
    () => [
      {
        title: (
          <span
            className="sm:text-nowrap"
            data-cy="approval-payroll-workflow-step-title-type"
          >
            Choose Approval Type
          </span>
        ),
      },
      {
        title: (
          <span
            className="sm:text-nowrap"
            data-cy="approval-payroll-workflow-step-title-setup"
          >
            Setup Approval
          </span>
        ),
      },
      {
        title: (
          <span
            className="sm:text-nowrap"
            data-cy="approval-payroll-workflow-step-title-finalize"
          >
            Finalize
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div
      id={id ?? 'approval-payroll-workflow-component'}
      data-cy="approval-payroll-workflow-component"
      className={className ?? 'w-full'}
    >
      <div
        id="approval-payroll-workflow-modal-body"
        data-cy="approval-payroll-workflow-modal-body"
      >
        <style data-cy="approval-payroll-workflow-steps-style">{`
          .approval-payroll-workflow-steps .ant-steps-item-title {
            white-space: nowrap !important;
          }
          .approval-payroll-workflow-steps .ant-steps-item-process .ant-steps-item-title,
          .approval-payroll-workflow-steps .ant-steps-item-finish .ant-steps-item-title {
            color: #1e40af !important;
          }
          .approval-payroll-workflow-steps .ant-steps-item-wait .ant-steps-item-title {
            color: #d9d9d9 !important;
          }
        `}</style>

        <div
          className="mb-8"
          data-cy="approval-payroll-workflow-steps-container"
        >
          <Steps
            responsive={false}
            labelPlacement="vertical"
            progressDot
            current={Math.max(0, Math.min(2, currentStep - 1))}
            className="approval-payroll-workflow-steps px-4 mx-auto max-w-5xl hidden sm:flex"
            data-cy="approval-payroll-workflow-steps"
            items={stepItems}
          />
        </div>

        {/* Step 1: approval type options */}
        {currentStep === 1 && (
          <div
            id="approval-payroll-workflow-options"
            data-cy="approval-payroll-workflow-options"
            className="flex flex-col gap-4"
          >
            <Radio.Group
              value={approverType || undefined}
              onChange={(e) => handleSelect(e.target.value)}
              className="w-full flex flex-col gap-4"
              data-cy="approval-payroll-workflow-type-group"
            >
              <label
                className={`flex flex-col gap-1 p-2 rounded-lg border-[1px] bg-white shadow-md cursor-pointer transition-colors ${
                  approverType === 'Sequential'
                    ? 'border-primary'
                    : 'border-[#D9D9D9] hover:border-[#D9D9D9]'
                }`}
                data-cy="approval-workflow-sequential"
              >
                <div
                  className="flex items-start gap-3"
                  data-cy="approval-workflow-sequential-row"
                >
                  <Radio
                    value="Sequential"
                    data-cy="approval-workflow-sequential-radio"
                  />
                  <div
                    className="flex flex-col gap-1"
                    data-cy="approval-workflow-sequential-text-block"
                  >
                    <span
                      className="text-base font-medium text-gray-900"
                      data-cy="approval-workflow-sequential-title"
                    >
                      Sequential Approval
                    </span>
                    <span
                      className="text-sm text-gray-500 font-normal"
                      data-cy="approval-workflow-sequential-description"
                    >
                      Approval happen in a strict order, with each approver
                      signing off one after another
                    </span>
                  </div>
                </div>
              </label>

              <label
                className={`flex flex-col gap-1 p-2 rounded-lg border border-[#D9D9D9] bg-white shadow-md cursor-pointer transition-colors ${
                  approverType === 'Parallel'
                    ? 'border-primary'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                data-cy="approval-workflow-parallel"
              >
                <div
                  className="flex items-start gap-3"
                  data-cy="approval-workflow-parallel-row"
                >
                  <Radio
                    value="Parallel"
                    data-cy="approval-workflow-parallel-radio"
                  />
                  <div
                    className="flex flex-col gap-1"
                    data-cy="approval-workflow-parallel-text-block"
                  >
                    <span
                      className="text-base font-medium text-gray-900"
                      data-cy="approval-workflow-parallel-title"
                    >
                      Parallel Approval
                    </span>
                    <span
                      className="text-sm text-gray-500 font-normal"
                      data-cy="approval-workflow-parallel-description"
                    >
                      multi approvers can approve at the same time without any
                      specific order
                    </span>
                  </div>
                </div>
              </label>

              <label
                className="flex flex-col gap-1 p-2 rounded-lg border border-[#D9D9D9] bg-white shadow-md opacity-60 cursor-not-allowed"
                data-cy="approval-workflow-conditional"
              >
                <div
                  className="flex items-start gap-3"
                  data-cy="approval-workflow-conditional-row"
                >
                  <Radio
                    value="Conditional"
                    disabled
                    data-cy="approval-workflow-conditional-radio"
                  />
                  <div
                    className="flex flex-col gap-1"
                    data-cy="approval-workflow-conditional-text-block"
                  >
                    <span
                      className="text-base font-medium text-gray-900"
                      data-cy="approval-workflow-conditional-title"
                    >
                      Conditional Approval
                    </span>
                    <span
                      className="text-sm text-gray-500 font-normal"
                      data-cy="approval-workflow-conditional-description"
                    >
                      Approver level depend on certain condition or criteria,
                      triggering specific workflows based on the rules
                    </span>
                  </div>
                </div>
              </label>
            </Radio.Group>
          </div>
        )}

        {(currentStep === 2 || currentStep === 3) && children ? (
          <div
            id="approval-payroll-workflow-step-two-container"
            data-cy="approval-payroll-workflow-step-two-container"
            className={currentStep === 3 ? 'hidden' : 'pt-2 pb-2'}
            aria-hidden={currentStep === 3}
          >
            {children}
          </div>
        ) : null}

        {currentStep === 3 && finalizeContent ? (
          <div
            id="approval-payroll-workflow-step-three-container"
            data-cy="approval-payroll-workflow-step-three-container"
            className="pt-2 pb-2"
          >
            {finalizeContent}
          </div>
        ) : null}
      </div>
    </div>
  );
};
