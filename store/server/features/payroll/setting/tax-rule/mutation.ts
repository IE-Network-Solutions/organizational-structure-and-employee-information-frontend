import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PAYROLL_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';

const createTaxRule = async (values: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    await crudRequest({
      url: `${PAYROLL_DEV_URL}/tax-rules`,
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
      url: `${PAYROLL_DEV_URL}/tax-rules/${id}`,
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
      url: `${PAYROLL_DEV_URL}/tax-rules/${id}`,
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
