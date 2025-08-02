import NotificationMessage from '@/components/common/notification/notificationMessage';
import { requestHeader } from '@/helpers/requestHeader';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';

// Mutation function for updating profile image
const updateProfileImageMutation = async (formData: FormData) => {
  const requestHeaders = await requestHeader();

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/users/update-profile-image`, // Endpoint expects a POST request
    method: 'POST',
    data: formData,
    headers: requestHeaders,
  });
};

// useUpdateProfileImage hook
export const useUpdateProfileImage = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, formData }: { id: string; formData: FormData }) => {
      // Append user ID to formData
      formData.append('userId', id);

      return updateProfileImageMutation(formData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employee'); // Invalidate queries related to employee data
        NotificationMessage.success({
          message: 'Successfully Updated',
          description: 'Profile image successfully updated.',
        });
      },
      onError: () => {
        NotificationMessage.error({
          message: 'Update Failed',
          description: 'Failed to update profile image. Please try again.',
        });
      },
    },
  );
};

// Mutation function
const createEmployeeMutation = async (values: any) => {
  const requestHeaders = await requestHeader();

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/employee-information`,
    method: 'post',
    headers: requestHeaders,
    data: values,
  });
};
const updateEmployeeMutation = async (id: string, values: any) => {
  const requestHeaders = await requestHeader();

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/employee-information/${id}`,
    method: 'patch',
    headers: requestHeaders,
    data: values,
  });
};
const updateEmployeeInformation = async (id: string, values: any) => {
  const requestHeaders = await requestHeader();

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/users/${id}`,
    method: 'patch',
    headers: requestHeaders,
    data: values,
  });
};
// Mutation function
const updateEmployeeRolePermissionMutation = async (
  id: string,
  values: any,
) => {
  const requestHeaders = await requestHeader();

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/users/${id}`,
    method: 'patch',
    headers: requestHeaders,
    data: { ...values, groupPermissionId: undefined }, // Ensuring it doesn't get sent
  });
};
const updateEmployeeJobInformationMutation = async (
  id: string,
  values: any,
) => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/EmployeeJobInformation/${id}`,
    method: 'patch',
    headers: requestHeaders,
    data: values,
  });
};

const deleteEmployeeDocument = async (id: string) => {
  const requestHeaders = await requestHeader();

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/employee-document/${id}`,
    method: 'DELETE',
    headers: requestHeaders,
  });
};

const createEmployeeDocument = async (formData: FormData) => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/employee-document`,
    method: 'POST',
    data: formData,
    headers: requestHeaders,
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
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ values }: { values: any }) => createEmployeeMutation(values),
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
export const useUpdateEmployeeInformation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, values }: { id: string; values: any }) =>
      updateEmployeeInformation(id, values),
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
    async (formData: FormData) => {
      return await createEmployeeDocument(formData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employee');
        NotificationMessage.success({
          message: 'Successfully Created',
          description: 'Document successfully uploaded',
        });
      },
      onError: () => {
        NotificationMessage.error({
          message: 'Creation Failed',
          description: 'Document upload failed',
        });
      },
    },
  );
};
