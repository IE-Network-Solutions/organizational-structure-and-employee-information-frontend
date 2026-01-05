import { useMutation, useQueryClient } from 'react-query';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { getCurrentToken } from '@/utils/getCurrentToken';

const createEmployeeType = async (values: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/employement-type`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },
    data: values,
  });
};

const updateEmployeeType = async ({ id, ...values }: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/employement-type/${id}`,
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
    data: values,
  });
};

export const useAddEmployeeType = () => {
  const queryClient = useQueryClient();

  return useMutation(createEmployeeType, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'employeementTypes',
        refetchActive: true,
      });
      NotificationMessage.success({
        message: 'Successfully Added EmployeType',
        description: 'Employee Type successfully Created',
      });
    },
  });
};

const deleteEmployeeType = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/employement-type/${id}`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

export const useUpdateEmployeeType = () => {
  const queryClient = useQueryClient();

  return useMutation(updateEmployeeType, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'employeementTypes',
        refetchActive: true,
      });
      NotificationMessage.success({
        message: 'Successfully Updated EmployeType',
        description: 'Employee Type successfully Updated',
      });
    },
  });
};

export const useDeleteEmployeeType = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteEmployeeType, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'employeementTypes',
        refetchActive: true,
      });
      NotificationMessage.success({
        message: 'Successfully Deleted EmployeType',
        description: 'Employee Type successfully Deleted',
      });
    },
  });
};
