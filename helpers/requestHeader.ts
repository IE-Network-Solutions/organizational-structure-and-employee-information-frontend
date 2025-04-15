import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const userId = useAuthenticationStore.getState().userId;
export const requestHeader = () => ({
  Authorization: `Bearer ${token}`,
  ...(tenantId && { tenantId }),
  ...(userId && { userId }),
});
