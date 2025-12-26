import { requestHeader } from '@/helpers/requestHeader';
import { ApiResponse } from '@/types/commons/responseTypes';
import { AuditLog } from '@/types/tenant-management';
import { TENANT_MGMT_URL, ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
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
  // This provides a smoother UX by showing cached data while fetching new data
  const shouldKeepPreviousData = params.module !== null && params.module !== undefined;
  
  return useQuery<ApiResponse<AuditLog>>(
    ['aggregate-audit-logs', params],
    () => getAggregateAuditLogs(params),
    {
      enabled: isEnabled,
      keepPreviousData: shouldKeepPreviousData,
    },
  );
};
