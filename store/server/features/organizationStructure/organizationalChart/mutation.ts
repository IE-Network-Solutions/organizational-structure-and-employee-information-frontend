import { crudRequest } from "@/utils/crudRequest";
import { useMutation, useQueryClient } from "react-query";
import { OrgChart } from "./interface";
import { ORG_AND_EMP_URL, tenantId } from "@/utils/constants";
import { OrgData } from "@/types/dashboard/organization";
import NotificationMessage from "@/components/common/notification/notificationMessage";

/**
 * Create a new organization chart.
 * @param data - Organization chart data to be created.
 * @returns Promise with the created organization chart data.
 */
const headers = {
  tenantId: tenantId,
};
const createOrgChart = async (data: OrgData) => {
  return await crudRequest({ url: `${ORG_AND_EMP_URL}/departments`, method: "POST", data, headers });
};

/**
 * Update an existing organization chart.
 * @param id - ID of the organization chart to update.
 * @param data - Updated organization chart data.
 * @returns Promise with the updated organization chart data.
 */
const updateOrgChart = async (id: string, data: OrgChart) => {
  return await crudRequest({ url: `${ORG_AND_EMP_URL}/departments/${id}`, method: "PATCH", data, headers });
};

/**
 * Delete an organization chart.
 * @param id - ID of the organization chart to delete.
 * @returns Promise confirming the deletion.
 */
const deleteOrgChart = async (id: string) => {
  return await crudRequest({ url: `${ORG_AND_EMP_URL}/departments/${id}`, method: "DELETE", headers });
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
      queryClient.invalidateQueries("orgcharts");
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
    (data: { id: string; orgChart: OrgChart }) => updateOrgChart(data.id, data.orgChart),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("orgcharts");
      },
    }
  );
};

/**
 * Custom hook to delete an organization chart using react-query.
 * Invalidate the "orgcharts" query on success to refresh the data.
 * @returns Mutation object for deleting an organization chart.
 */
export const useDeleteOrgChart = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteOrgChart, {
    onSuccess: () => {
      queryClient.invalidateQueries("orgcharts");
    },
    onError:(error:any)=>{
      NotificationMessage.error(error)
    }
  });
};
