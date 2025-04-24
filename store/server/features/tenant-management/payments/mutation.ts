import { crudRequest } from '@/utils/crudRequest';
import { TENANT_MGMT_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { Payment } from '@/types/tenant-management';

const setPayments = async (items: Partial<Payment>[]) => {
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/rest/payments`,
    method: 'PUT',
    headers: requestHeader(),
    data: { items },
  });
};

// const deletePayments = async (id: string[]) => {
//   return await crudRequest({
//     url: `${TENANT_MGMT_URL}/subscription/rest/payments`,
//     method: 'DELETE',
//     headers: requestHeader(),
//     data: { id },
//   });
// };

export const useSetPayments = () => {
  const queryClient = useQueryClient();
  return useMutation(setPayments, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('payments');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

// export const useDeletePayments = () => {
//   const queryClient = useQueryClient();
//   return useMutation(deletePayments, {
//     // eslint-disable-next-line @typescript-eslint/naming-convention
//     onSuccess: (_, variables: any) => {
//       queryClient.invalidateQueries('payments');
//       const method = variables?.method?.toUpperCase();
//       handleSuccessMessage(method);
//     },
//   });
// };
