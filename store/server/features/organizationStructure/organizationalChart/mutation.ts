import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { OrgData } from '@/types/dashboard/organization';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  OrgChart,
  DepartmentPatchBody,
  DepartmentChildItem,
} from './interface';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { v4 as uuidv4 } from 'uuid';
import { getOrgChart } from './query';
/* eslint-disable @typescript-eslint/naming-convention */

function toChildItem(d: {
  id?: string;
  name?: string;
  description?: string;
  branchId?: string;
}): DepartmentChildItem {
  return {
    id: d.id,
    name: d.name ?? '',
    description: d.description ?? '',
    branchId: d.branchId ?? '',
  };
}

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
 * Update an existing department: GET full department then PATCH with full body
 * (preserves id, createdAt, updatedAt, department[], etc.) and updated name, description, branchId.
 */
const updateOrgChart = async (id: string, data: OrgChart) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  const existing = await getOrgChart(id);
  const children: DepartmentChildItem[] = (existing?.department ?? []).map(
    toChildItem,
  );
  const patchBody: DepartmentPatchBody = {
    ...existing,
    id: existing?.id ?? id,
    name: data.name ?? existing?.name ?? '',
    description: data.description ?? existing?.description ?? '',
    branchId: data.branchId ?? existing?.branchId ?? '',
    department: children,
    ...(data.departmentColor != null &&
      data.departmentColor !== '' && { departmentColor: data.departmentColor }),
  };
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/departments/${id}`,
    method: 'PATCH',
    data: patchBody,
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
 * Create a single department (add as child): PATCH the parent with full body,
 * department array = existing children + new child { name, description, branchId }.
 */
export interface CreateDepartmentPayload {
  name: string;
  description?: string;
  branchId: string;
  parentId?: string;
  departmentColor?: string;
}

const createDepartment = async (data: CreateDepartmentPayload) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };

  if (data.parentId) {
    const parent = await getOrgChart(data.parentId);
    const existingChildren: DepartmentChildItem[] = (
      parent?.department ?? []
    ).map(toChildItem);
    const newChild: DepartmentChildItem & { departmentColor?: string } = {
      id: uuidv4(),
      name: data.name,
      description: data.description ?? '',
      branchId: data.branchId,
      ...(data.departmentColor && { departmentColor: data.departmentColor }),
    };
    const patchBody: DepartmentPatchBody = {
      ...parent,
      id: parent?.id ?? data.parentId,
      name: parent?.name ?? '',
      description: parent?.description ?? '',
      branchId: parent?.branchId ?? '',
      department: [...existingChildren, newChild],
    };
    return await crudRequest({
      url: `${ORG_AND_EMP_URL}/departments/${data.parentId}`,
      method: 'PATCH',
      data: patchBody,
      headers,
    });
  }

  const body: OrgData = {
    name: data.name,
    description: data.description ?? '',
    branchId: data.branchId,
    department: [],
    ...(data.departmentColor && { departmentColor: data.departmentColor }),
  };
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/departments`,
    method: 'POST',
    data: body,
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
 * Custom hook to create a single department (add department).
 * Uses the same POST /departments endpoint. Invalidates orgcharts and orgchartsPeoples.
 */
export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation(createDepartment, {
    onSuccess: () => {
      queryClient.invalidateQueries('orgcharts');
      queryClient.invalidateQueries('orgchartsPeoples');
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
    (data: {
      id: string;
      orgChart: OrgChart | any;
      suppressDefaultSuccessToast?: boolean;
      method?: string;
    }) =>
      updateOrgChart(data.id, data.orgChart),
    {
      onSuccess: (_, variables: any) => {
        queryClient.invalidateQueries('orgcharts');
        queryClient.invalidateQueries('orgchartsPeoples');
        if (variables?.suppressDefaultSuccessToast) return;
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
