import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation } from 'react-query';
import NotificationMessage from '@/components/common/notification/notificationMessage';

interface Get2FACodeProps {
  email: string;
  pass: string;
  recaptchaToken: string;
  loginTenantId: string;
}
const get2FACode = async (values: Get2FACodeProps) => {
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
    ({ values }: { values: Get2FACodeProps }) => get2FACode({ ...values }),
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
