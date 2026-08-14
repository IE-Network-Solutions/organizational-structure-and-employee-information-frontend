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

  const searchText = (params.remarks || params.search || '').trim();
  const selectedModules = modulesFromParam;
  const hasSingleModuleFilter = selectedModules.length === 1;
  const hasActiveFilters = Boolean(
    searchText ||
      params.action ||
      params.startDate ||
      params.endDate ||
      params.performedBy ||
      hasSingleModuleFilter,
  );

  const buildQueryParams = (page: number, limit: number) => {
    const queryParams: Record<string, any> = {
      page,
      limit,
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
    if (searchText) {
      queryParams.remarks = searchText;
      queryParams.search = searchText;
    }

    return queryParams;
  };

  const requestBody = {
    modules: modulesFromParam,
    ...(searchText ? { remarks: searchText, search: searchText } : {}),
    ...(params.action ? { action: params.action } : {}),
    ...(params.startDate ? { startDate: params.startDate } : {}),
    ...(params.endDate ? { endDate: params.endDate } : {}),
    ...(params.performedBy ? { performedBy: params.performedBy } : {}),
  };

  const fetchPage = async (page: number, limit: number) => {
    return await crudRequest({
      url: `${ORG_AND_EMP_URL}/core/audit-log/aggregate`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
      params: buildQueryParams(page, limit),
      data: requestBody,
    });
  };

  const matchesFilters = (log: AuditLog) => {
    if (searchText) {
      const q = searchText.toLowerCase();
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

      const textMatch =
        remarks.includes(q) ||
        fullName.includes(q) ||
        (log?.performedBy || '').toString().toLowerCase().includes(q);

      if (!textMatch) return false;
    }

    if (params.action) {
      const logAction = (log.action || '').toString().toLowerCase();
      const filterAction = params.action.toString().toLowerCase();
      if (logAction !== filterAction) return false;
    }

    if (params.performedBy) {
      const performedById =
        log.performedBy || log.performedByUser?.id || log.userId || '';
      if (performedById !== params.performedBy) return false;
    }

    if (hasSingleModuleFilter) {
      const moduleValue = (log.module || '').toString();
      if (moduleValue && moduleValue !== selectedModules[0]) return false;
    }

    if (params.startDate || params.endDate) {
      const performedAtValue = log.performedAt || log.createdAt;
      if (!performedAtValue) return false;

      const performedAt = new Date(performedAtValue);
      if (Number.isNaN(performedAt.getTime())) return false;

      if (params.startDate) {
        const start = new Date(`${params.startDate}T00:00:00`);
        if (performedAt < start) return false;
      }
      if (params.endDate) {
        const end = new Date(`${params.endDate}T23:59:59.999`);
        if (performedAt > end) return false;
      }
    }

    return true;
  };

  const requestedPage = params.page || 1;
  const requestedLimit = params.limit || 5;

  // No filters: use normal server pagination.
  if (!hasActiveFilters) {
    return await fetchPage(requestedPage, requestedLimit);
  }

  // Active filters (date / action / module / remarks / employee):
  // load across pages, match locally, then paginate matches so results
  // are not limited to the first API page.
  const fetchLimit = 100;
  const maxPages = 50;
  const matched: AuditLog[] = [];
  let page = 1;
  let totalPages = 1;
  let firstResponse: ApiResponse<AuditLog> | null = null;

  while (page <= totalPages && page <= maxPages) {
    const response: ApiResponse<AuditLog> = await fetchPage(page, fetchLimit);
    if (!firstResponse) firstResponse = response;

    const items = response?.items ?? [];
    totalPages =
      response?.meta?.totalPages ||
      Math.ceil((response?.meta?.totalItems || 0) / fetchLimit) ||
      1;

    matched.push(...items.filter((log) => matchesFilters(log)));

    if (!items.length) break;
    page += 1;
  }

  const start = (requestedPage - 1) * requestedLimit;
  const pageItems = matched.slice(start, start + requestedLimit);

  return {
    ...(firstResponse as ApiResponse<AuditLog>),
    items: pageItems,
    meta: {
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
