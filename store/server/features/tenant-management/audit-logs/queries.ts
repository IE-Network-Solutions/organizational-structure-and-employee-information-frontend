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
  if (params.startDate) {
    queryParams.startDate = params.startDate;
  }
  if (params.endDate) {
    queryParams.endDate = params.endDate;
  }
  if (params.remarks) {
    queryParams.remarks = params.remarks;
  }
  if (params.search) {
    queryParams.search = params.search;
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
const getAggregateAuditPostLogs = async (
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

  const requestedPage = params.page || 1;
  const requestedLimit = params.limit || 10;
  const remarksSearch = (params.remarks || '').trim();

  const queryParams: Record<string, any> = {
    page: remarksSearch && !params.performedBy ? 1 : requestedPage,
    limit: remarksSearch && !params.performedBy ? 100 : requestedLimit,
    orderBy: params.orderBy || 'performedAt',
    orderDirection: params.orderDirection || 'DESC',
  };

  if (params.action) {
    queryParams.action = params.action;
  }
  if (params.performedBy) {
    queryParams.performedBy = params.performedBy;
  }
  if (params.entityType) {
    queryParams.entityType = params.entityType;
  }
  if (params.startDate) {
    queryParams.startDate = params.startDate;
  }
  if (params.endDate) {
    queryParams.endDate = params.endDate;
  }
  if (params.remarks) {
    queryParams.remarks = params.remarks;
  }

  const requestAuditLogs = async (requestParams: Record<string, any>) => {
    return await crudRequest({
      url: `${ORG_AND_EMP_URL}/core/audit-log/aggregate`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
      params: requestParams,
      data: {
        modules: modulesFromParam,
      },
    });
  };

  let response: ApiResponse<AuditLog>;
  try {
    response = await requestAuditLogs(queryParams);
  } catch (error) {
    if (!remarksSearch) {
      throw error;
    }
    const fallbackParams = { ...queryParams };
    delete fallbackParams.remarks;
    response = await requestAuditLogs(fallbackParams);
  }

  if (!remarksSearch || params.performedBy) {
    return response;
  }

  const query = remarksSearch.toLowerCase();
  const matched = (response?.items ?? []).filter((log) => {
    const user = log?.performedByUser;
    const fullName = user
      ? `${user.firstName || ''} ${user.lastName || ''}`.trim().toLowerCase()
      : '';
    const remarks = [
      log?.remarks,
      (log as any)?.remark,
      log?.metadata && typeof log.metadata === 'object'
        ? (log.metadata as any).remarks
        : '',
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return (
      remarks.includes(query) ||
      fullName.includes(query) ||
      (log?.performedBy || '').toString().toLowerCase().includes(query)
    );
  });

  const start = (requestedPage - 1) * requestedLimit;
  const pageItems = matched.slice(start, start + requestedLimit);

  return {
    ...response,
    items: pageItems,
    meta: {
      ...response.meta,
      totalItems: matched.length,
      itemCount: pageItems.length,
      itemsPerPage: requestedLimit,
      totalPages: Math.max(1, Math.ceil(matched.length / requestedLimit) || 1),
      currentPage: requestedPage,
    },
  };
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
