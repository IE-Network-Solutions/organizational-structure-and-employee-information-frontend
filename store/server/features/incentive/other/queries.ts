import { requestHeader } from '@/helpers/requestHeader';
import { INCENTIVE_URL, ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

const fetchAllIncentiveData = async (
  employeeName: string,
  year: string,
  session: string,
  month: string,
) => {
  return await crudRequest({
    url: `${INCENTIVE_URL}/incentive?employee_name=${employeeName}&&year=${year}&&sessions=${session}&&month=${month}  `,
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
    url: `${INCENTIVE_URL}/incentive?employee_name=${employeeName}&&project=${project}&&recognition=${recognition}&&year=${year}&&session=${session}`,
    // url: 'https://mocki.io/v1/c4e934a6-27b5-4ccb-a83d-bd8f7ae9d294',
    method: 'GET',
    headers: requestHeader(),
  });
};

const fetchAllRecognition = async () => {
  return await crudRequest({
    url: `${ORG_DEV_URL}/recognition`,
    method: 'GET',
    headers: requestHeader(),
  });
};
const fetchRecognitionById = async (recognitionId: string) => {
  return await crudRequest({
    url: `${ORG_DEV_URL}/recognition/${recognitionId}`,
    method: 'GET',
    headers: requestHeader(),
  });
};

const fetchIncentiveCriteria = async () => {
  return await crudRequest({
    url: `${INCENTIVE_URL}/incentive-criteria`,
    method: 'GET',
    headers: requestHeader(),
  });
};

const fetchIncentiveFormula = async (recognitionTypeId: string) => {
  return await crudRequest({
    url: `${INCENTIVE_URL}/incentive-formulas/recognition-type/${recognitionTypeId}`,
    method: 'GET',
    headers: requestHeader(),
  });
};

export const useIncentiveFormulaByRecognitionId = (
  recognitionTypeId: string,
) => {
  return useQuery<any>(['incentiveFormula', recognitionTypeId], () =>
    fetchIncentiveFormula(recognitionTypeId),
  );
};

export const useAllRecognition = () => {
  return useQuery('getAllRecognition', fetchAllRecognition);
};

export const useRecognitionById = (recognitionId: string) => {
  return useQuery<any>(['incentiveFormula', recognitionId], () =>
    fetchRecognitionById(recognitionId),
  );
};

export const useIncentiveCriteria = () => {
  return useQuery<any>('incentiveCriteria', fetchIncentiveCriteria);
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
export const useGetAllIncentiveData = (
  employeeName: string,
  year: string,
  session: string,
  month: string,
) => {
  return useQuery<any>(
    ['getAllIncentiveData', employeeName, year, session, month],
    () => fetchAllIncentiveData(employeeName, year, session, month),
  );
};
