import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import { MergingDepartment } from './interface';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';

const mergingDepartment = async (data: MergingDepartment) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/users/department/dissolve`,
    method: 'PATCH',
    data,
  });
};

export const useMergingDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation((data: MergingDepartment) => mergingDepartment(data), {
    onSuccess: (_, variables: MergingDepartment) => {
      queryClient.invalidateQueries('orgcharts');
      handleSuccessMessage('Departments merged successfully');
    },
  });
};
