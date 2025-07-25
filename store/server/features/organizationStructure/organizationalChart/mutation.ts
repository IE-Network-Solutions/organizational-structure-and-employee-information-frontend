import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { OrgData } from '@/types/dashboard/organization';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OrgChart } from './interface';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { getCurrentToken } from '@/utils/getCurrentToken';
/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Create a new organization chart.
 * @param data - Organization chart data to be created.
 * @returns Promise with the created organization chart data.
 */

const createOrgChart = async (data: OrgData) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/departments`,
    method: 'POST',
    data,
    headers,
  });
};

/**
 * Update an existing organization chart.
 * @param id - ID of the organization chart to update.
 * @param data - Updated organization chart data.
 * @returns Promise with the updated organization chart data.
 */
const updateOrgChart = async (id: string, data: OrgChart) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/departments/${id}`,
    method: 'PATCH',
    data,
    headers,
  });
};

/**
 * Delete an organization chart.
 * @param id - ID of the organization chart to delete.
 * @returns Promise confirming the deletion.
 */
const deleteOrgChart = async (
  departmentTobeDeletedId: string,
  departmentTobeShiftedId: string,
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/departments/${departmentTobeDeletedId}`,
    method: 'DELETE',
    data: { departmentTobeShiftedId },
    headers,
  });
};

/**
 * Custom hook to create a new organization chart using react-query.
 * Invalidate the "orgcharts" query on success to refresh the data.
 * @returns Mutation object for creating an organization chart.
 */
export const useCreateOrgChart = () => {
  const queryClient = useQueryClient();
  return useMutation(createOrgChart, {
    onSuccess: () => {
      queryClient.invalidateQueries('orgcharts');
      // const method = variables?.method?.toUpperCase();
      // handleSuccessMessage(method);
    },
  });
};

/**
 * Custom hook to update an existing organization chart using react-query.
 * Invalidate the "orgcharts" query on success to refresh the data.
 * @returns Mutation object for updating an organization chart.
 */
export const useUpdateOrgChart = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: { id: string; orgChart: OrgChart | any }) =>
      updateOrgChart(data.id, data.orgChart),
    {
      onSuccess: (_, variables: any) => {
        queryClient.invalidateQueries('orgcharts');
        const method = variables?.method?.toUpperCase();
        handleSuccessMessage(method);
      },
    },
  );
};

/**
 * Custom hook to delete an organization chart using react-query.
 * Invalidate the "orgcharts" query on success to refresh the data.
 * @returns Mutation object for deleting an organization chart.
 */
export const useDeleteOrgChart = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({
      departmentTobeDeletedId,
      departmentTobeShiftedId,
    }: {
      departmentTobeDeletedId: string;
      departmentTobeShiftedId: string;
    }) => deleteOrgChart(departmentTobeDeletedId, departmentTobeShiftedId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('orgcharts');
        NotificationMessage.success({
          message: 'Department deleted successfully!',
          description: 'Department has been successfully deleted',
        });
      },
    },
  );
};

/* eslint-disable @typescript-eslint/naming-convention */
