import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import { MergingDepartment } from './interface';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const headers = {
  tenantId: tenantId,
  Authorization: `Bearer ${token}`,
};

const mergingDepartment = async (data: MergingDepartment) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/users/department/dissolve`,
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
