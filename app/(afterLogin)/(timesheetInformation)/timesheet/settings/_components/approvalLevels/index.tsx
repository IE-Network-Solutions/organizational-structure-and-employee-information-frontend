import PageHeader from '@/components/common/pageHeader/pageHeader';
import ApprovalLevelsCard from './approvalLevelsCard';

const ApprovalLevels = () => {
  return (
    <>
      <PageHeader title="Request Approval Levels" size="small" />

      <div className="mt-6">
        <ApprovalLevelsCard />
        <ApprovalLevelsCard />
        <ApprovalLevelsCard />
      </div>
    </>
  );
};

export default ApprovalLevels;
