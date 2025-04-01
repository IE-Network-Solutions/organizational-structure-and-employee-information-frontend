import { TENANT_MGMT_URL } from '@/utils/constants';
import { useMutation, useQueryClient } from 'react-query';
import { Tenant } from '@/types/tenant-management';
import axios from 'axios';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { notification } from 'antd';
export interface UpdateClientDto {
  id?: string;
  companyName?: string;
  companyEmail?: string;
  phoneNumber?: string;
  address?: string;
  businessSize?: string;
  industry?: string;
  country?: string;
  region?: string;
  timezone?: string;
  domainName?: string;
  domainUrl?: string;
  description?: string;
  logo?: string;
  stamp?: string;
  billingEmail?: string;
  billingPhoneNumber?: string;
  notes?: string;
  contactPersonName?: string;
  contactPersonEmail?: string;
  contactPersonPhoneNumber?: string;
  preferredIndustry?: string;
}

export const updateClient = async (id: string, data: UpdateClientDto) => {
  const token = useAuthenticationStore.getState().token;
  
  // Remove the id from the data since it is already used in the URL
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _, ...cleanData } = data;
  
  try {
    const response = await axios({
      url: `${TENANT_MGMT_URL}/clients/${id}`,
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        // Without adding tenantId, since it is added to requestHeader or crudRequest.
      },
      data: cleanData,
    });
    
    return response.data;
  } catch (error) {
    notification.error({
      message: 'Error updating client',
      description: error instanceof Error ? error.message : 'An unknown error occurred'
    });
    throw error;
  }
};

// React Query hook to use the client update mutation
export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Tenant, Error, { id: string; data: UpdateClientDto }>(
    ({ id, data }) => updateClient(id, data),
    {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(['client', variables.id]);
        
        queryClient.invalidateQueries('clients');
      },
    }
  );
};
