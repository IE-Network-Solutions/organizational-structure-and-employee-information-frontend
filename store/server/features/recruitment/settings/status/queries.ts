import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useRecruitmentStatusStore } from '@/store/uistate/features/recruitment/settings/status';
import { RECRUITMENT_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

const getRecruitmentStatuses = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const statusCurrentPage =
    useRecruitmentStatusStore.getState().statusCurrentPage;
  const statusPageSize = useRecruitmentStatusStore.getState().statusPageSize;

  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };

  return await crudRequest({
    url: `${RECRUITMENT_URL}/applicant-status-stages?limit=${statusPageSize}&&page=${statusCurrentPage}`,
    method: 'GET',
    headers,
  });
};

export const useGetRecruitmentStatuses = () => {
  return useQuery('recruitmentStatuses', getRecruitmentStatuses);
};
