import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { RecognitionParams } from '.';

const getAllRecognitionTypes = async () => {
  const token = useAuthenticationStore.getState().token;
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

const getAllRecognitionTypesWithOutCriteria = async () => {
  const token = useAuthenticationStore.getState().token;
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
const getAllRecognitions = async (
  {
    searchValue,
    current,
    pageSize
  }: RecognitionParams,
) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const queryString = [
    `limit=${pageSize}`,
    `page=${current}`,
    ...Object.entries(searchValue) 
      .filter(([key, value]) => value)  
      .map(([key, value]) => `${key}=${value}`), 
  ]
    .join('&');  // Join all query parameters with '&'


    console.log(queryString,"**************************")
  return crudRequest({
    url: `${ORG_DEV_URL}/recognition?${queryString}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getRecognitionsById = async (id:string) => {
  const token = useAuthenticationStore.getState().token;
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
  const token = useAuthenticationStore.getState().token;
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

export const useGetAllRecognitionTypeWithOutCriteria = () => {
  return useQuery<any>(
    'recognitionTypesWithOutCriteria',
    getAllRecognitionTypesWithOutCriteria,
  );
};

export const useGetRecognitionById = (id:string) => {
   return useQuery<any>(
     ['recognitions',id], // Unique query key based on params
     () => getRecognitionsById(id),
   );
 };
export const useGetAllRecognition = ({
 searchValue,
  current,
  pageSize
}: RecognitionParams) => {
  return useQuery<any>(
    ['recognitions', searchValue, current, pageSize], // Unique query key based on params
    () => getAllRecognitions({ searchValue, current, pageSize }),
  );
};

