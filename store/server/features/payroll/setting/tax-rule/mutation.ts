import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PAYROLL_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useMutation, useQueryClient } from 'react-query';

const createTaxRule = async (values: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    await crudRequest({
      url: `${PAYROLL_URL}/tax-rules`,
      method: 'POST',
      data: values,
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });

    NotificationMessage.success({
      message: 'Successfully Created',
      description: 'Tax Rule successfully Created.',
    });
  } catch (error) {
    throw error;
  }
};

export const useCreateTaxRule = () => {
  const queryClient = useQueryClient();

  return useMutation(createTaxRule, {
    onSuccess: () => {
      queryClient.invalidateQueries('taxRules');
    },
    onError: (error) => {
      NotificationMessage.error({
        message: error + '',
        description: 'Tax Rule Creation Failed.',
      });
    },
  });
};

const deleteTaxRule = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    await crudRequest({
      url: `${PAYROLL_URL}/tax-rules/${id}`,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });

    NotificationMessage.success({
      message: 'Successfully Deleted',
      description: 'Tax Rule successfully deleted.',
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Create pay periods by sending a POST request to the API.
 *
 * @async
 * @function createPayPeriods
 * @returns {Promise<any>} The response from the API.
 */
const createPayPeriods = async (data: any[]) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${PAYROLL_URL}/pay-period`,
    method: 'POST',
    data,
    headers,
  });
};

const editPayPeriod = async ({
  data,
  payPeriodId,
}: {
  data: any;
  payPeriodId: string;
}) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${PAYROLL_URL}/pay-period/${payPeriodId}`,
    method: 'PUT',
    data,
    headers,
  });
};

export const useEditPayPeriod = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ data, payPeriodId }: { data: any; payPeriodId: string }) =>
      editPayPeriod({ data, payPeriodId }),
    {
      onSuccess: (_response, variables) => {
        queryClient.invalidateQueries('payPeriods');
        NotificationMessage.success({
          message: 'Successfully Updated',
          description: 'pay period successfully updated.',
        });
      },
    },
  );
};


/**
 * Deletes a pay period by sending a DELETE request to the API.
 *
 * @async
 * @function deletePayPeriod
 * @returns {Promise<any>} The response from the API.
 */
const deletePayPeriod = async (payPeriodId: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${PAYROLL_URL}/pay-period/${payPeriodId}`,
    method: 'DELETE',
    headers,
  });
};

/**
 * API function to change the status of a pay period.
 *
 * @async
 * @function changePayPeriodStatus
 * @param {string} payPeriodId - The ID of the pay period.
 * @param {string} status - The new status of the pay period (e.g., 'OPEN' or 'CLOSED').
 * @returns {Promise<any>} The response from the API.
 */
const changePayPeriodStatus = async (payPeriodId: string): Promise<any> => {
  const { token, tenantId } = useAuthenticationStore.getState();

  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${PAYROLL_URL}/pay-period/change/pay-period-status/${payPeriodId}`,
    method: 'put',
    headers,
  });
};

export const useDeleteTaxRule = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteTaxRule, {
    onSuccess: () => {
      queryClient.invalidateQueries('taxRules');
    },
    onError: (error) => {
      NotificationMessage.error({
        message: error + '',
        description: 'Failed to delete Tax Rule.',
      });
    },
  });
};

const updateTaxRule = async ({ id, values }: { id: string; values: any }) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    await crudRequest({
      url: `${PAYROLL_URL}/tax-rules/${id}`,
      method: 'PUT',
      data: values,
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });

    NotificationMessage.success({
      message: 'Successfully Updated',
      description: 'Tax rule successfully updated.',
    });
  } catch (error) {
    throw error;
  }
};

export const useUpdateTaxRule = () => {
  const queryClient = useQueryClient();

  return useMutation(updateTaxRule, {
    onSuccess: () => {
      queryClient.invalidateQueries('taxRules');
    },
    onError: (error) => {
      NotificationMessage.error({
        message: error + '',
        description: 'Tax Rule Update Failed.',
      });
    },
  });
};

/**
 * Custom hook to create pay periods using React Query's useMutation hook.
 * On success, the cache for `payPeriods` is invalidated and a success message is displayed.
 *
 * @returns {MutationObject} The mutation object for deleting a question template.
 */
export const useCreatePayPeriods = () => {
  const queryClient = useQueryClient();
  return useMutation(createPayPeriods, {
    onSuccess: (notused: any, variables: any) => {
      queryClient.invalidateQueries('payPeriods');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

/**
 * Custom hook to delete a pay period using React Query's useMutation hook.
 * On success, the cache for `payPeriods` is invalidated and a success message is displayed.
 *
 * @returns {MutationObject} The mutation object for deleting a question template.
 */
export const useDeletePayPeriod = () => {
  const queryClient = useQueryClient();
  return useMutation(deletePayPeriod, {
    onSuccess: (notused: any, variables: any) => {
      queryClient.invalidateQueries('payPeriods');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

/**
 * Custom hook to change the status of a pay period using React Query's useMutation hook.
 * On success, the cache for `payPeriods` is invalidated and a success message is displayed.
 *
 * @returns {MutationObject} The mutation object for changing the pay period status.
 */
export const useChangePayPeriodStatus = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ payPeriodId }: { payPeriodId: string }) =>
      changePayPeriodStatus(payPeriodId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('payPeriods');
        handleSuccessMessage(`Pay period status changed to`);
      },
    },
  );
};
