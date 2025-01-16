import { requestHeader } from '@/helpers/requestHeader';
import { INCENTIVE_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
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

export const useSetIncentiveFormula = (items: any) => {
  const queryClient = useQueryClient();
  return useMutation(setIncentiveFormula, {
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('incentiveFormula');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useUpdateIncentiveFormula = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, items }: { id: string; items: any }) =>
      updateIncentiveFormula(id, items),
    {
      onSuccess: (_, variables: any) => {
        queryClient.invalidateQueries('incentiveFormula');
        const method = variables?.method?.toUpperCase();
        handleSuccessMessage(method);
      },
    },
  );
};

export const useDeleteIncentiveFormula = () => {
  const queryClient = useQueryClient();
  return useMutation(({ id }: { id: string }) => deleteIncentiveFormula(id), {
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('incentiveFormula');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
