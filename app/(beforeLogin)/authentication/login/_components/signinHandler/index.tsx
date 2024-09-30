'use client';
import { message } from 'antd';
import { useRouter } from 'next/navigation';
import { useGetTenantId } from '@/store/server/features/employees/authentication/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { handleFirebaseSignInError } from '@/utils/showErrorResponse';

export const useHandleSignIn = () => {
  const { setError, setLoading, setToken, setUserId, setLocalId, setTenantId } =
    useAuthenticationStore();

  const {
    data: fetchedTenantId,
    isError: fetcheError,
    refetch: fetchTenantId,
  } = useGetTenantId();
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

      await fetchTenantId();

      if (fetcheError) {
        message.error('Failed to fetch user data. Please try again.');
        setToken('');
        setLocalId('');
      } else {
        setTenantId(fetchedTenantId.tenantId);
        setUserId(fetchedTenantId.id);
        message.success('Welcome back');
        message.loading({ content: 'Redirecting...', key: 'redirect' });
        router.push('/employees/manage-employees');
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
