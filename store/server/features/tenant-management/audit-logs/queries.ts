import { requestHeader } from '@/helpers/requestHeader';
import { ApiResponse } from '@/types/commons/responseTypes';
import { AuditLog } from '@/types/tenant-management';
import { TENANT_MGMT_URL, ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMemo } from 'react';
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
const getClientFilterKey = (params: AggregateAuditLogParams) => {
  const searchText = (params.remarks || params.search || '').trim();
  return {
    modules: params.modules,
    module: params.module,
    orderBy: params.orderBy,
    orderDirection: params.orderDirection,
    action: params.action,
    performedBy: params.performedBy,
    startDate: params.startDate,
    endDate: params.endDate,
    remarks: searchText,
    search: searchText,
  };
};

const hasClientSideFilters = (params: AggregateAuditLogParams) => {
  const searchText = (params.remarks || params.search || '').trim();
  return Boolean(
    searchText ||
      params.action ||
      params.startDate ||
      params.endDate ||
      params.performedBy,
  );
};

const paginateAuditLogs = (
  response: ApiResponse<AuditLog>,
  allItems: AuditLog[],
  page: number,
  limit: number,
): ApiResponse<AuditLog> => {
  const requestedPage = page || 1;
  const requestedLimit = limit || 10;
  const start = (requestedPage - 1) * requestedLimit;
  const pageItems = allItems.slice(start, start + requestedLimit);

  return {
    ...response,
    items: pageItems,
    meta: {
      ...response.meta,
      totalItems: allItems.length,
      itemCount: pageItems.length,
      itemsPerPage: requestedLimit,
      totalPages: Math.max(1, Math.ceil(allItems.length / requestedLimit) || 1),
      currentPage: requestedPage,
    },
  };
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
  const clientFiltered = hasClientSideFilters(params);
  const requestedPage = params.page || 1;
  const requestedLimit = params.limit || 10;

  const buildQueryParams = (page: number, limit: number) => {
    const queryParams: Record<string, any> = {
      page,
      limit,
      orderBy: params.orderBy || 'performedAt',
      orderDirection: params.orderDirection || 'DESC',
    };

    // When matching client-side, do not send remarks/action/date/employee
    // filters. The aggregate API paginates first, so those filters would
    // only apply to the current page and report totalPages as 1.
    if (!clientFiltered) {
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
    }

    return queryParams;
  };

  const requestBody = {
    modules: modulesFromParam,
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

  // No text/date/action/employee filters: use normal server pagination.
  // Module scope is already applied via the request body.
  if (!clientFiltered) {
    return await fetchPage(requestedPage, requestedLimit);
  }

  // Load unfiltered pages, match remarks/employee/action/date locally,
  // and return every match. The hook paginates the cached match list so
  // changing table page does not rescan the API.
  const fetchLimit = 100;
  const maxPages = 100;
  const matched: AuditLog[] = [];
  const seenIds = new Set<string>();

  const collectMatches = (items: AuditLog[]) => {
    items.filter(matchesFilters).forEach((log) => {
      const key = String(log?.id ?? '');
      if (key) {
        if (seenIds.has(key)) return;
        seenIds.add(key);
      }
      matched.push(log);
    });
  };

  const firstResponse: ApiResponse<AuditLog> = await fetchPage(1, fetchLimit);
  const firstItems = firstResponse?.items ?? [];
  collectMatches(firstItems);

  const pageSizeUsed =
    firstResponse?.meta?.itemsPerPage ||
    (firstItems.length > 0 ? firstItems.length : fetchLimit);
  const unfilteredTotalPages = Math.min(
    maxPages,
    firstResponse?.meta?.totalPages ||
      Math.ceil((firstResponse?.meta?.totalItems || 0) / pageSizeUsed) ||
      1,
  );

  if (firstItems.length > 0 && unfilteredTotalPages > 1) {
    const remainingPages: number[] = [];
    for (let page = 2; page <= unfilteredTotalPages; page += 1) {
      remainingPages.push(page);
    }

    const batchSize = 5;
    for (let i = 0; i < remainingPages.length; i += batchSize) {
      const batch = remainingPages.slice(i, i + batchSize);
      const responses: ApiResponse<AuditLog>[] = await Promise.all(
        batch.map((page) => fetchPage(page, fetchLimit)),
      );
      responses.forEach((response) => {
        collectMatches(response?.items ?? []);
      });
    }
  }

  return {
    ...firstResponse,
    items: matched,
    meta: {
      ...firstResponse.meta,
      totalItems: matched.length,
      itemCount: matched.length,
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
  const clientFiltered = hasClientSideFilters(params);
  const queryKey = clientFiltered
    ? ['aggregate-audit-post-logs', getClientFilterKey(params)]
    : ['aggregate-audit-post-logs', params];

  const query = useQuery<ApiResponse<AuditLog>>(
    queryKey,
    () => getAggregateAuditPostLogs(params),
    {
      enabled: isEnabled,
      keepPreviousData: !clientFiltered,
    },
  );

  const paginatedData = useMemo(() => {
    if (!clientFiltered || !query.data) {
      return query.data;
    }

    return paginateAuditLogs(
      query.data,
      query.data.items ?? [],
      params.page || 1,
      params.limit || 10,
    );
  }, [clientFiltered, query.data, params.page, params.limit]);

  return {
    ...query,
    data: paginatedData,
  };
};
