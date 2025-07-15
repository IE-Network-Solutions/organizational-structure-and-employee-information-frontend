import { useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { CreateEmployeeJobInformationInterface } from './interface';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
/**
 * Function to add a new post by sending a POST request to the API
 * @param newPost The data for the new post
 * @returns The response data from the API
 */
const createEmployee = async (values: any) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/users`,
    method: 'POST',
    data: values,
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },
  });
};

const downloadEmployeeInfomation = async ({
  downloadFormat,
  searchParams,
}: {
  downloadFormat: string;
  searchParams: Record<string, string>;
}) => {
  const paramsData = { ...searchParams, downloadFormat };
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/users/export`,
    method: 'POST',
    data: paramsData, // paramsData should match ExportUserDto shape
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
const createJobInformation = async (values: any) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/EmployeeJobInformation`,
    method: 'POST',
    data: values,
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },
  });
};
const updateEmployee = async (values: any) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/users/${values?.usersId}`,
    method: 'patch',
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },
    data: values,
  });
};
/**
 * Function to delete a post by sending a DELETE request to the API
 * @param postId The ID of the post to delete
 * @returns The response data from the API
 */
const deleteEmployee = async () => {
  const deletedItem = useEmployeeManagementStore.getState().deletedItem;
  const setDeleteModal = useEmployeeManagementStore.getState().setDeleteModal;
  const setDeletedItem = useEmployeeManagementStore.getState().setDeletedItem;
  const pageSize = useEmployeeManagementStore.getState().pageSize;
  const userCurrentPage = useEmployeeManagementStore.getState().userCurrentPage;

  const headers = {
    Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
    tenantId: tenantId, // Pass tenantId in the headers
  };
  try {
    const response = await axios.delete(
      `${ORG_AND_EMP_URL}/users/${deletedItem}?limit=${pageSize}&&page=${userCurrentPage}`,
      { headers },
    );
    setDeleteModal(false);
    setDeletedItem(null);
    NotificationMessage.success({
      message: 'Successfully Deleted',
      description: 'Employee successfully deleted.',
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Custom hook to add a new group Permissions using useMutation from react-query.
 *
 * @returns The mutation object for adding a group Permissions.
 *
 * @description
 * This hook handles the mutation to add a new post. On successful mutation,
 * it invalidates the "groupPermissions" query to refetch the latest data.
 */
export const useAddEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation(createEmployee, {
    onSuccess: () => {
      queryClient.invalidateQueries('employees');
      NotificationMessage.success({
        message: 'Successfully Created',
        description: 'Employee successfully Created',
      });
    },
  });
};
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation(updateEmployee, {
    onSuccess: () => {
      queryClient.invalidateQueries('employees');
      NotificationMessage.success({
        message: 'Successfully Updated',
        description: 'Employee successfully updated',
      });
    },
  });
};

/**
 * Custom hook to delete a group Permissions using useMutation from react-query.
 *
 * @returns The mutation object for deleting a group Permissions.
 *
 * @description
 * This hook handles the mutation to delete a group Permissions. On successful mutation,
 * it invalidates the "groupPermissions" query to ensure the group Permissions data is refetched.
 */
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteEmployee, {
    onSuccess: () => {
      queryClient.invalidateQueries('employees');
    },
  });
};

export const useCreateJobInformation = () => {
  const queryClient = useQueryClient();
  return useMutation(createJobInformation, {
    onSuccess: (data: CreateEmployeeJobInformationInterface) => {
      queryClient.invalidateQueries(['employee', data.userId]);
      queryClient.invalidateQueries('employees');
      queryClient.invalidateQueries('basicSalary');
      NotificationMessage.success({
        message: 'Successfully Created',
        description: 'Employee successfully Created',
      });
    },
  });
};

export const useDownloadEmployeeDataByFilter = () => {
  // const queryClient = useQueryClient();
  return useMutation(downloadEmployeeInfomation, {
    onSuccess: (data) => {
      if (data?.fileUrl) {
        const link = document.createElement('a');
        link.href = data.fileUrl;
        // Optionally, extract filename from URL
        const filename = data.fileUrl.split('/').pop() || 'downloaded_file';
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
  });
};
