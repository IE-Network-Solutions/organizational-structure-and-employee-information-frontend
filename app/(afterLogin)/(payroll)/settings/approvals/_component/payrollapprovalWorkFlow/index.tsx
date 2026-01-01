import { Button } from 'antd';
import { FaRegCircle } from 'react-icons/fa';

export const PayrollApprovalWorkFlow = ({
  onChange,
}: {
  onChange: (a: string) => void;
}) => {
  return (
    <div
      id="approval-payroll-workflow-component"
      className="mx-auto px-2 sm:px-4"
      data-cy="approval-payroll-workflow-component"
    >
      <div
        className="mb-10"
        id="approval-payroll-workflow-header"
        data-cy="approval-payroll-workflow-header"
      >
        <div
          className="text-2xl font-bold"
          id="approval-payroll-workflow-title"
          data-cy="approval-payroll-workflow-title"
        >
          Choose Approval Type
        </div>
      </div>
      <div
        className="bg-white px-5 flex flex-col gap-4"
        id="approval-payroll-workflow-options"
        data-cy="approval-payroll-workflow-options"
      >
        <div
          className="flex flex-col gap-1"
          id="approval-payroll-workflow-sequential"
          data-cy="approval-workflow-sequential"
        >
          <Button
            className="py-5 text-lg gap-1 w-full flex justify-between px-5 rounded-lg"
            onClick={() => onChange('Sequential')}
            id="approval-payroll-workflow-sequential-button"
            data-cy="approval-workflow-sequential-button"
          >
            Sequential Approval
            <FaRegCircle />
          </Button>
          <span
            className="block mt-2 text-gray-500 text-sm"
            id="approval-payroll-workflow-sequential-description"
            data-cy="approval-payroll-workflow-sequential-description"
          >
            Approval happen in a strict order, with each approver signing off
            one after another
          </span>
        </div>
        <div
          className="flex flex-col gap-1"
          id="approval-payroll-workflow-parallel"
          data-cy="approval-payroll-workflow-parallel"
        >
          <Button
            className="py-5 text-lg gap-1 w-full flex justify-between px-5 rounded-lg"
            onClick={() => onChange('Parallel')}
            id="approval-payroll-workflow-parallel-button"
            data-cy="approval-payroll-workflow-parallel-button"
          >
            Parallel Approval <FaRegCircle />
          </Button>
          <span
            className="block mt-2 text-gray-500 text-sm"
            id="approval-payroll-workflow-parallel-description"
            data-cy="approval-payroll-workflow-parallel-description"
          >
            multi approvers can approve at the same time without any specific
            order
          </span>
        </div>
        <div
          className="flex flex-col gap-1 opacity-60 cursor-not-allowed"
          id="approval-payroll-workflow-conditional"
          data-cy="approval-payroll-workflow-conditional"
        >
          <Button
            disabled
            className="py-5 text-lg gap-1 w-full flex justify-between px-5 rounded-lg"
            onClick={() => onChange('Conditional')}
            id="approval-payroll-workflow-conditional-button"
            data-cy="approval-payroll-workflow-conditional-button"
          >
            Conditional Approval <FaRegCircle />
          </Button>
          <span
            className="block mt-2 text-gray-500 text-sm"
            id="approval-payroll-workflow-conditional-description"
            data-cy="approval-payroll-workflow-conditional-description"
          >
            Approver level depend on certain condition or criteria, triggering
            specific workflows based on the rules
          </span>
        </div>
      </div>
    </div>
  );
};
