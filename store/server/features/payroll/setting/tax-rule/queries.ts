import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { PAYROLL_URL } from '@/utils/constants';

const getTaxRule = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${PAYROLL_URL}/tax-rules`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

/**
 * Fetches details for the active fiscal year from the API.
 *
 * @async
 * @function fetchActiveFiscalYearPayPeriods
 * @param {string} activeFiscalYearId - The ID of the benefit to fetch.
 * @returns {Promise<any>} The response from the API.
 */
const fetchActiveFiscalYearPayPeriods = async (
  activeFiscalYearId: string | undefined,
) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${PAYROLL_URL}/pay-period/${activeFiscalYearId}`,
    method: 'GET',
    headers,
  });
};

export const useGetTaxRule = () => useQuery('taxRules', getTaxRule);

const getTaxRuleById = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${PAYROLL_URL}/tax-rules/${id}`,
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

/**
 * Custom hook to fetch pay periods for a specific active fiscal year using React Query's useQuery hook.
 *
 * @param {string | undefined} activeFiscalYearId - The ID of the active fiscal year to fetch pay periods for.
 * @returns {QueryObject} The query object for fetching the pay periods.
 */
export const useFetchActiveFiscalYearPayPeriods = (
  activeFiscalYearId: string | undefined,
) => {
  return useQuery(
    ['payPeriods', activeFiscalYearId], // Use the fiscal year ID as part of the query key
    () => fetchActiveFiscalYearPayPeriods(activeFiscalYearId!),
    {
      enabled: !!activeFiscalYearId, // Ensure the query only runs when the ID is defined
    },
  );
};
