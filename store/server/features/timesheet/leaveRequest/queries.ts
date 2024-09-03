import { crudRequest } from '@/utils/crudRequest';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { LeaveRequest } from '@/types/timesheet/settings';
import { LeaveRequestBody } from '@/store/server/features/timesheet/leaveRequest/interface';
import { requestHeader } from '@/helpers/requestHeader';
import { RequestCommonQueryData } from '@/types/commons/requesTypes';

const getLeaveRequest = async (
  queryData: RequestCommonQueryData,
  data: LeaveRequestBody,
) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/leave-request`,
    method: 'POST',
    headers: requestHeader(),
    data,
    params: queryData,
  });
};

export const useGetLeaveRequest = (
  queryData: RequestCommonQueryData,
  data: LeaveRequestBody,
) => {
  return useQuery<ApiResponse<LeaveRequest>>(
    ['leave-request', queryData],
    () => getLeaveRequest(queryData, data),
    {
      keepPreviousData: true,
    },
  );
};
