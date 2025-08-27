import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { useQuery } from 'react-query';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { crudRequest } from '@/utils/crudRequest';

const getEmployee = async (id: string) => {
  // Prevent API call if id is not available
  if (!id || id === '' || id === 'undefined') {
    throw new Error(
      'Employee ID is not available. Please ensure a valid ID is provided.',
    );
  }

  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    };
    
    // First try with normal encryption handling
    try {
      const response = await crudRequest({
        url: `${ORG_AND_EMP_URL}/users/${id}`,
        method: 'GET',
        headers,
      });
      
      // If we get a proper response, return it
      if (response && typeof response === 'object') {
        return response;
      }
    } catch (encryptionError) {
    }
    
    // Fallback: try with skipEncryption if the above fails
    try {
      const response = await crudRequest({
        url: `${ORG_AND_EMP_URL}/users/${id}`,
        method: 'GET',
        headers,
        skipEncryption: true,
      });
      
      // Handle encrypted response manually if needed
      if (response && response.data && typeof response.data === 'string') {
        return {};
      }
      
      return response;
    } catch (fallbackError) {
      throw fallbackError;
    }
  } catch (error) {

    throw error;
  }
};

const getSimpleEmployee = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    // First try with normal encryption handling
    try {
      const response = await crudRequest({
        url: `${ORG_AND_EMP_URL}/users/simple-info/${id}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          tenantId: tenantId,
        },
      });
      
      // If we get a proper response, return it
      if (response && typeof response === 'object') {
        return response;
      }
    } catch (encryptionError) {
    }
    
    // Fallback: try with skipEncryption if the above fails
    try {
      const response = await crudRequest({
        url: `${ORG_AND_EMP_URL}/users/simple-info/${id}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          tenantId: tenantId,
        },
        skipEncryption: true,
      });
      
      // Handle encrypted response manually if needed
      if (response && response.data && typeof response.data === 'string') {
        return {};
      }
      
      return response;
    } catch (fallbackError) {
      throw fallbackError;
    }
  } catch (error) {
    throw error;
  }
};
export const useGetSimpleEmployee = (empId: string) =>
  useQuery<any>(['employee', empId], () => getSimpleEmployee(empId), {
    keepPreviousData: true,
    enabled: !!empId,
  });
export const useGetEmployee = (empId: string) => {
  const token = useAuthenticationStore.getState().token;
  return useQuery<any>(['employeeItemData', empId], () => getEmployee(empId), {
    keepPreviousData: true,
    enabled: empId?.length > 0 || !!token,
  });
};
