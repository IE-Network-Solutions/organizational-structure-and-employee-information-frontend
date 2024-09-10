import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import axios from 'axios';
import { useMutation, useQueryClient } from 'react-query';

// Mutation function
const updateEmployeeMutation = async (id: string, values: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/employee-information/${id}`,
    method: 'patch',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
    data: values,
  });
};

// Mutation function
const updateEmployeeRolePermissionMutation = async (
  id: string,
  values: any,
) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/users/${id}`,
    method: 'patch',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
    data: values,
  });
};
const updateEmployeeJobInformationMutation = async (
  id: string,
  values: any,
) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/EmployeeJobInformation/${id}`,
    method: 'patch',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
    data: values,
  });
};

const deleteEmployeeDocument = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await axios.delete(
      `${ORG_AND_EMP_URL}/employee-document/${id}`,
      { headers },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const createEmployeeDocument = async (id: string, values: any) => {
  const formData = new FormData();
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  formData.append('userId', id);
  formData.append(
    'documentName',
    values?.documentName?.fileList[0]?.originFileObj,
  );
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/employee-document`,
    method: 'POST',
    data: formData,
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },
  });
};

export const useDeleteEmployeeDocument = () => {
  const queryClient = useQueryClient();
  return useMutation((id: string) => deleteEmployeeDocument(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('employee');
      NotificationMessage.success({
        message: 'Successfully Deleted',
        description: 'Document successfully deleted.',
      });
    },
  });
};

export const useUpdateEmployeeJobInformation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, values }: { id: string; values: any }) =>
      updateEmployeeJobInformationMutation(id, values),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employee');
        NotificationMessage.success({
          message: 'Successfully Updated',
          description: 'Employee successfully updated',
        });
      },
    },
  );
};
// useUpdateEmployee hook remains unchanged
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, values }: { id: string; values: any }) =>
      updateEmployeeMutation(id, values),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employee');
        NotificationMessage.success({
          message: 'Successfully Updated',
          description: 'Employee successfully updated',
        });
      },
    },
  );
};

// useUpdateEmployee hook remains unchanged
export const useUpdateEmployeeRolePermission = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, values }: { id: string; values: any }) =>
      updateEmployeeRolePermissionMutation(id, values),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employee');
        NotificationMessage.success({
          message: 'Successfully Updated',
          description: 'Employee successfully updated',
        });
      },
    },
  );
};
export const useAddEmployeeDocument = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, values }: { id: string; values: any }) =>
      createEmployeeDocument(id, values),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employees');
        NotificationMessage.success({
          message: 'Successfully Created',
          description: 'Employee successfully Created',
        });
      },
      onError: () => {
        NotificationMessage.error({
          message: 'Creating Failed',
          description: 'Employee Created Failed',
        });
      },
    },
  );
};
