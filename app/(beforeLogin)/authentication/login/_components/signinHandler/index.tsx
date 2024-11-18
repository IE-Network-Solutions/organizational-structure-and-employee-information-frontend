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
    userData,
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
        if (userData?.hasChangedPassword === false) {
          router.push('/authentication/new-password');
        }
        if (userData?.hasCompany === false) {
          router.push('/onboarding');
        } else if (
          userData?.hasCompany === true &&
          userData?.hasChangedPassword === true
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
