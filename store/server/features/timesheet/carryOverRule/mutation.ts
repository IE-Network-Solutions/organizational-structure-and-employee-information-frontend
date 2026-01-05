import { CarryOverRule } from '@/types/timesheet/settings';
import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';

const createCarryOverRule = async (item: Partial<CarryOverRule>) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/carry-over-rule`,
    method: 'POST',
    headers: requestHeaders,
    data: { item },
  });
};

const deleteCarryOverRule = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/carry-over-rule`,
    method: 'DELETE',
    headers: requestHeaders,
    params: { id },
  });
};

const updateCarryOverRuleActive = async (data: {
  id: string;
  isActive: boolean;
}) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/carry-over-rule/active`,
    method: 'POST',
    headers: requestHeaders,
    params: { id: data.id },
    data: { isActive: data.isActive },
  });
};

export const useCreateCarryOverRule = () => {
  const queryClient = useQueryClient();
  return useMutation(createCarryOverRule, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('carry-over-rule');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useDeleteCarryOverRule = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteCarryOverRule, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('carry-over-rule');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useUpdateCarryOverRuleActive = () => {
  const queryClient = useQueryClient();
  return useMutation(updateCarryOverRuleActive, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('carry-over-rule');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
