import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { useQuery } from 'react-query';
import { requestHeader } from '@/helpers/requestHeader';

const getLeaveBalanceExpiring = async (
  userId: string,
  leaveTypeId: string,
  monthsAhead: string,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/leave-balance/expiring`,
    method: 'GET',
    headers: requestHeaders,
    params: { userId, leaveTypeId, monthsAhead },
  });
};
export const useGetLeaveBalanceExpiring = (
  userId: string,
  leaveTypeId: string,
  monthsAhead: string,
) =>
  useQuery<any>(
    ['leave-balance-expiring', userId, leaveTypeId, monthsAhead],
    () => getLeaveBalanceExpiring(userId, leaveTypeId, monthsAhead),
    {
      enabled: !!userId && !!leaveTypeId && !!monthsAhead,
    },
  );