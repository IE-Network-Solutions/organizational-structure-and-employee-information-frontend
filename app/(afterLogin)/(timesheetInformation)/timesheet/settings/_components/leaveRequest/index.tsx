import PageHeader from '@/components/common/pageHeader/pageHeader';
import LeaveRequestCard from './leaveRequestCard';
import LeaveRequestSidebar from './leaveRequestSidebar';

const LeaveRequest = () => {
  return (
    <>
      <PageHeader title="Leave Requests" size="small" />

      <div className="mt-6">
        <LeaveRequestCard />
      </div>

      <LeaveRequestSidebar />
    </>
  );
};

export default LeaveRequest;
