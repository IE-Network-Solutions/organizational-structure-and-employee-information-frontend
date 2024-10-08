'use client';
import { useApprovalStore } from '@/store/uistate/features/approval';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';
import { FaRegCircle } from 'react-icons/fa';

const WorkFlow: React.FC<any> = () => {
  const { setApproverType, approverType } = useApprovalStore();

  const onChange = (value: string) => {
    setApproverType(value);
    if (approverType) {
      router.push('/approval/workFlow/approvalSetting');
    }
  };
  const router = useRouter();

  const handleNextClick = () => {
    if (approverType) {
      router.push('/approval/workFlow/approvalSetting');
    }
  };
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
export default WorkFlow;
