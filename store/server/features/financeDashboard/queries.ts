import { useQuery } from 'react-query';
import { requestHeader } from '@/helpers/requestHeader';
import { crudRequest } from '@/utils/crudRequest';
import { PAYROLL_URL } from '@/utils/constants';
import type {
  DetailsOverviewResponse,
  MonthlyOverviewResponse,
  PayrollByPayPeriodParams,
  MonthlyVariablePayOverviewResponse,
} from './interface';

export const getMonthlyOverview = async (): Promise<MonthlyOverviewResponse> => {
  const headers = await requestHeader();

  return crudRequest({
    url: `${PAYROLL_URL}/payroll/monthly-overview`,
    method: 'GET',
    headers,
  });
};

export const useGetMonthlyOverview = () =>
  useQuery(['monthly-overview'], () => getMonthlyOverview());

export const getMonthlyVariablePayOverview = async (): Promise<MonthlyVariablePayOverviewResponse> => {
  const headers = await requestHeader();

  return crudRequest({
    url: `${PAYROLL_URL}/payroll/monthly-variable-pay-overview`,
    method: 'GET',
    headers,
  });
};

export const useGetMonthlyVariablePayOverview = () =>
  useQuery(['monthly-variable-pay-overview'], () =>
    getMonthlyVariablePayOverview(),
  );

export const getPayrollByPayPeriod = async ({
  limit,
  page,
  payPeriodId,
}: PayrollByPayPeriodParams) => {
  const headers = await requestHeader();

  return crudRequest({
    url: `${PAYROLL_URL}/payroll/find-all-payroll-by-pay-period`,
    method: 'GET',
    headers,
    params: {
      limit,
      page,
      payPeriodId,
    },
  });
};

export const useGetPayrollByPayPeriod = (params: PayrollByPayPeriodParams) =>
  useQuery(
    ['find-all-payroll-by-pay-period', params.limit, params.page, params.payPeriodId],
    () => getPayrollByPayPeriod(params),
    {
      enabled: Boolean(params.payPeriodId),
    },
  );

export const getAllowanceDetailsOverview = async (): Promise<DetailsOverviewResponse> => {
  const headers = await requestHeader();

  return crudRequest({
    url: `${PAYROLL_URL}/payroll/allowance-details-overview`,
    method: 'GET',
    headers,
  });
};

export const useGetAllowanceDetailsOverview = () =>
  useQuery(
    ['allowance-detailsoverview'],
    () => getAllowanceDetailsOverview()
  );

  export const getBenefitDetailsOverview = async (
  ): Promise<DetailsOverviewResponse> => {
    const headers = await requestHeader();

    return crudRequest({
      url: `${PAYROLL_URL}/payroll/benefit-details-overview`,
      method: 'GET',
      headers,
    });
  };

  export const useGetBenefitDetailsOverview = () =>
    useQuery(
      ['benefit-details-overview'],
      () => getBenefitDetailsOverview()
    );
