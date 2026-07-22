import { CORE_API_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation } from 'react-query';
import NotificationMessage from '@/components/common/notification/notificationMessage';

export interface Get2FACodeProps {
  email: string;
  pass: string;
  skipEncryption?: boolean;
}
const get2FACode = async (values: Get2FACodeProps) => {
  return crudRequest({
    url: `${CORE_API_URL}/multi-factor-auth`,
    method: 'POST',
    data: {
      ...values,
      email: values.email.toLowerCase(),
    },
  });
};

const verify2FACode = async (values: {
  uid: string;
  code: string;
  skipEncryption: boolean;
}) => {
  return crudRequest({
    url: `${CORE_API_URL}/multi-factor-auth/verify`,
    method: 'POST',
    data: values,
    skipEncryption: true,
  });
};

export const useGet2FACode = () => {
  return useMutation(
    ({ values }: { values: Get2FACodeProps }) => get2FACode({ ...values }),
    {},
  );
};

export const useVerify2FACode = () => {
  return useMutation(
    ({
      values,
    }: {
      values: { uid: string; code: string; skipEncryption: boolean };
    }) => verify2FACode(values),
    {
      onSuccess: () => {
        NotificationMessage.success({
          message: 'Successfully Verified',
        });
      },
    },
  );
};
