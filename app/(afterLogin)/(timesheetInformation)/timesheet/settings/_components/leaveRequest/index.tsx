import PageHeader from '@/components/common/pageHeader/pageHeader';
import LeaveRequestCard from './leaveRequestCard';
import LeaveRequestSidebar from './leaveRequestSidebar';
import { useGetLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/queries';
import { LeaveRequestStatus } from '@/types/timesheet/settings';
import { Spin } from 'antd';

const LeaveRequest = () => {
  const { data, isFetching } = useGetLeaveRequest(
    { page: '1', limit: '100' },
    {
      filter: {
        status: LeaveRequestStatus.PENDING,
      },
    },
  );
  return (
    <>
      <PageHeader title="Leave Requests" size="small" />

      {data &&
        data.items?.map((item) => (
          <div className="mt-6" key={item.id}>
            <Spin spinning={isFetching}>
              <LeaveRequestCard item={item} />
            </Spin>
          </div>
        ))}

      <LeaveRequestSidebar />
    </>
  );
};

export default LeaveRequest;
