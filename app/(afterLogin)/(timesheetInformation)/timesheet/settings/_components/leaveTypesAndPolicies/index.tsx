import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button } from 'antd';
import { LuPlus } from 'react-icons/lu';
import TypesAndPoliciesSidebar from './typesAndPoliciesSidebar';
import LeaveTypeCard from './leaveTypeCard';
import { useGetLeaveTypes } from '@/store/server/features/timesheet/leaveType/queries';

const LeaveTypesAndPolicies = () => {
  const { setIsShowTypeAndPoliciesSidebar } = useTimesheetSettingsStore();
  const { data } = useGetLeaveTypes();
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

      {data &&
        data.items.map((item) => <LeaveTypeCard key={item.id} item={item} />)}

      <TypesAndPoliciesSidebar />
    </>
  );
};
export default LeaveTypesAndPolicies;
