import { removeCookie } from '@/helpers/storageHelper';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useRecentlyAchievedMilestones } from '@/utils/recentlyAchievedMilestones';

export const clearAuthState = () => {
  const store = useAuthenticationStore.getState();

  store.setUserData({});
  store.setLoggedUserRole('');
  store.setActiveCalendar('');
  store.setUserId('');
  store.setError(null);
  store.setIs2FA(false);
  store.setTwoFactorAuthEmail('');
  store.setLocalId('');
  store.setTenantId('');
  store.setToken('');
  store.setUser2FA({ email: '', pass: '' });

  removeCookie('token');
  removeCookie('tenantId');
  removeCookie('activeCalendar');
  removeCookie('loggedUserRole');
  removeCookie('canManageFiscalYear');

  useAuthenticationStore.persist.clearStorage();
  useRecentlyAchievedMilestones.getState().clear();
  useRecentlyAchievedMilestones.persist.clearStorage();
};
