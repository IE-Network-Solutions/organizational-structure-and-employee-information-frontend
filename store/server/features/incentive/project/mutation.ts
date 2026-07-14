import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { INCENTIVE_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useMutation, useQueryClient } from 'react-query';

const generateIncentive = async (data: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${INCENTIVE_URL}/incentives/generate/incentive`,
    method: 'POST',
    headers,
    data,
  });
};

export const useGenerateIncentive = () => {
  const queryClient = useQueryClient();
  return useMutation(generateIncentive, {
    onSuccess: async () => {
      const refetchOpts = { refetchActive: true, refetchInactive: false };
      await Promise.all([
        queryClient.invalidateQueries(['getAllIncentiveData'], refetchOpts),
        queryClient.invalidateQueries(['allIncentiveIds'], refetchOpts),
        queryClient.invalidateQueries('incentiveFormula', refetchOpts),
        queryClient.invalidateQueries('allIncentiveCards', refetchOpts),
        queryClient.invalidateQueries('useDetail', refetchOpts),
      ]);
      NotificationMessage.success({
        message: 'Incentive generated successfully!',
        description: 'Incentive has been successfully generated',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Incentive generation failed!',
        description: 'Incentive generation failed',
      });
    },
  });
};
