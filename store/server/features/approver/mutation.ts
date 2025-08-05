import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { APPROVER_URL, TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useMutation, useQueryClient } from 'react-query';

const createApprover = async (values: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${APPROVER_URL}/approver`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
    data: values,
  });
};

const deleteApprovalWorkFLow = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${APPROVER_URL}/approvalWorkflows/${id}`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const updateApprovalAssignedUserMutation = async (values: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${APPROVER_URL}/approver`,
    method: 'patch',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
    data: values,
  });
};

const addApprovalUserMutation = async (values: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${APPROVER_URL}/approver/addApprover`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
    data: values,
  });
};

const deleteApprover = async (id: string, data: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${APPROVER_URL}/approver/${id}`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
    data,
  });
};

const deleteParallelApprover = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${APPROVER_URL}/approver/parallel/${id}`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

export const updateLeaverequestApprovalWorkFlow = async (
  currentapprovalWorkflowId: string,
  approvalWorkflowId: string,
) => {
  // Retrieve authentication data safely
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  if (!token || !tenantId) {
    throw new Error('User not authenticated.');
  }

  try {
    const response = await crudRequest({
      url: `${TIME_AND_ATTENDANCE_URL}/leave-request/workflowId/${currentapprovalWorkflowId}/${approvalWorkflowId}`,
      method: 'PATCH', // Assuming you're updating data, use PATCH or PUT
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });

    return response;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || 'Failed to update approval workflow.';
    NotificationMessage.error({
      message: 'Update Failed',
      description: errorMessage,
    });
    throw new Error(errorMessage);
  }
};

export const useCreateApproverMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(({ values }: { values: any }) => createApprover(values), {
    onSuccess: () => {
      queryClient.invalidateQueries('approvals');
      NotificationMessage.success({
        message: 'Successfully Created',
        description: 'Approval WorkFlow Created Successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || 'Something went wrong';
      NotificationMessage.error({
        message: 'Error',
        description: errorMessage,
      });
    },
  });
};

export const useDeleteApprovalWorkFLow = () => {
  const queryClient = useQueryClient();
  return useMutation((id: string) => deleteApprovalWorkFLow(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('approvals');
      NotificationMessage.success({
        message: 'Successfully Deleted',
        description: 'Approver successfully deleted.',
      });
    },
  });
};

export const useUpdateAssignedUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ values }: { values: any }) => updateApprovalAssignedUserMutation(values),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('approvals');
        NotificationMessage.success({
          message: 'Successfully Updated',
          description: 'Approver updated successfully ',
        });
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message || 'Something went wrong';
        NotificationMessage.error({
          message: 'Error',
          description: errorMessage,
        });
      },
    },
  );
};

export const useAddApproverMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ values }: { values: any }) => addApprovalUserMutation(values),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('approvals');
        NotificationMessage.success({
          message: 'Successfully Created',
          description: 'Approver created successfully',
        });
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message || 'Something went wrong';
        NotificationMessage.error({
          message: 'Error',
          description: errorMessage,
        });
      },
    },
  );
};
export const useDeleteApprover = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, workFlowId }: { id: string; workFlowId: any }) =>
      deleteApprover(id, workFlowId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('approvals');
        NotificationMessage.success({
          message: 'Successfully Deleted',
          description: 'Approver successfully deleted.',
        });
      },
    },
  );
};
export const useDeleteParallelApprover = () => {
  const queryClient = useQueryClient();
  return useMutation((id: string) => deleteParallelApprover(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('approvals');
      NotificationMessage.success({
        message: 'Successfully Deleted',
        description: 'Approver successfully deleted.',
      });
    },
  });
};

export const useUpdateLeaverequestApprovalWorkFlow = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({
      currentapprovalWorkflowId,
      approvalWorkflowId,
    }: {
      currentapprovalWorkflowId: string;
      approvalWorkflowId: string;
    }) =>
      updateLeaverequestApprovalWorkFlow(
        currentapprovalWorkflowId,
        approvalWorkflowId,
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('approvals'); // Refresh approval data
        NotificationMessage.success({
          message: 'Successfully Updated',
          description: 'Approval workflow updated successfully.',
        });
      },
      onError: (error: any) => {
        NotificationMessage.error({
          message: 'Update Failed',
          description: error.message || 'An unexpected error occurred.',
        });
      },
    },
  );
};
