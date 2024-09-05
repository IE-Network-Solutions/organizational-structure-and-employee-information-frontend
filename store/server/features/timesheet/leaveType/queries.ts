import { crudRequest } from '@/utils/crudRequest';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { LeaveType } from '@/types/timesheet/settings';
import { requestHeader } from '@/helpers/requestHeader';

const getLeaveTypes = async () => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/leave-type`,
    method: 'GET',
    headers: requestHeader(),
  });
};

const getLeaveType = async (id: string) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/leave-type`,
    method: 'GET',
    headers: requestHeader(),
    params: { id },
  });
};

export const useGetLeaveTypes = () => {
  return useQuery<ApiResponse<LeaveType>>('leave-type', () => getLeaveTypes(), {
    keepPreviousData: true,
  });
};

export const useGetLeaveTypeById = (id: string) => {
  return useQuery<ApiResponse<LeaveType>>(
    ['leave-type', id],
    () => getLeaveType(id),
    {
      keepPreviousData: true,
    },
  );
};
