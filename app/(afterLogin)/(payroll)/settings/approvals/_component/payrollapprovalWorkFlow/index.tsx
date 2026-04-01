import React, { ReactNode } from 'react';
import { Button } from 'antd';
import { IoArrowBack } from 'react-icons/io5';

interface PayrollApprovalWorkFlowProps {
  onChange: (a: string) => void;
  children?: ReactNode;
  finalizeContent?: ReactNode;
  currentStep?: 1 | 2 | 3;
  onClose?: () => void;
  onBack?: () => void;
  /** Selected approval type from parent store (step 1). */
  approverType?: string | null;
  onContinueFromStep1?: () => void;
  onContinueFromStep2?: () => void;
  onCreate?: () => void;
}

export const PayrollApprovalWorkFlow: React.FC<
  PayrollApprovalWorkFlowProps
> = ({
  onChange,
  children,
  finalizeContent,
  currentStep = 1,
  onClose,
  onBack,
  approverType = null,
  onContinueFromStep1,
  onContinueFromStep2,
  onCreate,
}) => {
  const handleSelect = (type: string) => {
    onChange(type);
  };

  const getStepState = (step: 1 | 2 | 3) => {
    if (currentStep === step) return 'active';
    if (currentStep > step) return 'completed';
    return 'inactive';
  };

  // const filledWidth =
  //   currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%';

  return (
    <div
      id="approval-payroll-workflow-component"
      data-cy="approval-payroll-workflow-component"
      className="w-full"
    >
      <div
        id="approval-payroll-workflow-modal-shell"
        data-cy="approval-payroll-workflow-modal-shell"
        className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-none overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div
          id="approval-payroll-workflow-modal-header"
          data-cy="approval-payroll-workflow-modal-header"
          className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2 px-6 py-4 border-b border-gray-100"
        >
          <div className="flex justify-start">
            {currentStep > 1 && onBack ? (
              <button
                id="approval-payroll-workflow-modal-back-click-button"
                data-cy="approval-payroll-workflow-modal-back-click-button"
                type="button"
                onClick={onBack}
                className="inline-flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-md hover:bg-gray-100"
                aria-label="Go back"
              >
                <IoArrowBack
                  className="text-lg"
                  data-cy="approval-payroll-workflow-modal-back-icon"
                />
              </button>
            ) : (
              <span aria-hidden className="w-10" />
            )}
          </div>
          <h2
            id="approval-payroll-workflow-modal-title"
            data-cy="approval-payroll-workflow-modal-title"
            className="text-lg font-semibold text-gray-900 text-center"
          >
            Approval Workflow
          </h2>
          <div className="flex justify-end">
            <button
              id="approval-payroll-workflow-modal-close-click-button"
              data-cy="approval-payroll-workflow-modal-close-click-button"
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-md hover:bg-gray-100"
              aria-label="Close modal"
            >
              <span
                id="approval-payroll-workflow-modal-close-icon"
                data-cy="approval-payroll-workflow-modal-close-icon"
                className="text-lg leading-none"
              >
                ✕
              </span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          id="approval-payroll-workflow-modal-body"
          data-cy="approval-payroll-workflow-modal-body"
          className="px-6 pt-4 pb-2"
        >
          {/* Stepper */}
          <div
            id="approval-payroll-workflow-stepper"
            data-cy="approval-payroll-workflow-stepper"
            className="mb-6 pt-2 border-t border-gray-100"
          >
            <div
              id="approval-payroll-workflow-stepper-steps"
              data-cy="approval-payroll-workflow-stepper-steps"
              className="mt-4 flex items-center px-4 gap-3"
            >
              {/* Step 1 */}
              <div
                id="approval-payroll-workflow-step-choose"
                data-cy="approval-payroll-workflow-step-choose"
                className="flex items-center bg-white"
              >
                <span
                  id="approval-payroll-workflow-step-1-indicator"
                  data-cy="approval-payroll-workflow-step-1-indicator"
                  className={`w-3 h-3 rounded-full ring-4 ring-white shadow-sm ${
                    getStepState(1) === 'completed' ||
                    getStepState(1) === 'active'
                      ? 'bg-primary'
                      : 'bg-gray-300'
                  }`}
                />
                <span
                  id="approval-payroll-workflow-step-1-label"
                  data-cy="approval-payroll-workflow-step-1-label"
                  className={`ml-2 text-sm font-medium ${
                    getStepState(1) === 'active' ||
                    getStepState(1) === 'completed'
                      ? 'text-primary'
                      : 'text-gray-400'
                  }`}
                >
                  Choose Approval Type
                </span>
              </div>

              {/* Line between step 1 and 2 */}
              <div
                id="approval-payroll-workflow-stepper-line-1"
                data-cy="approval-payroll-workflow-stepper-line-1"
                className={`h-[2px] flex-1 ${
                  currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'
                }`}
              />

              {/* Step 2 */}
              <div
                id="approval-payroll-workflow-step-setup"
                data-cy="approval-payroll-workflow-step-setup"
                className="flex items-center bg-white"
              >
                <span
                  id="approval-payroll-workflow-step-2-indicator"
                  data-cy="approval-payroll-workflow-step-2-indicator"
                  className={`w-3 h-3 rounded-full ring-4 ring-white shadow-sm ${
                    getStepState(2) === 'completed' ||
                    getStepState(2) === 'active'
                      ? 'bg-primary'
                      : 'bg-gray-300'
                  }`}
                />
                <span
                  id="approval-payroll-workflow-step-2-label"
                  data-cy="approval-payroll-workflow-step-2-label"
                  className={`ml-2 text-sm font-medium ${
                    getStepState(2) === 'active' ||
                    getStepState(2) === 'completed'
                      ? 'text-primary'
                      : 'text-gray-400'
                  }`}
                >
                  Setup Approval
                </span>
              </div>

              {/* Line between step 2 and 3 */}
              <div
                id="approval-payroll-workflow-stepper-line-2"
                data-cy="approval-payroll-workflow-stepper-line-2"
                className={`h-[2px] flex-1 ${
                  currentStep >= 3 ? 'bg-primary' : 'bg-gray-200'
                }`}
              />

              {/* Step 3 */}
              <div
                id="approval-payroll-workflow-step-finalize"
                data-cy="approval-payroll-workflow-step-finalize"
                className="flex items-center bg-white"
              >
                <span
                  id="approval-payroll-workflow-step-3-indicator"
                  data-cy="approval-payroll-workflow-step-3-indicator"
                  className={`w-3 h-3 rounded-full ring-4 ring-white shadow-sm ${
                    getStepState(3) === 'completed' ||
                    getStepState(3) === 'active'
                      ? 'bg-primary'
                      : 'bg-gray-300'
                  }`}
                />
                <span
                  id="approval-payroll-workflow-step-3-label"
                  data-cy="approval-payroll-workflow-step-3-label"
                  className={`ml-2 text-sm font-medium ${
                    getStepState(3) === 'active' ||
                    getStepState(3) === 'completed'
                      ? 'text-primary'
                      : 'text-gray-400'
                  }`}
                >
                  Finalize
                </span>
              </div>
            </div>
          </div>

          {/* Step 1: approval type options */}
          {currentStep === 1 && (
          <div
            id="approval-payroll-workflow-options"
            data-cy="approval-payroll-workflow-options"
            className="space-y-3"
          >
            {/* Sequential */}
            <button
              id="approval-payroll-workflow-sequential-button"
              data-cy="approval-workflow-sequential-button"
              type="button"
              onClick={() => handleSelect('Sequential')}
              className={`flex w-full items-start rounded-lg border px-4 py-4 text-left transition-colors ${
                approverType === 'Sequential'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div
                id="approval-payroll-workflow-sequential-option"
                data-cy="approval-payroll-workflow-sequential-option"
                className="flex items-start"
              >
                <span
                  className={`mt-1 mr-3 inline-flex h-[18px] w-[18px] items-center justify-center rounded-full border ${
                    approverType === 'Sequential'
                      ? 'border-primary'
                      : 'border-gray-300'
                  }`}
                  data-cy="approval-workflow-sequential-radio"
                >
                  {approverType === 'Sequential' && (
                    <span
                      className="h-[10px] w-[10px] rounded-full bg-primary"
                      data-cy="approval-workflow-sequential-radio-selected-indicator"
                    />
                  )}
                </span>
                <div
                  id="approval-payroll-workflow-sequential-text"
                  data-cy="approval-payroll-workflow-sequential-text"
                  className="flex flex-col"
                >
                  <span
                    id="approval-payroll-workflow-sequential-title"
                    data-cy="approval-payroll-workflow-sequential-title"
                    className={`text-sm font-medium ${
                      approverType === 'Sequential'
                        ? 'text-primary'
                        : 'text-gray-900'
                    }`}
                  >
                    Sequential Approval
                  </span>
                  <span
                    id="approval-payroll-workflow-sequential-description"
                    data-cy="approval-payroll-workflow-sequential-description"
                    className="mt-1 text-sm text-gray-500"
                  >
                    Approval happen in a strict order, with each approver
                    signing off one after another
                  </span>
                </div>
              </div>
            </button>

            {/* Parallel */}
            <button
              id="approval-payroll-workflow-parallel-button"
              data-cy="approval-payroll-workflow-parallel-button"
              type="button"
              onClick={() => handleSelect('Parallel')}
              className={`flex w-full items-start rounded-lg border px-4 py-4 text-left transition-colors ${
                approverType === 'Parallel'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div
                id="approval-payroll-workflow-parallel-option"
                data-cy="approval-payroll-workflow-parallel-option"
                className="flex items-start"
              >
                <span
                  className={`mt-1 mr-3 inline-flex h-[18px] w-[18px] items-center justify-center rounded-full border ${
                    approverType === 'Parallel'
                      ? 'border-primary'
                      : 'border-gray-300'
                  }`}
                  data-cy="approval-workflow-parallel-radio"
                >
                  {approverType === 'Parallel' && (
                    <span
                      className="h-[10px] w-[10px] rounded-full bg-primary"
                      data-cy="approval-workflow-parallel-radio-selected-indicator"
                    />
                  )}
                </span>
                <div
                  id="approval-payroll-workflow-parallel-text"
                  data-cy="approval-payroll-workflow-parallel-text"
                  className="flex flex-col"
                >
                  <span
                    id="approval-payroll-workflow-parallel-title"
                    data-cy="approval-payroll-workflow-parallel-title"
                    className={`text-sm font-medium ${
                      approverType === 'Parallel'
                        ? 'text-primary'
                        : 'text-gray-900'
                    }`}
                  >
                    Parallel Approval
                  </span>
                  <span
                    id="approval-payroll-workflow-parallel-description"
                    data-cy="approval-payroll-workflow-parallel-description"
                    className="mt-1 text-sm text-gray-500"
                  >
                    multi approvers can approve at the same time without any
                    specific order
                  </span>
                </div>
              </div>
            </button>

            {/* Conditional (disabled) */}
            <button
              id="approval-payroll-workflow-conditional-button"
              data-cy="approval-payroll-workflow-conditional-button"
              type="button"
              disabled
              className="flex w-full cursor-not-allowed items-start rounded-lg border border-gray-100 bg-gray-50 px-4 py-4 text-left opacity-60"
            >
              <div
                id="approval-payroll-workflow-conditional-option"
                data-cy="approval-payroll-workflow-conditional-option"
                className="flex items-start"
              >
                <span
                  className="mt-1 mr-3 inline-flex h-[18px] w-[18px] items-center justify-center rounded-full border border-gray-300"
                  data-cy="approval-workflow-conditional-radio"
                />
                <div
                  id="approval-payroll-workflow-conditional-text"
                  data-cy="approval-payroll-workflow-conditional-text"
                  className="flex flex-col"
                >
                  <span
                    id="approval-payroll-workflow-conditional-title"
                    data-cy="approval-payroll-workflow-conditional-title"
                    className="text-sm font-medium text-gray-900"
                  >
                    Conditional Approval
                  </span>
                  <span
                    id="approval-payroll-workflow-conditional-description"
                    data-cy="approval-payroll-workflow-conditional-description"
                    className="mt-1 text-sm text-gray-500"
                  >
                    Approver level depend on certain condition or criteria,
                    triggering specific workflows based on the rules
                  </span>
                </div>
              </div>
            </button>
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
      {onClose && (
        <div
          id="approval-payroll-workflow-modal-footer"
          data-cy="approval-payroll-workflow-modal-footer"
          className="mt-4 flex justify-end border-t border-gray-100 pt-4 px-6 bg-white"
        >
          <Button
            id="approval-payroll-workflow-modal-cancel-click-button"
            data-cy="approval-payroll-workflow-modal-cancel-click-button"
            type="default"
            className="h-10 px-8"
            onClick={onClose}
          >
            Cancel
          </Button>
          {currentStep === 1 && onContinueFromStep1 ? (
            <Button
              id="approval-payroll-workflow-modal-continue-step1-click-button"
              data-cy="approval-payroll-workflow-modal-continue-step1-click-button"
              type="primary"
              className="ml-3 h-10 px-8"
              onClick={onContinueFromStep1}
              disabled={!approverType}
            >
              Continue
            </Button>
          ) : null}
          {currentStep === 2 && onContinueFromStep2 ? (
            <Button
              id="approval-payroll-workflow-modal-continue-step2-click-button"
              data-cy="approval-payroll-workflow-modal-continue-step2-click-button"
              type="primary"
              className="ml-3 h-10 px-8"
              onClick={onContinueFromStep2}
            >
              Continue
            </Button>
          ) : null}
          {currentStep === 3 && onCreate ? (
            <Button
              id="approval-payroll-workflow-modal-primary-click-button"
              data-cy="approval-payroll-workflow-modal-primary-click-button"
              type="primary"
              className="ml-3 h-10 px-8"
              onClick={onCreate}
            >
              Create
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
};
