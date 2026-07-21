import NotificationMessage from '@/components/common/notification/notificationMessage';
import { requestHeader } from '@/helpers/requestHeader';
import { INCENTIVE_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { invalidateIncentiveCaches } from '@/utils/invalidateRecognitionCascadeCaches';
import { useMutation, useQueryClient } from 'react-query';

const setIncentiveFormula = async (data: any) => {
  const requestHeaders = await requestHeader();
  const payload = Array.isArray(data?.formulas) ? data : { formulas: [data] };
  return await crudRequest({
    url: `${INCENTIVE_URL}/incentive-formulas/bulk`,
    method: 'POST',
    headers: requestHeaders,
    data: payload,
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
      const formulas = variables?.formulas ?? [variables];
      formulas.forEach((formula: { recognitionTypeId?: string }) => {
        if (formula?.recognitionTypeId) {
          queryClient.invalidateQueries([
            'incentiveFormula',
            formula.recognitionTypeId,
          ]);
        }
      });
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

const deleteIncentive = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${INCENTIVE_URL}/incentives/${id}`,
    method: 'DELETE',
    headers: requestHeaders,
  });
};

const deleteBulkIncentives = async (ids: string[]) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${INCENTIVE_URL}/incentives/bulk-delete`,
    method: 'DELETE',
    headers: requestHeaders,
    data: { ids },
  });
};

export const useDeleteIncentive = () => {
  const queryClient = useQueryClient();
  return useMutation(({ id }: { id: string }) => deleteIncentive(id), {
    onSuccess: () => {
      void invalidateIncentiveCaches(queryClient);
      NotificationMessage.success({
        message: 'Incentive deleted successfully!',
        description: 'Incentive record has been successfully deleted',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Delete failed',
        description: 'Failed to delete incentive record. Please try again.',
      });
    },
  });
};

export const useDeleteBulkIncentives = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ ids }: { ids: string[] }) => deleteBulkIncentives(ids),
    {
      onSuccess: () => {
        void invalidateIncentiveCaches(queryClient);
        NotificationMessage.success({
          message: 'Incentives deleted successfully!',
          description:
            'Selected incentive records have been successfully deleted',
        });
      },
      onError: () => {
        NotificationMessage.error({
          message: 'Delete failed',
          description: 'Failed to delete incentive records. Please try again.',
        });
      },
    },
  );
};
