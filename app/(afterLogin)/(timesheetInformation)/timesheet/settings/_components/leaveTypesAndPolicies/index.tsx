import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button } from 'antd';
import { LuPlus } from 'react-icons/lu';
import PolicyCard from './policyCard';
import TypesAndPoliciesSidebar from './typesAndPoliciesSidebar';

const LeaveTypesAndPolicies = () => {
  const { setIsShowTypeAndPoliciesSidebar } = useTimesheetSettingsStore();
  return (
    <>
      <PageHeader title="Types and Policies" size="small">
        <Button
          size="large"
          type="primary"
          icon={<LuPlus size={18} />}
          onClick={() => setIsShowTypeAndPoliciesSidebar(true)}
        >
          New Type
        </Button>
      </PageHeader>

      <PolicyCard />
      <PolicyCard />

      <TypesAndPoliciesSidebar />
    </>
  );
};
export default LeaveTypesAndPolicies;
