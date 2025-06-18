'use client';
import { message } from 'antd';
import { useRouter } from 'next/navigation';
import { useGetTenantId } from '@/store/server/features/employees/authentication/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { handleFirebaseSignInError } from '@/utils/showErrorResponse';
import { useTenantChecker } from '../tenantChecker';
import { useGetActiveFiscalYearsData } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useEffect } from 'react';

export const useHandleSignIn = () => {
  const {
    setError,
    setLoading,
    setToken,
    setUserId,
    token,
    tenantId,
    setLocalId,
    setTenantId,
    setUserData,
    setActiveCalendar,
    setLoggedUserRole,
  } = useAuthenticationStore();

  const { refetch: fetchTenantId } = useGetTenantId();
  const { refetch: refetchFiscalYear } = useGetActiveFiscalYearsData();

  const router = useRouter();
  const { tenant } = useTenantChecker();

  useEffect(() => {
    //also check tenantId
    if (token.length > 0 && tenantId.length > 0) {
      refetchFiscalYear();
    }
  }, [token, tenantId]);

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

      const fetchedData = await fetchTenantId(token);
      if (fetchedData.isError) {
        message.error('Failed to fetch user data. Please try again.');
        setToken('');
        return;
      }

      // Check if user belongs to the current tenant (if it's not a PWA)
      if (tenant?.isPWA === false && tenant?.id !== user?.tenantId) {
        message.error(
          'This user does not belong to this tenant. Please contact your administrator.',
        );
        setToken('');
        return;
      }

      // Set essential user-related states
      setTenantId(fetchedData?.data.tenantId);
      setUserId(fetchedData?.data.id);
      setUserData(fetchedData?.data);
      setLoggedUserRole(fetchedData?.data?.role?.slug || '');

      // Fetch and validate fiscal year
      const fiscalYearData = await refetchFiscalYear();
      const fiscalYearEndDate = fiscalYearData?.data?.endDate;

      if (fiscalYearEndDate) {
        setActiveCalendar(fiscalYearEndDate);
      }

      message.success('Welcome!');
      message.loading({ content: 'Redirecting...', key: 'redirect' });

      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      sessionStorage.removeItem('redirectAfterLogin');

      // Redirect based on user account status
      if (!user.hasCompany) {
        router.push('/onboarding');
      } else if (!user.hasChangedPassword) {
        router.push('/authentication/new-password');
      } else if (
        user.hasCompany &&
        user.hasChangedPassword &&
        fiscalYearEndDate &&
        new Date(fiscalYearEndDate) > new Date()
      ) {
        router.push('/dashboard');
      } else {
        const userRole = user?.role?.slug;

        // Admin or owner role logic
        if (userRole === 'owner' || userRole === 'admin') {
          if (fiscalYearEndDate && new Date(fiscalYearEndDate) < new Date()) {
            message.warning(
              'Your active fiscal year has ended. Please set a new one.',
            );
            router.push('/organization/settings/fiscalYear/fiscalYearCard');
          } else if (redirectPath) {
            router.push(redirectPath);
          } else {
            router.push('/organization/settings/fiscalYear/fiscalYearCard');
          }
        } else {
          // For all other roles
          if (redirectPath) {
            router.push(redirectPath);
          } else {
            router.push('/dashboard');
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
