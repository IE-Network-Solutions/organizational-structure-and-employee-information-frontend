import { Button } from 'antd';
import { FaRegCircle } from 'react-icons/fa';

export const ApprovalWorkFlowComponent = ({
  onChange,
}: {
  onChange: (a: string) => void;
}) => {
  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-4">
      <div className="mb-10">
        <div className="text-2xl font-bold text-center">Choose Approval Type</div>
      </div>
      <div className="bg-white rounded-xl shadow border p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Button
            className="py-5 text-lg gap-1 w-full flex justify-between px-5 rounded-lg"
            onClick={() => onChange('Sequential')}
          >
            Sequential Approval
            <FaRegCircle />
          </Button>
          <span className="block mt-2 text-gray-500 text-sm">
            Approval happen in a strict order, with each approver signing off one after another
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <Button
            className="py-5 text-lg gap-1 w-full flex justify-between px-5 rounded-lg"
            onClick={() => onChange('Parallel')}
          >
            Parallel Approval <FaRegCircle />
          </Button>
          <span className="block mt-2 text-gray-500 text-sm">
            multi approvers can approve at the same time without any specific order
          </span>
        </div>
        <div className="flex flex-col gap-1 opacity-60 cursor-not-allowed">
          <Button
            disabled
            className="py-5 text-lg gap-1 w-full flex justify-between px-5 rounded-lg"
            onClick={() => onChange('Conditional')}
          >
            Conditional Approval <FaRegCircle />
          </Button>
          <span className="block mt-2 text-gray-500 text-sm">
            Approver level depend on certain condition or criteria, triggering specific workflows based on the rules
          </span>
        </div>
      </div>
    </div>
  );
};
