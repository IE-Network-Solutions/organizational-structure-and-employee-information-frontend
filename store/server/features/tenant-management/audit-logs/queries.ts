import { requestHeader } from '@/helpers/requestHeader';
import { ApiResponse } from '@/types/commons/responseTypes';
import { AuditLog } from '@/types/tenant-management';
import { TENANT_MGMT_URL, ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { AuditLogRequestBody, AggregateAuditLogParams } from './interface';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const getAuditLogs = async (data: Partial<AuditLogRequestBody>) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/rest/audit-logs`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

export const useGetAuditLogs = (
  data: Partial<AuditLogRequestBody> = {},
  isKeepData: boolean = true,
  isEnabled: boolean = true,
) => {
  return useQuery<ApiResponse<AuditLog>>(
    Object.keys(data).length ? ['audit-logs', data] : 'audit-logs',
    () => getAuditLogs(data),
    {
      keepPreviousData: isKeepData,
      enabled: isEnabled,
    },
  );
};

export const useGetAuditLogDetail = (
  auditLogId: string,
  exportType: string = 'pdf',
) => {
  return useQuery<ApiResponse<any>>(
    ['audit-log-detail', auditLogId, exportType],
    async () => {
      const requestHeaders = await requestHeader();
      return await crudRequest({
        url: `${TENANT_MGMT_URL}/subscription/rest/audit-logs/${auditLogId}/detail`,
        method: 'GET',
        headers: requestHeaders,
        params: { exportType },
      });
    },
    {
      enabled: !!auditLogId,
    },
  );
};

// New aggregate audit log query

const getAggregateAuditLogs = async (
  params: AggregateAuditLogParams,
): Promise<ApiResponse<AuditLog>> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  // Build query parameters
  const queryParams: Record<string, any> = {
    module: params.module ?? 'all',
    page: params.page || 1,
    limit: params.limit || 10,
    orderBy: params.orderBy || 'performedAt',
    orderDirection: params.orderDirection || 'DESC',
  };

  // Add optional filters
  if (params.action) {
    queryParams.action = params.action;
  }
  if (params.performedBy) {
    queryParams.performedBy = params.performedBy;
  }
  if (params.entityType) {
    queryParams.entityType = params.entityType;
  }
  if (params.entityId) {
    queryParams.entityId = params.entityId;
  }
  if (params.startDate) {
    queryParams.startDate = params.startDate;
  }
  if (params.endDate) {
    queryParams.endDate = params.endDate;
  }
  if (params.search) {
    queryParams.search = params.search;
  }
  if (params.severity) {
    queryParams.severity = params.severity;
  }

  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/core/audit-log/aggregate`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
    params: queryParams,
  });
};

export const useGetAggregateAuditLogs = (
  params: AggregateAuditLogParams = {},
  isEnabled: boolean = true,
) => {
  // Keep previous data when module is defined (including 'all')
  const shouldKeepPreviousData =
    params.module !== null && params.module !== undefined;

  return useQuery<ApiResponse<AuditLog>>(
    ['aggregate-audit-logs', params],
    () => getAggregateAuditLogs(params),
    {
      enabled: isEnabled,
      keepPreviousData: shouldKeepPreviousData,
    },
  );
};
export const getAggregateAuditPostLogs = async (
  params: AggregateAuditLogParams,
): Promise<ApiResponse<AuditLog>> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  const modulesFromParam = ((): string[] => {
    if (Array.isArray(params.modules) && params.modules.length) {
      return params.modules;
    }
    if (typeof params.modules === 'string' && params.modules !== 'all') {
      const parts = params.modules
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.length) return parts;
    }
    if (params.module && params.module !== 'all') {
      return [params.module];
    }
    return ['RecruitmentAuditLog', 'OKRAuditLog'];
  })();

  // Build query parameters
  const queryParams: Record<string, any> = {
    page: params.page || 1,
    limit: params.limit || 5,
    orderBy: params.orderBy || 'performedAt',
    orderDirection: params.orderDirection || 'DESC',
  };

  // Add optional filters
  if (params.action) {
    queryParams.action = params.action;
  }
  if (params.performedBy) {
    queryParams.performedBy = params.performedBy;
  }
  if (params.entityType) {
    queryParams.entityType = params.entityType;
  }
  if (params.entityId) {
    queryParams.entityId = params.entityId;
  }
  if (params.startDate) {
    queryParams.startDate = params.startDate;
  }
  if (params.endDate) {
    queryParams.endDate = params.endDate;
  }
  if (params.search) {
    queryParams.search = params.search;
  }
  if (params.severity) {
    queryParams.severity = params.severity;
  }

  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/core/audit-log/aggregate`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
    params: queryParams,
    data: {
      modules: modulesFromParam,
    },
  });
};

export const useGetAggregateAuditPostLogs = (
  params: AggregateAuditLogParams = {},
  isEnabled: boolean = true,
) => {
  const shouldKeepPreviousData =
    (params.module !== null && params.module !== undefined) ||
    (Array.isArray(params.modules) && params.modules.length > 0) ||
    (typeof params.modules === 'string' &&
      params.modules.length > 0 &&
      params.modules !== 'all');

  return useQuery<ApiResponse<AuditLog>>(
    ['aggregate-audit-post-logs', params],
    () => getAggregateAuditPostLogs(params),
    {
      enabled: isEnabled,
      keepPreviousData: shouldKeepPreviousData,
    },
  );
};

export const getAuditLogById = async (id: string): Promise<AuditLog> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/core/audit-log/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

export const useGetAuditLogById = (id?: string, isEnabled: boolean = true) => {
  return useQuery<AuditLog>(
    ['org-emp-audit-log', id],
    () => getAuditLogById(id as string),
    {
      enabled: Boolean(id) && isEnabled,
      retry: false,
    },
  );
};

export const getAuditSeverityRules = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/core/audit-log/severity-rules`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

export const useGetAuditSeverityRules = () =>
  useQuery(['audit-severity-rules'], getAuditSeverityRules);

export const getAuditSeverityFields = async (module: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/core/audit-log/severity-fields`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
    params: { module },
  });
};

export const useGetAuditSeverityFields = (module?: string) =>
  useQuery(
    ['audit-severity-fields', module],
    () => getAuditSeverityFields(module as string),
    {
      enabled: Boolean(module),
      staleTime: 5 * 60 * 1000,
    },
  );

export const replaceAuditSeverityRules = async (rules: unknown[]) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/core/audit-log/severity-rules`,
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
    data: { rules },
  });
};

export const useReplaceAuditSeverityRules = () => {
  const queryClient = useQueryClient();
  return useMutation(replaceAuditSeverityRules, {
    onSuccess: () => {
      queryClient.invalidateQueries('audit-severity-rules');
      queryClient.invalidateQueries('aggregate-audit-post-logs');
    },
  });
};
