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
    setLoggedUserRole,
  } = useAuthenticationStore();

  const { refetch: fetchTenantId } = useGetTenantId();
  const { refetch: refetchFiscalYear } = useGetActiveFiscalYearsData();

  const router = useRouter();

  useEffect(() => {
    refetchFiscalYear();
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

      const fetchedData = await fetchTenantId();

      if (fetchedData.isError) {
        message.error('Failed to fetch user data. Please try again.');
        setToken('');
        setLocalId('');
      } else {
        setTenantId(fetchedData?.data?.tenantId);
        setUserId(fetchedData?.data?.id);
        setUserData(fetchedData?.data);
        setLoggedUserRole(fetchedData?.data?.role?.slug || '');

        const fiscalYearData = await refetchFiscalYear();
        if (fiscalYearData?.data) {
          setActiveCalendar(fiscalYearData?.data?.endDate);
        }

        message.success('Welcome!');
        message.loading({ content: 'Redirecting...', key: 'redirect' });
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        sessionStorage.removeItem('redirectAfterLogin');

        if (fetchedData?.data?.hasCompany === false) {
          router.push('/onboarding');
        } else if (fetchedData?.data?.hasChangedPassword === false) {
          router.push('/authentication/new-password');
        } else if (
          fetchedData?.data?.hasCompany === true &&
          fetchedData?.data?.hasChangedPassword === true &&
          fiscalYearData?.data?.endDate &&
          new Date(fiscalYearData?.data?.endDate) > new Date()
        ) {
          router.push('/dashboard');
        } else {
          const userRole = fetchedData?.data?.role?.slug;

          if (userRole === 'owner' || userRole === 'admin') {
            // For owners and admins, check fiscal year status
            if (
              fiscalYearData?.data?.endDate &&
              new Date(fiscalYearData?.data?.endDate) < new Date()
            ) {
              router.push('/organization/settings/fiscalYear/fiscalYearCard');
              message.warning(
                'Your active fiscal year has ended. Please set a new one.',
              );
            } else if (redirectPath) {
              router.push(redirectPath);
            } else {
              router.push('/organization/settings/fiscalYear/fiscalYearCard');
            }
          } else {
            // For other roles, go to dashboard
            if (redirectPath) {
              router.push(redirectPath);
            } else {
              router.push('/dashboard');
            }
          }
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
