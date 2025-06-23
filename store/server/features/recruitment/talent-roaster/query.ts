import { useAuthenticationStore } from "@/store/uistate/features/authentication";
import { RECRUITMENT_URL } from "@/utils/constants";
import { crudRequest } from "@/utils/crudRequest";
import { useQuery } from "react-query";

// Fetch token and tenantId from the authentication store
const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const headers = {
  tenantId: tenantId,
  Authorization: `Bearer ${token}`,
};

const getTalentRoaster = async (params?: {
    fullName?: string;
    dateRange?: string;
    selectedDepartment?: string;
    page?: number;
    pageSize?: number;
  }) => {
    // Build query parameters
    const searchParams = new URLSearchParams();
    
    if (params?.fullName) {
        searchParams.append('fullName', params.fullName);
      }
      if (params?.dateRange) {
        searchParams.append('dateRange', params.dateRange);
      }
      if (params?.selectedDepartment) {
        searchParams.append('departmentId', params.selectedDepartment);
      }
      if (params?.page) {
        searchParams.append('page', params.page.toString());
      }
      if (params?.pageSize) {
        searchParams.append('pageSize', params.pageSize.toString());
      }
  
      const queryString = searchParams.toString();
      const url = queryString ? `${RECRUITMENT_URL}/talent-roaster?${queryString}` : `${RECRUITMENT_URL}/talent-roaster`;
  

    return await crudRequest({
        url,
        method: 'GET',
        headers,
    });
};

const getTalentRoasterById = async (id: string) => {
    return await crudRequest({
        url: `${RECRUITMENT_URL}/talent-roaster/${id}`,
        method: 'GET',
        headers,
    });
};

export const useGetTalentRoaster = (params?: {
    fullName?: string;
    dateRange?: string;
    selectedDepartment?: string;
    page?: number;
    pageSize?: number;
  }) => {
    return useQuery({
        queryKey: ['talentRoaster', params],
        queryFn: () => getTalentRoaster(params),
        enabled: true, // Always enabled to allow for search
        refetchOnWindowFocus: false,
        staleTime: 30000, // Consider data stale after 30 seconds
        cacheTime: 300000, // Keep data in cache for 5 minutes
        onError: (error) => {
          console.error('Error fetching talent roaster:', error);
        },
        onSuccess: (data) => {
          console.log('Talent roaster data fetched successfully:', data);
        }
    });
};

export const useGetTalentRoasterById = (id: string) => {
    return useQuery({
        queryKey: ['talentRoaster', id],
        queryFn: () => getTalentRoasterById(id)
    });
}
