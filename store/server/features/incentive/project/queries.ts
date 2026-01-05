import { requestHeader } from '@/helpers/requestHeader';
import { INCENTIVE_URL, ORG_AND_EMP_URL, PAYROLL_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { FiscalYearResponseData } from './interface';

const fetchPayPeriod = async () => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${PAYROLL_URL}/pay-period`,
    method: 'GET',
    headers: requestHeaders,
  });
};

const fetchIncentiveTemplate = async () => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${PAYROLL_URL}/incentive-criteria/import/template`,
    method: 'GET',
    headers: requestHeaders,
  });
};

const fetchProjectIncentiveData = async (
  employeeName: string,
  project: string,
  recognition: string,
  year: string,
  session: string,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${INCENTIVE_URL}/incentive?employee_name=${employeeName}&project=${project}&recognition=${recognition}&year=${year}&&sessions=${session}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

const fetchProjectIncentiveDataByID = async (projectId: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${INCENTIVE_URL}/incentive/${projectId}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

const fetchIncentiveSessions = async () => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/session`,
    method: 'GET',
    headers: requestHeaders,
  });
};

export const useFetchIncentiveSessions = () => {
  return useQuery<any>('getIncentiveSessions', fetchIncentiveSessions);
};

export const useFetchAllPayPeriod = () => {
  return useQuery<FiscalYearResponseData>('getAllPayPeriod', fetchPayPeriod);
};
export const useFetchIncentiveTemplate = () => {
  return useQuery<any>('getIncentiveTemplate', fetchIncentiveTemplate);
};
export const useGetProjectIncentiveData = (
  employeeName: string,
  project: string,
  recognition: string,
  year: string,
  session: string,
) => {
  return useQuery<any>(
    ['getAllIncentiveData', employeeName, project, recognition, year, session],
    () =>
      fetchProjectIncentiveData(
        employeeName,
        project,
        recognition,
        year,
        session,
      ),
  );
};
export const useGetAllIncentiveDatas = (projectId: string) => {
  return useQuery<any>(['getProjectIncentiveData', projectId], () =>
    fetchProjectIncentiveDataByID(projectId),
  );
};
