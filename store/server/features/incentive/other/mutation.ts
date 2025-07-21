import NotificationMessage from '@/components/common/notification/notificationMessage';
import { requestHeader } from '@/helpers/requestHeader';
import { INCENTIVE_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';

const setIncentiveFormula = async (data: any) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${INCENTIVE_URL}/incentive-formulas`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

const updateIncentiveFormula = async (id: string, data: any) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${INCENTIVE_URL}/incentive-formulas/${id}`,
    method: 'PUT',
    data,
    headers: requestHeaders,
  });
};

const deleteIncentiveFormula = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${INCENTIVE_URL}/incentive-formulas/${id}`,
    method: 'DELETE',
    headers: requestHeaders,
  });
};

export const useSetIncentiveFormula = () => {
  const queryClient = useQueryClient();
  return useMutation(setIncentiveFormula, {
    onSuccess: (nonused, variables) => {
      queryClient.invalidateQueries([
        'incentiveFormula',
        variables.recognitionTypeId,
      ]);
      NotificationMessage.success({
        message: 'Incentive formula created successfully!',
        description: 'Incentive formula has been successfully created',
      });
    },
  });
};

export const useUpdateIncentiveFormula = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, data }: { id: string; data: any }) =>
      updateIncentiveFormula(id, data),
    {
      onSuccess: (nonused, variables) => {
        // This is the correct key!
        queryClient.invalidateQueries([
          'incentiveFormula',
          variables.data.recognitionTypeId,
        ]);
        NotificationMessage.success({
          message: 'Incentive formula updated successfully!',
          description: 'Incentive formula has been successfully updated',
        });
      },
    },
  );
};

export const useDeleteIncentiveFormula = () => {
  const queryClient = useQueryClient();
  return useMutation(({ id }: { id: string }) => deleteIncentiveFormula(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('incentiveFormula');
      NotificationMessage.success({
        message: 'Incentive formula deleted successfully!',
        description: 'Incentive formula has been successfully deleted',
      });
    },
  });
};
