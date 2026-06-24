import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { getCurrentToken } from '@/utils/getCurrentToken';

/**
 * Resolve the tenant id used for every job-chat request.
 * Job tenant takes priority when available (backend validates job.tenantId).
 */
export const resolveJobChatTenantId = (tenantIdOverride?: string) => {
  const authState = useAuthenticationStore.getState();

  return (
    tenantIdOverride?.trim() ||
    authState.tenantId?.trim() ||
    String(authState.userData?.tenantId || '').trim() ||
    ''
  );
};

export const getJobChatHeaders = async (tenantIdOverride?: string) => {
  const token = await getCurrentToken();
  const authState = useAuthenticationStore.getState();
  const tenantId = resolveJobChatTenantId(tenantIdOverride);
  const userId = authState.userData?.id || authState.userId;

  return {
    Authorization: `Bearer ${token}`,
    tenantId,
    tenantid: tenantId,
    userId,
  };
};
