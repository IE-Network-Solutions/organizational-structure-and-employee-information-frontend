'use client';
import { message } from 'antd';
import { useRouter } from 'next/navigation';
import { useGetTenantId } from '@/store/server/features/employees/authentication/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { handleFirebaseSignInError } from '@/utils/showErrorResponse';
import { useGetActiveFiscalYearsData } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useEffect } from 'react';

export const useHandleSignIn = () => {
  const {
    setError,
    setLoading,
    setToken,
    setUserId,
    token,
    setLocalId,
    setTenantId,
    setUserData,
    setActiveCalendar,
  } = useAuthenticationStore();

  const { refetch: fetchTenantId } = useGetTenantId();
  const { data: activeFiscalYear, refetch } = useGetActiveFiscalYearsData();

  const router = useRouter();

  useEffect(() => {
    refetch();
  }, [token]);

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

      if (activeFiscalYear) {
        setActiveCalendar(activeFiscalYear?.endDate);
      }
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
          fetchedData?.data?.hasChangedPassword === true &&
          new Date('2025-03-04') > new Date()
        ) {
          router.push('/dashboard');
        } else if (new Date('2025-03-04') < new Date()) {
          router.push('/fiscal-ended');
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
