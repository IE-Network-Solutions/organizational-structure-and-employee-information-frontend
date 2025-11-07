import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';

import { useMutation, useQueryClient } from 'react-query';

// Mutation function for updating profile image
const updateProfileImageMutation = async (formData: FormData) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/users/update-profile-image`, // Endpoint expects a POST request
    method: 'POST',
    data: formData,
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
      'Content-Type': 'multipart/form-data', // Required for file uploads
    },
  });
};

const deleteProfileImageMutation = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/users/${id}/profile-image`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
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

export const useDeleteProfileImage = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id }: { id: string }) => deleteProfileImageMutation(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employee'); // Invalidate queries related to employee data
        NotificationMessage.success({
          message: 'Successfully Deleted',
          description: 'Profile image successfully removed.',
        });
      },
      onError: () => {
        NotificationMessage.error({
          message: 'Delete Failed',
          description: 'Failed to delete profile image. Please try again.',
        });
      },
    },
  );
};

// Mutation function
const createEmployeeMutation = async (values: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/employee-information`,
    method: 'post',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
    data: values,
  });
};
const updateEmployeeMutation = async (id: string, values: any) => {
  const token = await getCurrentToken();
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
const updateEmployeeInformation = async (id: string, values: any) => {
  const token = await getCurrentToken();
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
// Mutation function
const updateEmployeeRolePermissionMutation = async (
  id: string,
  values: any,
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/users/${id}`,
    method: 'patch',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
    data: { ...values, groupPermissionId: undefined }, // Ensuring it doesn't get sent
  });
};
const updateEmployeeJobInformationMutation = async (
  id: string,
  values: any,
  changeMakerUserId?: string,
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (changeMakerUserId) {
    queryParams.append('changeMakerUserId', changeMakerUserId);
  }

  const url = `${ORG_AND_EMP_URL}/EmployeeJobInformation/${id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return crudRequest({
    url,
    method: 'patch',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
    data: values,
  });
};

const deleteEmployeeDocument = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await crudRequest({
      url: `${ORG_AND_EMP_URL}/employee-document/${id}`,
      method: 'DELETE',
      headers,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const createEmployeeDocument = async (formData: FormData) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/employee-document`,
    method: 'POST',
    data: formData,
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
    skipEncryption: true,
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
    ({
      id,
      values,
      changeMakerUserId,
    }: {
      id: string;
      values: any;
      changeMakerUserId?: string;
    }) => updateEmployeeJobInformationMutation(id, values, changeMakerUserId),
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
