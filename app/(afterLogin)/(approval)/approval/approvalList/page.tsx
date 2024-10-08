'use client';
import ApprovalFilter from '../../_component/approvalFilter';
import ApprovalListTable from '../../_component/approvalListTable';
import { FaPlus } from 'react-icons/fa';
import CustomButton from '@/components/common/buttons/customButton';
import { useRouter } from 'next/navigation';
import { useApprovalStore } from '@/store/uistate/features/approval';

const ApprovalList: React.FC<any> = () => {
  const router = useRouter();
  const { setApproverType } = useApprovalStore();

  const handleNavigation = () => {
    router.push('/approval/workFlow');
    setApproverType('');
  };

  return (
    <div>
      <div className="mb-10 flex justify-between">
        <div className="text-2xl font-bold ">List Of Approval</div>

        <CustomButton
          title="Set Approval"
          id="createUserButton"
          icon={<FaPlus className="mr-2" />}
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleNavigation}
        />
      </div>
      <div className="px-5">
        <ApprovalFilter />
        <ApprovalListTable />
      </div>
    </div>
  );
};
export default ApprovalList;
