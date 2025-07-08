import { ORG_DEV_URL } from '@/utils/constants';
import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import axios from 'axios';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;

const getEmployeeSurvey = async (
  userId: string | null,
  monthId: string | null,
  departmentId: string | null,
  page: number,
  currentPage: number,
) => {
  try {
    const response = await axios.post(
      `${ORG_DEV_URL}/survey-target-score/filtered-data/vp-score?page=${currentPage}&limit=${page}`,
      {
        userId,
        departmentId,
        monthId,
      }, // merged into one object
      {
        headers: {
          Authorization: `Bearer ${token}`,
          tenantId: tenantId,
        },
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
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
