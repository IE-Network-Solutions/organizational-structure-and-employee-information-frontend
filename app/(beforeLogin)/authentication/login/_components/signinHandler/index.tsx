'use client';
import { message, Modal, Input } from 'antd';
import { useRouter } from 'next/navigation';
import {
  signInWithPopup,
  fetchSignInMethodsForEmail,
  signInWithEmailAndPassword,
  linkWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
} from 'firebase/auth';
import {
  auth,
  googleProvider,
  microsoftProvider,
} from '@/utils/firebaseConfig'; // make sure your provider setup adds scopes below
import { useGetTenantId } from '@/store/server/features/employees/authentication/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { handleFirebaseSignInError } from '@/utils/showErrorResponse';
import { useTenantChecker } from '../tenantChecker';
import { useGetActiveFiscalYearsData } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useEffect } from 'react';
import AccessGuard from '@/utils/permissionGuard';
import { FirebaseError } from 'firebase/app';

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

  // Refresh fiscal year after token/tenant update
  useEffect(() => {
    if (token.length > 0 && tenantId.length > 0) {
      refetchFiscalYear();
    }
  }, [token, tenantId]);

  // 🧩 Helper function: handles linking accounts when existing credentials found
  const handleAccountLinking = async (
    err: any,
    attemptedProviderId?: string,
  ) => {
    try {
      let email = err.customData?.email;
      // UI helpers to collect email/password via modal instead of prompt
      const requestEmailViaModal = (): Promise<string> =>
        new Promise((resolve) => {
          let inputValue = '';
          Modal.confirm({
            title: 'Link accounts',
            content: (
              <div>
                <p>Please enter your account email to continue linking:</p>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  onChange={(e) => {
                    inputValue = e.target.value;
                  }}
                />
              </div>
            ),
            okText: 'Continue',
            cancelText: 'Cancel',
            onOk: () => {
              if (!inputValue) {
                message.error('Please enter your email');
                return Promise.reject();
              }
              resolve(inputValue.toLowerCase());
            },
            onCancel: () => resolve(''),
          });
        });

      const requestPasswordViaModal = (
        emailAddress: string,
        providerLabel: string,
      ): Promise<string> =>
        new Promise((resolve) => {
          let passwordValue = '';
          Modal.confirm({
            title: 'Link accounts',
            content: (
              <div>
                <p>
                  An account already exists with {emailAddress}. Please enter
                  your password to link your {providerLabel} account:
                </p>
                <Input.Password
                  placeholder="Password"
                  onChange={(e) => {
                    passwordValue = e.target.value;
                  }}
                />
              </div>
            ),
            okText: 'Link',
            cancelText: 'Cancel',
            onOk: () => {
              if (!passwordValue) {
                message.error('Please enter your password');
                return Promise.reject();
              }
              resolve(passwordValue);
            },
            onCancel: () => resolve(''),
          });
        });
      // Derive pending credential from the error using the correct provider helper
      const getPendingCredential = () => {
        try {
          if (attemptedProviderId === 'google.com') {
            return GoogleAuthProvider.credentialFromError(err);
          }
          if (attemptedProviderId === 'microsoft.com') {
            return OAuthProvider.credentialFromError(err);
          }
        } catch {
          // ignore and try fallback
        }
        // Fallback: try both, but avoid throwing if not applicable
        try {
          const g = GoogleAuthProvider.credentialFromError(err);
          if (g) return g;
        } catch {}
        try {
          const m = OAuthProvider.credentialFromError(err);
          if (m) return m;
        } catch {}
        return null;
      };

      const pendingCred = getPendingCredential();

      // If email is missing, try to decode from idToken
      if (!email && pendingCred?.idToken) {
        try {
          const decoded = JSON.parse(atob(pendingCred.idToken.split('.')[1]));
          email = decoded?.email?.toLowerCase();
        } catch {
          message.error('Could not get email from credential');
        }
      }

      // Ask user if email is still not found
      if (!email) {
        email = await requestEmailViaModal();
      }

      if (!email) {
        message.error('Unable to proceed without an email address.');
        return;
      }

      let methods: string[] = [];
      try {
        methods = await fetchSignInMethodsForEmail(auth, email.toLowerCase());
      } catch {
        message.warning('fetchSignInMethodsForEmail failed');
      }

      // Fallback if empty — prompt user to login manually
      if (!methods || methods.length === 0) {
        message.warning(
          'We could not detect your previous sign-in method. Please log in with your email and password, then try linking again.',
        );
        return;
      }

      if (methods.includes('password')) {
        const password = await requestPasswordViaModal(
          email,
          pendingCred?.providerId || 'social',
        );

        if (password) {
          const emailUser = await signInWithEmailAndPassword(
            auth,
            email.toLowerCase(),
            password,
          );
          if (pendingCred) {
            await linkWithCredential(emailUser.user, pendingCred);
            message.success(
              'Your accounts are now linked. Please sign in again.',
            );
          } else {
            message.warning(
              'We could not retrieve the pending credential to complete linking. Please try your social login again to finish linking.',
            );
          }
        }
      } else if (methods.includes('google.com')) {
        const googleResult = await signInWithPopup(auth, googleProvider);
        if (pendingCred) {
          await linkWithCredential(googleResult.user, pendingCred);
          message.success('Linked Microsoft account to Google successfully.');
        } else {
          message.warning(
            'We could not retrieve the pending credential. Please try the original social login again after signing in with Google.',
          );
        }
      } else if (methods.includes('microsoft.com')) {
        const msResult = await signInWithPopup(auth, microsoftProvider);
        if (pendingCred) {
          await linkWithCredential(msResult.user, pendingCred);
          message.success('Linked Google account to Microsoft successfully.');
        } else {
          message.warning(
            'We could not retrieve the pending credential. Please try the original social login again after signing in with Microsoft.',
          );
        }
      } else {
        message.warning(
          'We detected an unknown login method. Please sign in with your original account.',
        );
      }
    } catch (linkErr) {
      message.error('Account linking failed');
      handleFirebaseSignInError(linkErr as FirebaseError);
    }
  };

  // 🧭 Main handler
  const handleSignIn = async (
    signInMethod: () => Promise<any>,
    attemptedProviderId?: 'google.com' | 'microsoft.com',
  ) => {
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

      if (
        process.env.NODE_ENV !== 'development' &&
        tenant?.isPWA === false &&
        tenant?.id !== fetchedData?.data?.tenantId
      ) {
        message.error(
          'This user does not belong to this tenant. Please contact your administrator.',
        );
        setToken('');
        return;
      }

      setTenantId(fetchedData?.data.tenantId);
      setUserId(fetchedData?.data.id);
      setUserData(fetchedData?.data);
      setLoggedUserRole(fetchedData?.data?.role?.slug || '');

      const userData = fetchedData?.data;
      const fiscalYearData = await refetchFiscalYear();
      const fiscalYearEndDate = fiscalYearData?.data?.endDate;

      if (fiscalYearEndDate) {
        setActiveCalendar(fiscalYearEndDate);
      }

      message.success('Welcome!');
      message.loading({ content: 'Redirecting...', key: 'redirect' });

      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      sessionStorage.removeItem('redirectAfterLogin');

      // Redirect rules
      if (!userData.hasCompany) {
        router.push('/onboarding');
      } else if (!userData.hasChangedPassword) {
        router.push('/authentication/new-password');
      } else if (
        userData.hasCompany &&
        userData.hasChangedPassword &&
        fiscalYearEndDate &&
        new Date(fiscalYearEndDate) > new Date()
      ) {
        router.push('/dashboard');
      } else {
        const userRole = userData?.role?.slug;

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
          if (
            AccessGuard.checkAccess({
              permissions: ['view_organization_settings'],
            })
          ) {
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
            router.push('/dashboard');
          }
        }
      }
    } catch (err: any) {
      message.error('Sign-in error');

      if (err.code === 'auth/account-exists-with-different-credential') {
        await handleAccountLinking(err, attemptedProviderId);
      } else {
        handleFirebaseSignInError(err);
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return { handleSignIn };
};
