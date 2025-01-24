import { requestHeader } from '@/helpers/requestHeader';
import { INCENTIVE_URL, PAYROLL_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { FiscalYearResponseData } from './interface';

const fetchPayPeriod = async () => {
  return await crudRequest({
    url: `${PAYROLL_URL}/pay-period`,
    method: 'GET',
    headers: requestHeader(),
  });
};

const fetchProjectIncentiveData = async (
  employeeName: string,
  project: string,
  recognition: string,
  year: string,
  session: string,
) => {
  return await crudRequest({
    url: `${INCENTIVE_URL}/incentive?employee_name=${employeeName}&project=${project}&recognition=${recognition}&year=${year}&&sessions=${session}`,
    // url: 'https://mocki.io/v1/5fe0076e-72f0-4e89-a30b-0d296b5bd123',
    method: 'GET',
    headers: requestHeader(),
  });
};

const fetchProjectIncentiveDataByID = async (projectId: string) => {
  return await crudRequest({
    url: `${INCENTIVE_URL}/incentive/${projectId}`,
    // url: 'https://mocki.io/v1/c4e934a6-27b5-4ccb-a83d-bd8f7ae9d294',
    method: 'GET',
    headers: requestHeader(),
  });
};

export const useFetchAllPayPeriod = () => {
  return useQuery<FiscalYearResponseData>('getAllPayPeriod', fetchPayPeriod);
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
export const useGetAllIncentiveData = (projectId: string) => {
  return useQuery<any>(['getProjectIncentiveData', projectId], () =>
    fetchProjectIncentiveDataByID(projectId),
  );
};
