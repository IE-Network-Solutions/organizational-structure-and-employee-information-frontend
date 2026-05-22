import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';

import { useMutation, useQueryClient } from 'react-query';
import {
  extractBankInformationFromPatchResponse,
  mergeEmployeeInformationRowPreservingBank,
  normalizeBankInformation,
  normalizePatchPayloadForCache,
  parseEmployeeInformationJsonFields,
} from '@/utils/employeeBankInformation';
import { getEmployeeInformationById } from '@/store/server/features/employees/employeeManagment/queries';

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
    skipEncryption: true,
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
    skipEncryption: true,
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

/** Merge PATCH payload into cached employeeInformation (nested objects shallow-merged). */
export function mergeEmployeeInformationCache(
  current: Record<string, unknown> | undefined,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const next = { ...(current ?? {}) };
  for (const [key, value] of Object.entries(patch)) {
    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      next[key] !== null &&
      typeof next[key] === 'object' &&
      !Array.isArray(next[key])
    ) {
      next[key] = {
        ...(next[key] as Record<string, unknown>),
        ...(value as Record<string, unknown>),
      };
    } else {
      next[key] = value;
    }
  }
  return next;
}
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
export type UpdateEmployeeVariables = {
  id: string;
  values: Record<string, unknown>;
  /** User id for `['employee', userId]` query cache (route param). */
  userId?: string;
};

// useUpdateEmployee hook remains unchanged
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, values }: UpdateEmployeeVariables) =>
      updateEmployeeMutation(id, values),
    {
      onSuccess: async (data, variables) => {
        const { userId, values, id: employeeInfoId } = variables;
        const cachePatch = normalizePatchPayloadForCache(values);
        const bankPatch = extractBankInformationFromPatchResponse(data, values);

        if (userId) {
          queryClient.setQueryData(['employee', userId], (old: any) => {
            if (!old?.employeeInformation) return old;

            let employeeInformation = mergeEmployeeInformationCache(
              old.employeeInformation,
              cachePatch,
            );

            if (bankPatch && Object.keys(bankPatch).length > 0) {
              employeeInformation = {
                ...employeeInformation,
                bankInformation: {
                  ...normalizeBankInformation(
                    employeeInformation.bankInformation,
                  ),
                  ...bankPatch,
                },
              };
            } else if (
              data &&
              typeof data === 'object' &&
              (data as { id?: string }).id
            ) {
              employeeInformation = mergeEmployeeInformationCache(
                employeeInformation,
                parseEmployeeInformationJsonFields(
                  data as Record<string, unknown>,
                ),
              );
            }

            return { ...old, employeeInformation };
          });

          // GET /users/:id can stay Redis-stale after PATCH employee-information.
          // Load the updated row from GET /employee-information/:id instead.
          try {
            const freshEmployeeInfo = await getEmployeeInformationById(
              employeeInfoId,
            );
            if (freshEmployeeInfo && typeof freshEmployeeInfo === 'object') {
              queryClient.setQueryData(['employee', userId], (old: any) => {
                if (!old?.employeeInformation) return old;
                return {
                  ...old,
                  employeeInformation: mergeEmployeeInformationRowPreservingBank(
                    old.employeeInformation,
                    freshEmployeeInfo as Record<string, unknown>,
                    bankPatch,
                  ),
                };
              });
            }
          } catch {
            // Keep optimistic cache from PATCH response / submitted values
          }
        }

        // List only — do not invalidate ['employee', userId]: refetch hits GET /users/:id
        // which can be Redis-stale or fail (network toast) and overwrite the cache we just set.
        queryClient.invalidateQueries('employees');

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
