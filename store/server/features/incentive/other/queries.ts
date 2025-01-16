import { requestHeader } from '@/helpers/requestHeader';
import { INCENTIVE_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

const fetchAllIncentiveData = async (
  employee_name: string,
  year: string,
  session: string,
  month: string,
) => {
  return await crudRequest({
    // url: `${INCENTIVE_URL}/incentive?employee_name=${employee_name}&&year=${year}&&sessions=${session}&&month=${month}  `,
    url: 'https://mocki.io/v1/5fe0076e-72f0-4e89-a30b-0d296b5bd123',
    method: 'GET',
    headers: requestHeader(),
  });
};

const fetchProjectIncentiveData = async (
  employee_name: string,
  project: string,
  recognition: string,
  year: string,
  session: string,
) => {
  return await crudRequest({
    url: `${INCENTIVE_URL}/incentive?employee_name=${employee_name}&&project=${project}&&recognition=${recognition}&&year=${year}&&session=${session}   `,
    // url: 'https://mocki.io/v1/c4e934a6-27b5-4ccb-a83d-bd8f7ae9d294',
    method: 'GET',
    headers: requestHeader(),
  });
};

export const useGetProjectIncentiveData = (
  employee_name: string,
  project: string,
  recognition: string,
  year: string,
  session: string,
) => {
  return useQuery<any>(
    ['getAllIncentiveData', employee_name, project, recognition, year, session],
    () =>
      fetchProjectIncentiveData(
        employee_name,
        project,
        recognition,
        year,
        session,
      ),
  );
};
export const useGetAllIncentiveData = (
  employee_name: string,
  year: string,
  session: string,
  month: string,
) => {
  return useQuery<any>(
    ['getAllIncentiveData', employee_name, year, session, month],
    () => fetchAllIncentiveData(employee_name, year, session, month),
  );
};
