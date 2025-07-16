import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { getCurrentToken } from '@/utils/getCurrentToken';

const getCriteriaTargets = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${OKR_AND_PLANNING_URL}/vp-criteria`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetCriteriaTargets = () =>
  useQuery('criteriaTarget', getCriteriaTargets);

const fetchVpScoring = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${OKR_AND_PLANNING_URL}/vp-scoring`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useFetchVpScoring = () =>
  useQuery('VpScoringInformation', fetchVpScoring);

const fetchVpScoringById = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${OKR_AND_PLANNING_URL}/vp-scoring/${id}`, // Added the ID to the URL
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useFetchVpScoringById = (id: string) =>
  useQuery(['VpScoringInformation', id], () => fetchVpScoringById(id), {
    enabled: !!id,
  });
