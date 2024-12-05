import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

interface Dashboard {
  daysLeft: number;
  okrCompleted: number;
  userOkr: number;
  teamOkr: number;
  companyOkr: number;
  keyResultCount: number;
  supervisorOkr?: number;
}

type ResponseData = Dashboard;

const getVpScore = async (id: number | string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${OKR_URL}/user-vp-scoring/user-vp-scoring-by-user/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

export const useGetVPScore = (userId: number | string) => {
  return useQuery<any>(['VPScores', userId], () => getVpScore(userId), {
    keepPreviousData: true,
  });
};
