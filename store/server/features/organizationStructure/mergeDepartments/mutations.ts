import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import { MergingDepartment } from './interface';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { getCurrentToken } from '@/utils/getCurrentToken';

const token = await getCurrentToken();
const tenantId = useAuthenticationStore.getState().tenantId;
const headers = {
  tenantId: tenantId,
  Authorization: `Bearer ${token}`,
};

const transferDepartment = async (data: MergingDepartment) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/users/department/dissolve`,
    method: 'POST',
    headers,
    data,
  });
};

export const useTransferDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation((data: MergingDepartment) => transferDepartment(data), {
    onSuccess: () => {
      queryClient.invalidateQueries('orgcharts');
      handleSuccessMessage('Departments merged successfully');
    },
  });
};

const mergingDepartment = async (data: MergingDepartment) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/users/department/merge`,
    method: 'POST',
    headers,
    data,
  });
};

export const useMergingDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation((data: MergingDepartment) => mergingDepartment(data), {
    onSuccess: () => {
      queryClient.invalidateQueries('orgcharts');
      handleSuccessMessage('Departments merged successfully');
    },
  });
};
