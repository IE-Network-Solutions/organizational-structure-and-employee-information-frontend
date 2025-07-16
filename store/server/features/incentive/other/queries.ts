import { requestHeader } from '@/helpers/requestHeader';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { INCENTIVE_URL, ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useQuery } from 'react-query';

const fetchAllIncentiveData = async (
  employeeName: string,
  year: string,
  session: string | string[],
  month: string,
  page: number,
  current: number,
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${INCENTIVE_URL}/incentives/get-all-incentives?limit=${page}&page=${current}`,
    method: 'POST',
    headers,
    data: {
      userId: employeeName,
      year: year,
      sessionId: session,
      monthId: month,
    },
  });
};

const fetchProjectIncentiveData = async (
  recognitionsTypeId: string,
  employeeName: string,
  year: string,
  session: string | string[],
  month: string,
  page: number,
  current: number,
) => {
  return await crudRequest({
    url: `${INCENTIVE_URL}/incentives/all/${recognitionsTypeId}?limit=${page}&page=${current}`,
    method: 'POST',
    headers: requestHeader(),
    data: {
      userId: employeeName,
      year: year,
      sessionId: session ?? [],
      monthId: month,
    },
  });
};

const fetchAllRecognition = async () => {
  return await crudRequest({
    url: `${ORG_DEV_URL}/recognition`,
    method: 'GET',
    headers: requestHeader(),
  });
};
const fetchUserDetail = async () => {
  return await crudRequest({
    url: `${INCENTIVE_URL}/incentives/get-incentive/group-by-session`,
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
const fetchAllChildrenRecognition = async () => {
  return await crudRequest({
    url: `${ORG_DEV_URL}/recognition-type/childe-recognition-type/child`,
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
    url: `${ORG_DEV_URL}/recognition-type/${recognitionId}`,
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

const fetchIncentiveFormula = async (recognitionTypeId: string | undefined) => {
  return await crudRequest({
    url: `${INCENTIVE_URL}/incentive-formulas/recognition-type/${recognitionTypeId}`,
    method: 'GET',
    headers: requestHeader(),
  });
};

export const useAllChildrenRecognition = () => {
  return useQuery<any>('allChildRecognition', fetchAllChildrenRecognition);
};
export const useUserDetail = () => {
  return useQuery<any>('useDetail', fetchUserDetail);
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
  recognitionTypeId: string | undefined,
) => {
  return useQuery<any>(
    ['incentiveFormula', recognitionTypeId],
    () => fetchIncentiveFormula(recognitionTypeId),
    {
      enabled: !!recognitionTypeId, // Only run when recognitionTypeId is truthy
    },
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

export const useGetIncentiveDataByRecognitionId = (
  recognitionsTypeId: string,
  employeeName: string,
  year: string,
  session: string,
  month: string,
  page: number,
  current: number,
) => {
  return useQuery<any>(
    [
      'getAllIncentiveData',
      recognitionsTypeId,
      employeeName,
      year,
      session,
      month,
      page,
      current,
    ],
    () =>
      fetchProjectIncentiveData(
        recognitionsTypeId,
        employeeName,
        year,
        session,
        month,
        page,
        current,
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
