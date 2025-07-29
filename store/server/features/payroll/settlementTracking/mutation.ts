import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { PAYROLL_URL } from '@/utils/constants';
import { getCurrentToken } from '@/utils/getCurrentToken';

// Create settlement tracking
const createSettlementTracking = async (values: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    await crudRequest({
      url: `${PAYROLL_URL}/settlement-tracking`,
      method: 'POST',
      data: values,
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });

    NotificationMessage.success({
      message: 'Successfully Created',
      description: 'Settlement tracking successfully created.',
    });
  } catch (error) {
    throw error;
  }
};

export const useCreateSettlementTracking = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ values }: { values: any }) => createSettlementTracking(values),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('settlement-tracking');
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message;
        NotificationMessage.error({
          message: 'Creation Failed',
          description: errorMessage || 'Failed to create settlement tracking.',
        });
      },
    },
  );
};

// Update settlement tracking
const updateSettlementTracking = async ({
  id,
  values,
}: {
  id: string;
  values: any;
}) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    await crudRequest({
      url: `${PAYROLL_URL}/settlement-tracking/${id}`,
      method: 'PUT',
      data: values,
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });

    NotificationMessage.success({
      message: 'Successfully Updated',
      description: 'Settlement tracking successfully updated.',
    });
  } catch (error) {
    throw error;
  }
};

export const useUpdateSettlementTracking = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, values }: { id: string; values: any }) =>
      updateSettlementTracking({ id, values }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('settlement-tracking');
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message;
        NotificationMessage.error({
          message: 'Update Failed',
          description: errorMessage || 'Failed to update settlement tracking.',
        });
      },
    },
  );
};

const deleteSettlementTrackingByEmployeeId = async (employeeId: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    await crudRequest({
      url: `${PAYROLL_URL}/settlement-tracking/delete-settlement-tracking/by-employee-id/${employeeId}`,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });
  } catch (error) {
    throw error;
  }
};
// Delete settlement tracking
const deleteSettlementTracking = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    await crudRequest({
      url: `${PAYROLL_URL}/settlement-tracking/${id}`,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });

    NotificationMessage.success({
      message: 'Successfully Deleted',
      description: 'Settlement tracking successfully deleted.',
    });
  } catch (error) {
    throw error;
  }
};

export const useDeleteSettlementTracking = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteSettlementTracking, {
    onSuccess: () => {
      queryClient.invalidateQueries('settlement-tracking');
    },
    onError: (notused: any) => {
      NotificationMessage.error({
        message: notused && 'Delete Failed',
        description: 'Failed to delete settlement tracking.',
      });
    },
  });
};
export const useDeleteSettlementTrackingByEmployeeId = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteSettlementTrackingByEmployeeId, {
    onSuccess: () => {
      queryClient.invalidateQueries('settlement-tracking');
    },
    onError: (notused: any) => {
      NotificationMessage.error({
        message: notused && 'Delete Failed',
        description: 'Failed to delete settlement tracking.',
      });
    },
  });
};
