import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId || '';
export const requestHeader = () => ({
  Authorization: `Bearer ${token}`,
  ...(tenantId && { tenantId }),
});
