import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useSuccessionPlanStore } from '@/store/uistate/features/organizationalDevelopment/SuccessionPlan';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';

const getAuthHeaders = () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return {
    Authorization: `Bearer ${token}`,
    tenantId,
  };
};

const handleMutationSuccess = (
  queryClient: any,
  message: string,
  description: string,
) => {
  queryClient.invalidateQueries('criticalPosition');
  NotificationMessage.success({ message, description });
};

const handleMutationError = (
  errorMessage: string,
  errorDescription: string,
) => {
  NotificationMessage.error({
    message: errorMessage,
    description: errorDescription,
  });
};

/** API Call Functions */
const createCriticalPosition = async ({ values }: { values: any }) => {
  const { userId } = useAuthenticationStore.getState();
  return crudRequest({
    url: `http://localhost:5000/api/v1/critical-positions/${userId}`,
    method: 'POST',
    data: values,
    headers: getAuthHeaders(),
  });
};

const updateCriticalPosition = async ({
  values,
  id,
}: {
  values: any;
  id: string;
}) => {
  return crudRequest({
    url: `http://localhost:5000/api/v1/critical-positions/${id}`,
    method: 'PUT',
    data: values,
    headers: getAuthHeaders(),
  });
};

const createSuccessionPlan = async ({
  successor,
  criticalPositionId,
}: {
  successor: string[];
  criticalPositionId: string;
}) => {
  const { userId } = useAuthenticationStore.getState();
  return crudRequest({
    url: `http://localhost:5000/api/v1/succession-plans/${userId}`,
    method: 'POST',
    data: { ...successor, criticalPositionId },
    headers: getAuthHeaders(),
  });
};

const updateEvaluation = async ({ data }: { data: any }) => {
  const successionPlanId = useSuccessionPlanStore.getState().successionPlanId;
  return crudRequest({
    url: `http://localhost:5000/api/v1/evaluations/${successionPlanId}`,
    method: 'PUT',
    data: { data },
    headers: getAuthHeaders(),
  });
};

/** Hooks for Mutations */
export const useCreateCriticalPosition = () => {
  const queryClient = useQueryClient();
  return useMutation(createCriticalPosition, {
    onSuccess: () =>
      handleMutationSuccess(
        queryClient,
        'Successfully Created',
        'Critical position successfully created',
      ),
    onError: () =>
      handleMutationError(
        'Creation Failed',
        'Critical position creation failed',
      ),
  });
};

export const useCreateSuccessionPlan = () => {
  const queryClient = useQueryClient();
  return useMutation(createSuccessionPlan, {
    onSuccess: () =>
      handleMutationSuccess(
        queryClient,
        'Successfully Created',
        'Succession plan successfully created',
      ),
    onError: () =>
      handleMutationError('Creation Failed', 'Succession plan creation failed'),
  });
};

export const useUpdateEvaluation = () => {
  const queryClient = useQueryClient();
  return useMutation(updateEvaluation, {
    onSuccess: () =>
      handleMutationSuccess(
        queryClient,
        'Successfully Updated',
        'Succession evaluation successfully updated',
      ),
    onError: () => {
      handleMutationError(
        'Update Failed',
        'Succession evaluation update failed',
      );
    },
  });
};

export const useUpdateCriticalPosition = () => {
  const queryClient = useQueryClient();
  return useMutation(updateCriticalPosition, {
    onSuccess: () =>
      handleMutationSuccess(
        queryClient,
        'Successfully Updated',
        'Critical position successfully updated',
      ),
    onError: () => {
      handleMutationError('Update Failed', 'Critical position update failed');
    },
  });
};
