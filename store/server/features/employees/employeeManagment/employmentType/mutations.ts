import { useMutation, useQueryClient } from 'react-query';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const createEmployeeType = async (values: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/employement-type`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },
    data: values,
  });
};

export const useAddEmployeeType = () => {
  const queryClient = useQueryClient();

  return useMutation(createEmployeeType, {
    onSuccess: () => {
      queryClient.invalidateQueries(['employeementTypes'], {
        refetchActive: true,
      });
      NotificationMessage.success({
        message: 'Successfully Added EmployeType',
        description: 'Employee Type successfully Created',
      });
    },
  });
};
