import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import {
  AttendanceRule,
  AttendanceRuleTypes,
} from '@/types/timesheet/attendance';

export type AttendanceRulesFilters = {
  ruleTypeId?: string;
  search?: string;
  page?: number;
  limit?: number;
};

const getAttendanceRules = async (filters?: AttendanceRulesFilters) => {
  const requestHeaders = await requestHeader();
  const params: Record<string, string | number> = {};

  if (filters?.ruleTypeId) {
    params.ruleTypeId = filters.ruleTypeId;
  }
  if (filters?.search?.trim()) {
    params.search = filters.search.trim();
  }
  if (filters?.page != null) {
    params.page = filters.page;
  }
  if (filters?.limit != null) {
    params.limit = filters.limit;
  }

  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance-rules`,
    method: 'GET',
    headers: requestHeaders,
    params: Object.keys(params).length > 0 ? params : undefined,
  });
};

const getAttendanceRule = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance-rules`,
    method: 'GET',
    headers: requestHeaders,
    params: { id },
  });
};

export const useGetAttendanceRules = (filters?: AttendanceRulesFilters) => {
  return useQuery<ApiResponse<AttendanceRule>>(
    [
      'attendance-rules',
      filters?.ruleTypeId ?? 'all',
      filters?.search ?? '',
      filters?.page ?? 1,
      filters?.limit ?? 10,
    ],
    () => getAttendanceRules(filters),
    {
      keepPreviousData: true,
    },
  );
};

export const useGetAttendanceRule = (id: string) => {
  return useQuery<ApiResponse<AttendanceRule>>(
    ['attendance-rule', id],
    () => getAttendanceRule(id),
    {
      keepPreviousData: false,
      enabled: false,
    },
  );
};

/** @deprecated Use useGetAttendanceRule */
export const useGetAttendanceNotificationRule = useGetAttendanceRule;

const getAttendanceRuleTypes = async () => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance-rule-types`,
    method: 'GET',
    headers: requestHeaders,
  });
};

export const useGetAttendanceRuleTypes = () => {
  return useQuery<ApiResponse<AttendanceRuleTypes>>(
    'attendance-rule-types',
    () => getAttendanceRuleTypes(),
    {
      keepPreviousData: true,
    },
  );
};
