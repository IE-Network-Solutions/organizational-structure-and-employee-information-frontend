import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_URL, ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

const getVpScore = async (id: number | string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${OKR_URL}/vp-score-instance/score/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getCriteriaByFilter = async (data: any, selectedRange: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${OKR_URL}/vp-score-instance/score/target?selectedRange=${selectedRange}`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
    data,
  });
};

const getLineGraphData = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${OKR_URL}/vp-score-instance/by-user/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getMonthById = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/month/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getAllMonth = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/month`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

export const useGetVPLineGraphData = (userId: string) => {
  return useQuery<any>(
    ['VPLineGraph', userId],
    () => getLineGraphData(userId),
    {
      keepPreviousData: true,
    },
  );
};
export const useGetAllMonth = () => {
  return useQuery<any>('getAllMonth', getAllMonth, {
    keepPreviousData: true,
  });
};

export const useGetVPScore = (userId: number | string) => {
  return useQuery<any>(['VPScores', userId], () => getVpScore(userId), {
    keepPreviousData: true,
  });
};

export const useGetCriteriaByFilter = (data: any, selectedRange: string) => {
  return useQuery<any>(
    ['CriteriaByFilter', data, selectedRange],
    () => getCriteriaByFilter(data, selectedRange),
    {
      keepPreviousData: true,
    },
  );
};

export const useGetMonthById = (id: string) => {
  return useQuery<any>(['monthById', id], () => getMonthById(id), {
    keepPreviousData: true,
  });
};

export const fetchMonthById = async (id: string) => {
  const response = await fetch(`/api/months/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch month name');
  }
  const data = await response.json();
  return data.name;
};
