import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { OKR_URL, ORG_AND_EMP_URL, PAYROLL_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { getCurrentToken } from '@/utils/getCurrentToken';

const getPayRoll = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${PAYROLL_URL}/payroll`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetPayRoll = () => useQuery('payroll', getPayRoll);

const getAllActiveBasicSalary = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    // url: `${ORG_AND_EMP_URL}/basic-salary/active`,
    url: `${ORG_AND_EMP_URL}/basic-salary/active/users `,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetAllActiveBasicSalary = () =>
  useQuery('allBasicSalary', getAllActiveBasicSalary);

const getActivePayroll = async (
  searchParams = '',
  limit: number,
  page: number,
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${PAYROLL_URL}/payroll/find-all-payroll-by-pay-period?limit=${limit}&page=${page}${searchParams}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetActivePayroll = (
  searchParams = '',
  limit: number,
  page: number,
) =>
  useQuery(
    ['payroll', searchParams, limit, page],
    () => getActivePayroll(searchParams, limit, page),
    {
      enabled: true,
    },
  );

const getPayrollHistory = async (id = '') => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${PAYROLL_URL}/payroll/by-employee/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetPayrollHistory = (id = '') =>
  useQuery(['payroll-history', id], () => getPayrollHistory(id), {
    enabled: true,
  });

const getPayPeroid = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${PAYROLL_URL}/pay-period`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
const getPensionRule = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${PAYROLL_URL}/pension-rule`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getMonthById = async (id: string[]) => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/month/${id}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

const getSessionById = async (id: string[]) => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/session/${id}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

const getCalendars = async () => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/calendars`,
    method: 'GET',
    headers: requestHeaders,
  });
};

const getActiveMonth = async () => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/month/active/month`,
    method: 'GET',
    headers: requestHeaders,
  });
};

const getVariablePay = async (data: any) => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${OKR_URL}/vp-score-instance/filter`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

export const useGetActiveMonth = () => {
  return useQuery<any>('activeCalendar', getActiveMonth);
};
export const useGetAllCalendars = () => {
  return useQuery<any>('allCalendars', getCalendars);
};

const fetchActiveFiscalYearPayPeriods = async (
  activeFiscalYearId: string | undefined,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${PAYROLL_URL}/pay-period/get-active-pay-period/active-year-id/${activeFiscalYearId}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

export const useGetSessionById = (id: string[]) => {
  return useQuery<any>(['sessionById', id], () => getSessionById(id), {
    keepPreviousData: true,
  });
};

export const useGetMonthById = (id: string[]) => {
  return useQuery<any>(['monthById', id], () => getMonthById(id), {
    keepPreviousData: true,
  });
};
export const useGetPayPeriod = () => useQuery('pay-peroid', getPayPeroid);
export const useGetAllPensionRule = () =>
  useQuery('pension-rule', getPensionRule);

const getEmployeeInfo = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/users/simple-info/all-user-net-pay/with-tenant`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetEmployeeInfo = () =>
  useQuery('EmployeeInfo', getEmployeeInfo);

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

export const useGetVariablePay = (monthIds: any) => {
  return useQuery(['variablePay', monthIds], () => getVariablePay(monthIds), {
    keepPreviousData: true,
  });
};
