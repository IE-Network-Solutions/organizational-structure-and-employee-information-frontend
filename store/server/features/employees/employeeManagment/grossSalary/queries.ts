import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PAYROLL_URL } from '@/utils/constants';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useQuery } from 'react-query';
import { crudRequest } from '@/utils/crudRequest';

const getGrossSalaryById = async (id: string, payPeriodId?: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    };

    // Build URL with optional payPeriodId query parameter
    let url = `${PAYROLL_URL}/payroll/calculate-gross-salary/${id}`;
    if (payPeriodId) {
      url += `?payPeriodId=${payPeriodId}`;
    }

    const response = await crudRequest({
      url,
      method: 'GET',
      headers,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const useGetGrossSalaryById = (empId: string, payPeriodId?: string) =>
  useQuery<any>(['grossSalary', empId, payPeriodId], () =>
    getGrossSalaryById(empId, payPeriodId),
  );
