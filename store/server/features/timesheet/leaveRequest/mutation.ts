import { LeaveRequest } from '@/types/timesheet/settings';
import { crudRequest } from '@/utils/crudRequest';
import {
  APPROVER_URL,
  TNA_URL,
  ORG_AND_EMP_URL,
  TIME_AND_ATTENDANCE_URL,
} from '@/utils/constants';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { requestHeader } from '@/helpers/requestHeader';
import {
  AllLeaveRequestApproveData,
  LeaveRequestStatusBody,
} from '@/store/server/features/timesheet/leaveRequest/interface';
import NotificationMessage from '@/components/common/notification/notificationMessage';

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
const setFinalApproveLeaveRequest = async (data: any) => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/leave-request/escalate`,
    method: 'POST',
    headers: requestHeader(),
    data,
  });
};
const setFinalApproveBranchRequest = async (data: any) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/branch-request/${data?.requestId}`,
    method: 'PATCH',
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
const setAllApproveTnaRequest = async (data: AllLeaveRequestApproveData) => {
  const roleId = { roleId: data?.roleId };
  return await crudRequest({
    url: `${TNA_URL}/tna/tna-currentApproved/${data?.userId}?page=${data?.page}&limit=${data?.limit}`,
    method: 'POST',
    headers: requestHeader(),
    data: roleId,
  });
};
const setAllRejectTnaRequest = async (data: AllLeaveRequestApproveData) => {
  const roleId = { roleId: data?.roleId };
  return await crudRequest({
    url: `${TNA_URL}/tna/tna-currentRejected/${data?.userId}?page=${data?.page}&limit=${data?.limit}`,
    method: 'POST',
    headers: requestHeader(),
    data: roleId,
  });
};

const setAllFinalApproveLeaveRequest = async (data: any) => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/leave-request/allEscalate`,
    method: 'POST',
    headers: requestHeader(),
    data,
  });
};
const setAllLeaveRequestNotification = async () => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/leave-request/current-approver/pending-leaves/notify`,
    method: 'POST',
    headers: requestHeader(),
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
      queryClient.invalidateQueries('current_approval');
      queryClient.invalidateQueries('leave-request');
      queryClient.invalidateQueries('transferApprovalRequest');
      queryClient.invalidateQueries('myTransferRequest');
      queryClient.invalidateQueries('transferRequest');
      queryClient.invalidateQueries('tnaCurrentApproval');
      queryClient.invalidateQueries('tna');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
export const useSetFinalApproveLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(setFinalApproveLeaveRequest, {
    onSuccess: (variables: any) => {
      queryClient.invalidateQueries('current_approval');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
export const useSetFinalApproveBranchRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(setFinalApproveBranchRequest, {
    onSuccess: (variables: any) => {
      queryClient.invalidateQueries('current_approval');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
export const useSetAllApproveLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(setAllApproveLeaveRequest, {
    onSuccess: (variables: any) => {
      queryClient.invalidateQueries('current_approval');
      queryClient.invalidateQueries('leave-request');
      queryClient.invalidateQueries('transferApprovalRequest');
      queryClient.invalidateQueries('myTransferRequest');
      queryClient.invalidateQueries('transferRequest');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
export const useSetRejectLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(setAllRejectLeaveRequest, {
    onSuccess: (variables: any) => {
      queryClient.invalidateQueries('current_approval');
      queryClient.invalidateQueries('leave-request');
      queryClient.invalidateQueries('transferApprovalRequest');
      queryClient.invalidateQueries('myTransferRequest');
      queryClient.invalidateQueries('transferRequest');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useSetAllApproveTnaRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(setAllApproveTnaRequest, {
    onSuccess: (data, variables: any) => {
      queryClient.invalidateQueries('tnaCurrentApproval');
      queryClient.invalidateQueries('tna');

      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
export const useSetRejectTnaRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(setAllRejectTnaRequest, {
    onSuccess: () => {
      queryClient.invalidateQueries('tnaCurrentApproval');
      queryClient.invalidateQueries('tna');
    },
  });
};
export const useSetAllFinalApproveLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(setAllFinalApproveLeaveRequest, {
    onSuccess: (variables: any) => {
      queryClient.invalidateQueries('current_approval');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });

};

export const useSetAllLeaveRequestNotification = () => {
  const queryClient = useQueryClient();
  return useMutation(setAllLeaveRequestNotification, {
    onSuccess: () => {
     NotificationMessage.success({
        message: 'Incentive generated successfully!',
        description: 'Incentive has been successfully generated',
      });
    },
  });
};
