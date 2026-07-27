import { CORE_API_URL, ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation } from 'react-query';
import NotificationMessage from '@/components/common/notification/notificationMessage';

/** MFA lives on Core when configured; fall back to org-emp for local/dev envs. */
const MFA_API_URL = CORE_API_URL || ORG_AND_EMP_URL;

export interface Get2FACodeProps {
  email: string;
  pass: string;
  skipEncryption?: boolean;
}
const get2FACode = async (values: Get2FACodeProps) => {
  return crudRequest({
    url: `${MFA_API_URL}/multi-factor-auth`,
    method: 'POST',
    data: {
      email: values.email.toLowerCase(),
      pass: values.pass,
      ...(values.skipEncryption !== undefined
        ? { skipEncryption: values.skipEncryption }
        : {}),
    },
  });
};

const verify2FACode = async (values: { uid: string; code: string }) => {
  return crudRequest({
    url: `${MFA_API_URL}/multi-factor-auth/verify`,
    method: 'POST',
    data: {
      uid: values.uid,
      code: values.code,
    },
    skipEncryption: true,
  });
};

export const useGet2FACode = () => {
  return useMutation(
    ({ values }: { values: Get2FACodeProps }) => get2FACode({ ...values }),
    {
      onError: (error: any) => {
        NotificationMessage.error({
          message: 'Unable to start verification',
          description:
            error?.response?.data?.message ||
            error?.message ||
            'Please check your credentials and try again.',
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
      onError: (error: any) => {
        NotificationMessage.error({
          message: 'Verification failed',
          description:
            error?.response?.data?.message ||
            error?.message ||
            'Invalid or expired code. Please try again.',
        });
      },
    },
  );
};
