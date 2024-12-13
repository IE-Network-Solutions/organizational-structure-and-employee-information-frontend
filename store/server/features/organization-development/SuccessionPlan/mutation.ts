import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useSuccessionPlanStore } from '@/store/uistate/features/organizationalDevelopment/SuccessionPlan';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import { ORG_DEV_URL } from '@/utils/constants';

/**
 * Function to get Auth data for mutations
 * @returns Token and tenant Id
 */
const getAuthHeaders = () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return {
    Authorization: `Bearer ${token}`,
    tenantId,
  };
};

/**
 * Function to handle mutations success
 * @returns
 */
const handleMutationSuccess = (
  queryClient: any,
  message: string,
  description: string,
) => {
  queryClient.invalidateQueries('criticalPosition');
  NotificationMessage.success({ message, description });
};

/**
 * Function to handle mutations error
 * @returns
 */
const handleMutationError = (
  errorMessage: string,
  errorDescription: string,
) => {
  NotificationMessage.error({
    message: errorMessage,
    description: errorDescription,
  });
};

/**
 * Function to crate a critical position
 * @returns The response data from the API
 */
const createCriticalPosition = async ({ values }: { values: any }) => {
  const { userId } = useAuthenticationStore.getState();
  return crudRequest({
    url: `${ORG_DEV_URL}/critical-positions/${userId}`,
    method: 'POST',
    data: values,
    headers: getAuthHeaders(),
  });
};

/**
 * Function to update a critical position
 * @returns The response data from the API
 */
const updateCriticalPosition = async ({
  values,
  id,
}: {
  values: any;
  id: string;
}) => {
  return crudRequest({
    url: `${ORG_DEV_URL}/critical-positions/${id}`,
    method: 'PUT',
    data: values,
    headers: getAuthHeaders(),
  });
};

/**
 * Function to delete a critical position
 * @returns The response data from the API
 */
const deleteCriticalPosition = async ({ id }: { id: string }) => {
  return crudRequest({
    url: `${ORG_DEV_URL}/critical-positions/${id}`,
    method: 'delete',
    headers: getAuthHeaders(),
  });
};

/**
 * Fuction to create a succession plan
 * @returns The response data from the API
 */
const createSuccessionPlan = async ({
  successor,
  criticalPositionId,
}: {
  successor: string[];
  criticalPositionId: string;
}) => {
  const { userId } = useAuthenticationStore.getState();
  return crudRequest({
    url: `${ORG_DEV_URL}/succession-plans/${userId}`,
    method: 'POST',
    data: { ...successor, criticalPositionId },
    headers: getAuthHeaders(),
  });
};

/**
 * Function to update a evaluation
 * @returns The response data from the API
 */
const updateEvaluation = async ({ data }: { data: any }) => {
  const successionPlanId = useSuccessionPlanStore.getState().successionPlanId;
  return crudRequest({
    url: `${ORG_DEV_URL}/evaluations/${successionPlanId}`,
    method: 'PUT',
    data: { data },
    headers: getAuthHeaders(),
  });
};

/**
 * Hook to create a critical position
 * @returns The response data from the API
 */
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

/**
 * Hook to create a succession plan
 * @returns The response data from the API
 */
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

/**
 * Hook to update a evaluation
 * @returns The response data from the API
 */
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

/**
 * Hook to update a critical position
 * @returns The response data from the API
 */
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

/**
 * Hook to delate a critical position
 * @returns The response data from the API
 */
export const useDeleteCriticalPosition = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteCriticalPosition, {
    onSuccess: () =>
      handleMutationSuccess(
        queryClient,
        'Successfully Deleted',
        'Critical position successfully deleted',
      ),
    onError: () => {
      handleMutationError('Delete Failed', 'Critical position delete failed');
    },
  });
};
