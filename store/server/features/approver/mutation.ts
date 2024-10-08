import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { APPROVER_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import axios from 'axios';
import { useMutation, useQueryClient } from 'react-query';

const createApprover = async (values: any) => {
  const token = useAuthenticationStore.getState().token;
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
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    };
    const response = await axios.delete(
      `${APPROVER_URL}/approvalWorkflows/${id}`,
      { headers },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateApprovalAssignedUserMutation = async (values: any) => {
  const token = useAuthenticationStore.getState().token;
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
  const token = useAuthenticationStore.getState().token;
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
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    };
    const response = await axios.delete(`${APPROVER_URL}/approver/${id}`, {
      headers,
      data,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
const deleteParallelApprover = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    };
    const response = await axios.delete(
      `${APPROVER_URL}/approver/parallel/${id}`,
      {
        headers,
      },
    );
    return response.data;
  } catch (error) {
    throw error;
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

export const updateAssignedUserMutation = () => {
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
    },
  );
};

export const addApproverMutation = () => {
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
