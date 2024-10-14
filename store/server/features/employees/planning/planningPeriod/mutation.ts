import { useMutation, useQueryClient } from 'react-query';
import { crudRequest } from '@/utils/crudRequest';
import { OKR_URL } from '@/utils/constants';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  PlanningPeriodItem,
  PlanningUserPayload,
  UpdatePlanningPeriodFunction,
} from './interface';
import NotificationMessage from '@/components/common/notification/notificationMessage';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;

const updatePlanningPeriod = async (id: string, data: PlanningPeriodItem) => {
  return crudRequest({
    url: `${OKR_URL}/Planning-periods/${id}`,
    method: 'patch',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
    data,
  });
};

const updatePlanningPeriodStatus = async (planningPeriodId: string) => {
  return crudRequest({
    url: `${OKR_URL}/planning-periods/update/planning-period/status/${planningPeriodId}`,
    method: 'get',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
const deletePlanningPeriod = async (id: string) => {
  return crudRequest({
    url: `${OKR_URL}/planning-periods/${id}`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
const assignPlanningPeriodToUsers = async (values: string[]) => {
  return crudRequest({
    url: `${OKR_URL}/planning-periods/assignUser-multiple-planning-periods`,
    method: 'post',
    data: values,
    // data: { values, userId },
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const updatePlanningPeriodToUsers = async (values: PlanningUserPayload) => {
  return crudRequest({
    url: `${OKR_URL}/planning-periods/update-users-assigned-planning-periods/${values.userIds[0]}`, // Accessing the first user ID correctly
    method: 'patch',
    data: values,
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const deleteAssignPlanningPeriodToUsers = async (planningUserId: string) => {
  return crudRequest({
    url: `${OKR_URL}/planning-periods/planning-user/${planningUserId}`,
    method: 'delete',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

// Exporting hooks for mutations
export const useUpdatePlanningPeriod = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (params: { id: string; data: PlanningPeriodItem }) =>
      updatePlanningPeriod(params.id, params.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('planningPeriods'); // Adjust the query key as necessary
        NotificationMessage.success({
          message: 'Successfully Updated',
          description: 'Planning period successfully updated.',
        });
      },
    },
  );
};
export const useUpdatePlanningPeriodToUsers: UpdatePlanningPeriodFunction =
  async (userId, values) => {
    return await fetch(`/api/update-planning-period/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    }).then((response) => response.json());
  };

export const useDeletePlanningPeriod = () => {
  const queryClient = useQueryClient();

  return useMutation((id: string) => deletePlanningPeriod(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('planningPeriods'); // Adjust the query key as necessary
      NotificationMessage.success({
        message: 'Successfully Deleted',
        description: 'Planning period successfully deleted.',
      });
    },
  });
};
export const useAssignPlanningPeriodToUsers = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (planningPeriodId: any) => assignPlanningPeriodToUsers(planningPeriodId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('allPlanningPeriodUser'); // Adjust the query key as necessary
        NotificationMessage.success({
          message: 'Successfully Assigned',
          description: 'Planning period successfully assigned to users.',
        });
      },
    },
  );
};
export const useUpdateAssignPlanningPeriodToUsers = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (values: PlanningUserPayload) => updatePlanningPeriodToUsers(values),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('allPlanningPeriodUser'); // Adjust the query key if needed
        NotificationMessage.success({
          message: 'Successfully Assigned',
          description: 'Planning period successfully assigned to users.',
        });
      },
      onError: () => {
        NotificationMessage.error({
          message: 'Assignment Failed',
          description: 'There was an error assigning the planning period.',
        });
      },
    },
  );
};

export const useDeletePlanningUser = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (planningPeriodId: any) =>
      deleteAssignPlanningPeriodToUsers(planningPeriodId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('allPlanningPeriodUser'); // Adjust the query key as necessary
        NotificationMessage.success({
          message: 'Successfully Deleted',
          description: 'Planning User successfully Deleted.',
        });
      },
    },
  );
};
export const useUpdatePlanningStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (planningPeriodId: any) => updatePlanningPeriodStatus(planningPeriodId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('planningPeriods'); // Adjust the query key as necessary
        NotificationMessage.success({
          message: 'Successfully Deleted',
          description: 'Planning User successfully Deleted.',
        });
      },
    },
  );
};
