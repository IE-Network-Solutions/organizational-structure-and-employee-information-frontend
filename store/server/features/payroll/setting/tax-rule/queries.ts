import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { PAYROLL_DEV_URL } from '@/utils/constants';

const getTaxRule = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${PAYROLL_DEV_URL}/tax-rules`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetTaxRule = () => useQuery('taxRules', getTaxRule);

const getTaxRuleById = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${PAYROLL_DEV_URL}/tax-rules/${id}`, // Added the ID to the URL
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetTaxRuleById = (id: string) =>
  useQuery(['taxRules', id], () => getTaxRuleById(id), {
    enabled: !!id,
  });
