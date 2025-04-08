import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const token = useAuthenticationStore.getState().token;
const tenantId =
  useAuthenticationStore.getState().tenantId ||
  'dce8be5f-8296-4190-81d1-b15d8e7fbf75';
const userId = useAuthenticationStore.getState().userId;
export const requestHeader = () => ({
  Authorization: `Bearer ${token}`,
  ...(tenantId && { tenantId }),
  ...(userId && { userId }),
});
