import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { RECRUITMENT_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

const getRecruitmentStatuses = async (
  pageSize: number,
  currentPage: number,
) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };

  return await crudRequest({
    url: `${RECRUITMENT_URL}/applicant-status-stages?limit=${pageSize}&&page=${currentPage}`,
    method: 'GET',
    headers,
  });
};

export const useGetRecruitmentStatuses = (
  pageSize: number,
  currentPage: number,
) => {
  return useQuery(['recruitmentStatuses', pageSize, currentPage], () =>
    getRecruitmentStatuses(pageSize, currentPage),
  );
};
