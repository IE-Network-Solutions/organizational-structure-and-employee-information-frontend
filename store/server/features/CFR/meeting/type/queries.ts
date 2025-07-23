import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { getCurrentToken } from '@/utils/getCurrentToken';

const getAllMeetingType = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/meeting-type`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
const getMeetingType = async (pageSizeType: number, currentType: number) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/meeting-type?limit=${pageSizeType}&page=${currentType}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getMeetingTypeById = async (id: string | null) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/meeting-type/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetMeetingTypeById = (id: string | null) => {
  return useQuery<any>(
    ['meeting-types', id], // Unique query key based on params
    () => getMeetingTypeById(id),
    {
      enabled: !!id, // Ensures id is truthy and not null or empty
    },
  );
};
export const useGetMeetingType = (
  pageSizeType: number,
  currentType: number,
) => {
  return useQuery<any>(
    ['meeting-types', pageSizeType, currentType], // Unique query key based on params
    () => getMeetingType(pageSizeType, currentType),
  );
};
export const useGetAllMeetingType = () => {
  return useQuery<any>(
    'meeting-types', // Unique query key based on params
    () => getAllMeetingType(),
  );
};
