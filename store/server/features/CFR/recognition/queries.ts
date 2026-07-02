import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { RecognitionParams } from '.';
import { getCurrentToken } from '@/utils/getCurrentToken';
const getAllRecognitionTypes = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/recognition-type/parent`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
const getAllCriteria = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/criterias`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
const getAllRecognitionTypesChild = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/recognition-type/childe-recognition-type/child/`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
const getRecognitionTypeParentChildById = async (parentId: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/recognition-type/childe-recognition-type/child/${parentId}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getRecognitionTypeChildById = async (
  id: string,
  pageSize: number,
  current: number,
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/recognition-type/childe-recognition-type/child/${id}/paginated?limit=${pageSize}&page=${current}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
const getAllRecognitionData = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/recognition-type`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
const getTotalRecognition = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/recognition/TotalRecognitions`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getRecognitionTypeDashboardStats = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/recognition-type/dashboard/stats`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getAllRecognitionTypesWithOutCriteria = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/recognition`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
const getPersonalRecognition = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const userId = useAuthenticationStore.getState().userId;
  return crudRequest({
    url: `${ORG_DEV_URL}/feedback-stats/${userId}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
const getAllRecognitions = async ({
  searchValue,
  current,
  pageSize,
}: RecognitionParams) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const queryString = [
    `limit=${pageSize}`,
    `page=${current}`,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ...Object.entries(searchValue)
      .filter(([notused, value]) => value) // eslint-disable-line @typescript-eslint/no-unused-vars
      .map(([key, value]) => `${key}=${value}`),
  ].join('&'); // Join all query parameters with '&'

  return crudRequest({
    url: `${ORG_DEV_URL}/recognition?${queryString}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getRecognitionsById = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${ORG_DEV_URL}/recognition/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getRecognitionTypeById = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/recognition-type/parent/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetRecognitionTypeParentChildById = (id: string) => {
  return useQuery<any>(
    ['recognitionTypeParentChild', id],
    () => getRecognitionTypeParentChildById(id as string),
    {
      enabled: id ? true : false,
      keepPreviousData: false,
    },
  );
};

const getRecognitionTypeParentWithChildren = async (
  searchString: string,
  pageSize: number,
  current: number,
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  // Construct query string safely, ensuring parentRecognitionId is not null/undefined
  const queryStringParts = [`limit=${pageSize}`, `page=${current}`];

  if (searchString !== null) {
    // If parentRecognitionId is provided, add it as a query param
    queryStringParts.push(`searchString=${searchString}`);
  }

  const queryString = queryStringParts.join('&');

  return crudRequest({
    url: `${ORG_DEV_URL}/recognition-type/parents/with-children?${queryString}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

export interface ByParentRecognitionTypeParams {
  parentRecognitionTypeId: string;
  calendarId: string;
  sessionId: string;
  monthId: string;
  recognitionTypeId: string;
  userId: string;
  pageSize: number;
  current: number;
}

const getRecognitionsByParentRecognitionType = async (
  params: ByParentRecognitionTypeParams,
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const queryString = [
    `parentRecognitionTypeId=${params.parentRecognitionTypeId}`,
    `calendarId=${params.calendarId}`,
    `sessionId=${params.sessionId}`,
    `monthId=${params.monthId}`,
    `recognitionTypeId=${params.recognitionTypeId}`,
    `userId=${params.userId}`,
    `limit=${params.pageSize}`,
    `page=${params.current}`,
  ].join('&');

  return crudRequest({
    url: `${ORG_DEV_URL}/recognition/by-parent-recognition-type?${queryString}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

export const useGetRecognitionsByParentRecognitionType = (
  params: ByParentRecognitionTypeParams | null,
) => {
  return useQuery<any>(
    ['recognitionsByParentRecognitionType', params],
    () =>
      getRecognitionsByParentRecognitionType(
        params as ByParentRecognitionTypeParams,
      ),
    {
      enabled: !!params?.parentRecognitionTypeId,
      keepPreviousData: true,
    },
  );
};

/** Same filters as the detail table, large page for select-all / bulk ids (refetch on demand). */
export const useGetAllRecognitionIdsByParentType = (
  params: ByParentRecognitionTypeParams | null,
  enabled = false,
) => {
  const fetchParams: ByParentRecognitionTypeParams | null = params
    ? {
        ...params,
        current: 1,
        pageSize: 10000,
      }
    : null;

  return useQuery<any>(
    ['allRecognitionIdsByParentType', fetchParams],
    () =>
      getRecognitionsByParentRecognitionType(
        fetchParams as ByParentRecognitionTypeParams,
      ),
    {
      enabled: enabled && !!fetchParams?.parentRecognitionTypeId,
      keepPreviousData: false,
    },
  );
};

export const useGetRecognitionTypeById = (id: string | null) => {
  return useQuery<any>(
    ['recognitionTypes', id],
    () => getRecognitionTypeById(id as string), // Type assertion since `enabled` ensures `id` is valid
    {
      enabled: !!id && id.trim() !== '', // Check id is not null and not an empty string
      keepPreviousData: false,
    },
  );
};
export const useGetAllRecognitionType = () => {
  return useQuery<any>('recognitionTypes', getAllRecognitionTypes);
};
export const useGetAllCriteria = () => {
  return useQuery<any>('criteria', getAllCriteria);
};
export const useGetAllRecognitionTypeChild = () => {
  return useQuery<any>('recognitionTypesChild', getAllRecognitionTypesChild);
};

export const useGetRecognitionTypeChildById = (
  id: string | null,
  pageSize: number,
  current: number,
) => {
  return useQuery<any>(
    ['recognitionTypeChild', id, pageSize, current],
    () => getRecognitionTypeChildById(id as string, pageSize, current),
    {
      enabled: id ? true : false,
      keepPreviousData: false,
    },
  );
};

export const useGetAllRecognitionData = () => {
  return useQuery<any>('recognitionTypes', getAllRecognitionData);
};

export const useGetTotalRecognition = () => {
  return useQuery<any>('totalRecognition', getTotalRecognition);
};

export const useGetRecognitionTypeDashboardStats = () => {
  return useQuery<any>(
    'recognitionTypeDashboardStats',
    getRecognitionTypeDashboardStats,
  );
};

export const useGetRecognitionTypeParentWithChildren = (
  searchCategory: string | null,
  pageSize: number,
  current: number,
) => {
  return useQuery<any>(
    ['recognitionTypeParentWithChildren', searchCategory, current, pageSize],
    () =>
      getRecognitionTypeParentWithChildren(
        searchCategory as string,
        pageSize,
        current,
      ),
  );
};

export const useGetAllRecognitionTypeWithOutCriteria = () => {
  return useQuery<any>(
    'recognitionTypesWithOutCriteria',
    getAllRecognitionTypesWithOutCriteria,
  );
};
export const useGetPersonalRecognition = () => {
  return useQuery<any>('personalRecognition', getPersonalRecognition);
};

export const useGetRecognitionById = (id: string) => {
  return useQuery<any>(
    ['recognitions', id], // Unique query key based on params
    () => getRecognitionsById(id),
    {
      enabled: !!id,
    },
  );
};
export const useGetAllRecognition = ({
  searchValue,
  current,
  pageSize,
}: RecognitionParams) => {
  return useQuery<any>(
    ['recognitions', searchValue, current, pageSize], // Unique query key based on params
    () => getAllRecognitions({ searchValue, current, pageSize }),
  );
};
