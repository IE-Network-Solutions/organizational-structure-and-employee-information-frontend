import { CarryOverRule } from '@/types/timesheet/settings';
import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_MODE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';

const createCarryOverRule = async (item: Partial<CarryOverRule>) => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_MODE_URL}/carry-over-rule`,
    method: 'POST',
    headers: requestHeader(),
    data: { item },
  });
};

const deleteCarryOverRule = async (id: string) => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_MODE_URL}/carry-over-rule`,
    method: 'DELETE',
    headers: requestHeader(),
    params: { id },
  });
};

const updateCarryOverRuleActive = async (data: {
  id: string;
  isActive: boolean;
}) => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_MODE_URL}/carry-over-rule/active`,
    method: 'POST',
    headers: requestHeader(),
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
