import NotificationMessage from '@/components/common/notification/notificationMessage';
import { requestHeader } from '@/helpers/requestHeader';
import { INCENTIVE_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';

const setIncentiveFormula = async (items: any) => {
  return await crudRequest({
    url: `${INCENTIVE_URL}/incentive/formula`,
    method: 'POST',
    headers: requestHeader(),
    data: { items },
  });
};

const updateIncentiveFormula = async (id: string, items: any) => {
  return await crudRequest({
    url: `${INCENTIVE_URL}/incentive/formula/${id}`,
    method: 'PUT',
    headers: requestHeader(),
    data: { items },
  });
};

const deleteIncentiveFormula = async (id: string) => {
  return await crudRequest({
    url: `${INCENTIVE_URL}/incentive/formula/${id}`,
    method: 'DELETE',
    headers: requestHeader(),
  });
};

export const useSetIncentiveFormula = () => {
  const queryClient = useQueryClient();
  return useMutation(setIncentiveFormula, {
    onSuccess: () => {
      queryClient.invalidateQueries('incentiveFormula');
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
    ({ id, items }: { id: string; items: any }) =>
      updateIncentiveFormula(id, items),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('incentiveFormula');
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
