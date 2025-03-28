'use client';
import { message } from 'antd';
import { useRouter } from 'next/navigation';
import { useGetTenantId } from '@/store/server/features/employees/authentication/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { handleFirebaseSignInError } from '@/utils/showErrorResponse';

export const useHandleSignIn = () => {
  const {
    setError,
    setLoading,
    setToken,
    setUserId,
    setLocalId,
    setTenantId,
    setUserData,
  } = useAuthenticationStore();

  const { refetch: fetchTenantId } = useGetTenantId();
  const router = useRouter();

  const handleSignIn = async (signInMethod: () => Promise<any>) => {
    setLoading(true);
    setError('');
    try {
      const userCredentials = await signInMethod();
      const user = userCredentials.user;
      const token = await user.getIdToken();
      const uid = user.uid;

      setToken(token);
      setLocalId(uid);

      const fetchedData = await fetchTenantId();

      if (fetchedData.isError) {
        message.error('Failed to fetch user data. Please try again.');
        setToken('');
        setLocalId('');
      } else {
        setTenantId(fetchedData?.data?.tenantId);
        setUserId(fetchedData?.data?.id);
        setUserData(fetchedData?.data);
        message.success('Welcome!');
        message.loading({ content: 'Redirecting...', key: 'redirect' });
        const redirectPath =
          sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
        sessionStorage.removeItem('redirectAfterLogin');

        if (fetchedData?.data?.hasCompany === false) {
          router.push('/onboarding');
        } else if (redirectPath) {
          router.push(redirectPath);
        } else if (fetchedData?.data?.hasChangedPassword === false) {
          router.push('/authentication/new-password');
        } else if (
          fetchedData?.data?.hasCompany === true &&
          fetchedData?.data?.hasChangedPassword === true
        ) {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err);
      handleFirebaseSignInError(err);
    } finally {
      setLoading(false);
    }
  };

  return { handleSignIn };
};
