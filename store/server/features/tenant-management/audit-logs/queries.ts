import { requestHeader } from '@/helpers/requestHeader';
import { ApiResponse } from '@/types/commons/responseTypes';
import { AuditLog } from '@/types/tenant-management';
import { TENANT_MGMT_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { AuditLogRequestBody } from './interface';

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
