import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { OKR_URL, ORG_AND_EMP_URL, PAYROLL_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';

const getPayRoll = async () => {
  const token = useAuthenticationStore.getState().token;
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
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/basic-salary/active`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetAllActiveBasicSalary = () =>
  useQuery('allBasicSalary', getAllActiveBasicSalary);

const getActivePayroll = async (searchParams = '') => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${PAYROLL_URL}/payroll/find-all-payroll-by-pay-period${searchParams}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetActivePayroll = (searchParams = '') =>
  useQuery(['payroll', searchParams], () => getActivePayroll(searchParams), {
    enabled: true,
  });

const getPayPeroid = async () => {
  const token = useAuthenticationStore.getState().token;
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
  const token = useAuthenticationStore.getState().token;
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
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/month/${id}`,
    method: 'GET',
    headers: requestHeader(),
  });
};

const getSessionById = async (id: string[]) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/session/${id}`,
    method: 'GET',
    headers: requestHeader(),
  });
};

const getCalendars = async () => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/calendars`,
    method: 'GET',
    headers: requestHeader(),
  });
};

const getActiveMonth = async () => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/month/active/month`,
    method: 'GET',
    headers: requestHeader(),
  });
};

const getVariablePay = async (data: any) => {
  return crudRequest({
    url: `${OKR_URL}/vp-score-instance/filter`,
    method: 'POST',
    headers: requestHeader(),
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
  return await crudRequest({
    url: `${PAYROLL_URL}/pay-period/get-active-pay-period/active-year-id/${activeFiscalYearId}`,
    method: 'GET',
    headers: requestHeader(),
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
  const token = useAuthenticationStore.getState().token;
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

export const useGetVariablePay = (monthIds: string[]) => {
  return useQuery(['variablePay', monthIds], () => getVariablePay(monthIds), {
    keepPreviousData: true,
  });
};
