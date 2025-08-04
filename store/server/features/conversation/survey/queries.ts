import { ORG_DEV_URL } from '@/utils/constants';
import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import axios from 'axios';
import { getCurrentToken } from '@/utils/getCurrentToken';

// const token = await getCurrentToken();
const tenantId = useAuthenticationStore.getState().tenantId;
// const logUserId = useAuthenticationStore.getState().userId;

const getEmployeeSurvey = async (
  userId: string | null,
  monthId: string | null,
  departmentId: string | null,
  page: number,
  currentPage: number,
) => {
  const token = await getCurrentToken();
  try {
    const response = await axios.post(
      `${ORG_DEV_URL}/survey-target-score/filtered-data/vp-score?page=${currentPage}&limit=${page}`,
      {
        userId,
        departmentId,
        monthId,
        // updatedBy: logUserId,
        // createdBy: logUserId,
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
