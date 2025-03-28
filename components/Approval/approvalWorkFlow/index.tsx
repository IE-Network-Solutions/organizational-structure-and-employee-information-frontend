import { Button } from 'antd';
import { FaRegCircle } from 'react-icons/fa';
export const ApprovalWorkFlowComponent = ({
  onChange,
}: {
  onChange: (a: string) => void;
}) => {
  return (
    <div>
      <div className="mb-10">
        <div className="text-2xl font-bold ">Choose Approval Type</div>
      </div>
      <div className="">
        <div className=" py-3">
          <Button
            className="py-5  text-lg gap-1 min-w-80 flex justify-between  px-5"
            onClick={() => onChange('Sequential')}
          >
            Sequential Approval
            <FaRegCircle />
          </Button>
          <span className="block mt-1 text-gray-500">
            Approval happen in a strict order, with each approver signing off
            one after another
          </span>
        </div>
        <div className=" py-3">
          <Button
            className="py-5  text-lg gap-1 min-w-80 flex justify-between  px-5"
            onClick={() => onChange('Parallel')}
          >
            Parallel Approval <FaRegCircle />
          </Button>
          <span className="block mt-1 text-gray-500">
            multi approvers can approve at the same time without any specific
            order
          </span>
        </div>
        <div className=" py-3">
          <Button
            disabled
            className="py-5  text-lg gap-1 min-w-80 flex justify-between  px-5"
            onClick={() => onChange('Conditional')}
          >
            Conditional Approval <FaRegCircle />
          </Button>
          <span className="block mt-1 text-gray-500">
            Approver level depend on certain condition or criteria, triggering
            specific workflows based on the rules
          </span>
        </div>
      </div>
    </div>
  );
};
