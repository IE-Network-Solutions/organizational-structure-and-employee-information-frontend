import { LeaveRequest } from '@/types/timesheet/settings';
import { crudRequest } from '@/utils/crudRequest';
import { APPROVER_URL, TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { requestHeader } from '@/helpers/requestHeader';
import {
  AllLeaveRequestApproveData,
  LeaveRequestStatusBody,
} from '@/store/server/features/timesheet/leaveRequest/interface';

const setLeaveRequest = async ({
  item,
  userId,
}: {
  item: Partial<LeaveRequest>;
  userId: string;
}) => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/leave-request/make  `,
    method: 'POST',
    headers: requestHeader(),
    data: { item: { ...item, user: userId } },
  });
};

const deleteLeaveRequest = async (id: string) => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/leave-request/make`,
    method: 'DELETE',
    headers: requestHeader(),
    params: { id },
  });
};

const setStatusToLeaveRequest = async (data: LeaveRequestStatusBody) => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/leave-request/escalate`,
    method: 'POST',
    headers: requestHeader(),
    data,
  });
};
const setApproveLeaveRequest = async (data: any) => {
  return await crudRequest({
    url: `${APPROVER_URL}/approver/approvalLog`,
    method: 'POST',
    headers: requestHeader(),
    data,
  });
};
const setAllApproveLeaveRequest = async (data: AllLeaveRequestApproveData) => {
  const roleId = { roleId: data?.roleId };
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/leave-request/CurrentApproved/${data?.userId}?page=${data?.page}&limit=${data?.limit}`,
    method: 'POST',
    headers: requestHeader(),
    data: roleId,
  });
};
const setAllRejectLeaveRequest = async (data: AllLeaveRequestApproveData) => {
  const roleId = { roleId: data?.roleId };
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/leave-request/CurrentRejected/${data?.userId}?page=${data?.page}&limit=${data?.limit}`,
    method: 'POST',
    headers: requestHeader(),
    data: roleId,
  });
};

export const useSetLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(setLeaveRequest, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('leave-request');
      queryClient.invalidateQueries('current_approval');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useDeleteLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteLeaveRequest, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('leave-request');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useSetStatusToLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(setStatusToLeaveRequest, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('leave-request');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
export const useSetApproveLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(setApproveLeaveRequest, {
    onSuccess: (data, variables: any) => {
      queryClient.invalidateQueries(['current_approval', data?.approvedUserId]);
      queryClient.invalidateQueries(['leave-request']);
      queryClient.invalidateQueries(['transferApprovalRequest']);
      queryClient.invalidateQueries(['myTansferRequest']);
      queryClient.invalidateQueries(['transferRequest']);
      queryClient.invalidateQueries([
        'tna-current_approval',
        data?.approvedUserId,
      ]);
      queryClient.invalidateQueries(['tna']);
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
export const useSetAllApproveLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(setAllApproveLeaveRequest, {
    onSuccess: (data, variables: any) => {
      queryClient.invalidateQueries(['current_approval', data?.userId]);
      queryClient.invalidateQueries(['leave-request']);
      queryClient.invalidateQueries(['transferApprovalRequest']);
      queryClient.invalidateQueries(['myTansferRequest']);
      queryClient.invalidateQueries(['transferRequest']);
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
export const useSetRejectLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(setAllRejectLeaveRequest, {
    onSuccess: (data, variables: any) => {
      queryClient.invalidateQueries(['current_approval', data?.userId]);
      queryClient.invalidateQueries(['leave-request']);
      queryClient.invalidateQueries(['transferApprovalRequest']);
      queryClient.invalidateQueries(['myTansferRequest']);
      queryClient.invalidateQueries(['transferRequest']);
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
