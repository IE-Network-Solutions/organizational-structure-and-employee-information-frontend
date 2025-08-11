import { ORG_DEV_URL } from '@/utils/constants';
import { useQuery } from 'react-query';
import { crudRequest } from '@/utils/crudRequest';
import { requestHeader } from '@/helpers/requestHeader';

const getEmployeeSurvey = async (
  userId: string | null,
  monthId: string | null,
  departmentId: string | null,
  page: number,
  currentPage: number,
) => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${ORG_DEV_URL}/survey-target-score/filtered-data/vp-score?page=${currentPage}&limit=${page}`,
    method: 'POST',
    headers: requestHeaders,
    data: {
      userId,
      departmentId,
      monthId,
    },
  });
};

export const useGetEmployeeSurvey = (
  userId: string | null,
  monthId: string | null,
  departmentId: string | null,
  page: number,
  currentPage: number,
) =>
  useQuery<any>(
    ['survey-target-score', userId, monthId, departmentId, page, currentPage],
    () => getEmployeeSurvey(userId, monthId, departmentId, page, currentPage),
  );
