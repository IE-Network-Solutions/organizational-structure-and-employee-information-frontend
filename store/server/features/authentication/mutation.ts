import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation } from 'react-query';
import NotificationMessage from '@/components/common/notification/notificationMessage';

const get2FACode = async (values: { email: string; pass: string }) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/multi-factor-auth`,
    method: 'POST',
    data: values,
  });
};

const verify2FACode = async (values: { uid: string; code: string }) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/multi-factor-auth/verify`,
    method: 'POST',
    data: values,
  });
};

export const useGet2FACode = () => {
  return useMutation(
    ({ values }: { values: { email: string; pass: string } }) =>
      get2FACode(values),
    {
      onSuccess: () => {
        NotificationMessage.success({
          message: 'Successfully Created',
        });
      },
    },
  );
};

export const useVerify2FACode = () => {
  return useMutation(
    ({ values }: { values: { uid: string; code: string } }) =>
      verify2FACode(values),
    {
      onSuccess: () => {
        NotificationMessage.success({
          message: 'Successfully Verified',
        });
      },
    },
  );
};
