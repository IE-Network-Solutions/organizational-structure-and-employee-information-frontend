import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { INCENTIVE_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';

const generateIncentive = async (data: any) => {
  const token = useAuthenticationStore.getState().token;
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
    onSuccess: () => {
      queryClient.invalidateQueries('incentiveFormula');
      NotificationMessage.success({
        message: 'Incentive generated successfully!',
        description: 'Incentive has been successfully generated',
      });
    },
  });
};
