import { useMutation, useQueryClient } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { PAYROLL_URL } from '@/utils/constants';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { basecampQueryKeys } from './queries';

const base = () => {
  const url = PAYROLL_URL;
  if (!url) {
    throw new Error('PAYROLL_URL is not configured');
  }
  return `${url}/integrations/basecamp`;
};

const authHeaders = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId ?? '',
  };
};

export function useBasecampDisconnect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      crudRequest({
        url: `${base()}/disconnect`,
        method: 'POST',
        headers: await authHeaders(),
      }),
    onSuccess: () => {
      qc.invalidateQueries(basecampQueryKeys.all);
    },
  });
}

export function useBasecampUpdateModules() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      modules: Array<{ moduleSlug: string; enabled: boolean }>;
    }) =>
      crudRequest({
        url: `${base()}/modules`,
        method: 'PUT',
        headers: await authHeaders(),
        data: body,
      }),
    onSuccess: () => {
      qc.invalidateQueries(basecampQueryKeys.modules());
    },
  });
}

export function useBasecampUpsertProjectMapping() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      selamnewModule: string;
      basecampProjectId: number;
      basecampProjectName?: string;
    }) =>
      crudRequest({
        url: `${base()}/project-mappings`,
        method: 'PUT',
        headers: await authHeaders(),
        data: body,
      }),
    onSuccess: () => {
      qc.invalidateQueries(basecampQueryKeys.projectMappings());
    },
  });
}

export function useBasecampUpsertUserMapping() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      selamnewUserId: string;
      basecampUserId: number;
    }) =>
      crudRequest({
        url: `${base()}/user-mappings`,
        method: 'PUT',
        headers: await authHeaders(),
        data: body,
      }),
    onSuccess: () => {
      qc.invalidateQueries(basecampQueryKeys.userMappings());
    },
  });
}

export function useBasecampDeleteUserMapping() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (selamnewUserId: string) =>
      crudRequest({
        url: `${base()}/user-mappings/${encodeURIComponent(selamnewUserId)}`,
        method: 'DELETE',
        headers: await authHeaders(),
      }),
    onSuccess: () => {
      qc.invalidateQueries(basecampQueryKeys.userMappings());
    },
  });
}
