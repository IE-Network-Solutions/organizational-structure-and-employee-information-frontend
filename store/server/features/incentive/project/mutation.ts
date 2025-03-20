import NotificationMessage from '@/components/common/notification/notificationMessage';
import { requestHeader } from '@/helpers/requestHeader';
import { INCENTIVE_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';

const generateIncentive = async (data: any) => {
  return await crudRequest({
    url: `${INCENTIVE_URL}/incentives/generate/incentive`,
    method: 'POST',
    headers: requestHeader(),
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
