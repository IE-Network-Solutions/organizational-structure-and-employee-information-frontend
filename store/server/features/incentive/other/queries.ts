import { requestHeader } from '@/helpers/requestHeader';
import { INCENTIVE_URL, ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

const fetchAllIncentiveData = async (
  employeeName: string,
  year: string,
  session: string | string[], // Accepts both string and array
  month: string,
  page: number,
  current: number,
) => {
  // Ensure session is always an array and convert it to a proper query format

  return await crudRequest({
    url: `${INCENTIVE_URL}/incentives/get-all-incentives?limit=${page}&page=${current}`,
    method: 'POST',
    headers: requestHeader(),
    data: {
      userId: employeeName,
      year: year,
      sessionId: session ?? [],
      monthId: month,
      // limit: page,
      // page: current,
    },
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

const fetchRecognitionTypeByParentId = async (parentId: string) => {
  return await crudRequest({
    url: `${ORG_DEV_URL}/recognition-type/childe-recognition-type/child/${parentId}`,
    method: 'GET',
    headers: requestHeader(),
  });
};
const fetchParentRecognition = async () => {
  return await crudRequest({
    url: `${ORG_DEV_URL}/recognition-type/parent-recognition-type/parent`,
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
    url: `${ORG_DEV_URL}/recognition-criterias/all-criteria`,
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

export const useParentRecognition = () => {
  return useQuery<any>('parentRecognition', fetchParentRecognition);
};
export const useRecognitionByParentId = (recognitionTypeId: string) => {
  return useQuery<any>(['childRecognition', recognitionTypeId], () =>
    fetchRecognitionTypeByParentId(recognitionTypeId),
  );
};
export const useIncentiveFormulaByRecognitionId = (
  recognitionTypeId: string,
) => {
  return useQuery<any>(['incentiveFormula', recognitionTypeId], () =>
    fetchIncentiveFormula(recognitionTypeId),
  );
};

export const useAllRecognition = () => {
  return useQuery<any>('getAllRecognition', fetchAllRecognition);
};

export const useRecognitionById = (recognitionId: string) => {
  return useQuery<any>(['recognitionById', recognitionId], () =>
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
  page: number,
  current: number,
) => {
  return useQuery<any>(
    ['getAllIncentiveData', employeeName, year, session, month, page, current],
    () =>
      fetchAllIncentiveData(employeeName, year, session, month, page, current),
  );
};
