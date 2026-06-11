import dayjs from 'dayjs';
import { CommonObject } from '@/types/commons/commonObject';
import { RuleViolationQueryParams } from './interface';

export const buildRuleViolationQueryParams = (
  val: CommonObject,
): Partial<RuleViolationQueryParams> => {
  const params: Partial<RuleViolationQueryParams> = {};

  if (val.search?.trim()) {
    params.search = val.search.trim();
  }
  if (val.employeeId) {
    params.userId = val.employeeId;
  }
  if (val.ruleTypeId) {
    params.ruleTypeId = val.ruleTypeId;
  }
  if (val.attendanceRuleId) {
    params.attendanceRuleId = val.attendanceRuleId;
  }
  if (val.actionType) {
    params.actionType = val.actionType;
  }
  if (Array.isArray(val.actionTypes) && val.actionTypes.length > 0) {
    params.actionTypes = val.actionTypes.join(',');
  }
  if (val.actionTaken != null) {
    params.actionTaken = val.actionTaken;
  }
  if (val.startDate) {
    params.from = dayjs(val.startDate).format('YYYY-MM-DD');
  }
  if (val.endDate) {
    params.to = dayjs(val.endDate).format('YYYY-MM-DD');
  }

  return params;
};

export const toRuleViolationApiParams = (
  query: Partial<RuleViolationQueryParams>,
  options?: { includePagination?: boolean; includeSort?: boolean },
): Record<string, string | number | boolean> => {
  const { includePagination = false, includeSort = false } = options ?? {};
  const params: Record<string, string | number | boolean> = {};

  if (includePagination) {
    if (query.page != null) params.page = query.page;
    if (query.limit != null) params.limit = query.limit;
  }
  if (query.search?.trim()) params.search = query.search.trim();
  if (query.userId) params.userId = query.userId;
  if (query.attendanceRuleId) params.attendanceRuleId = query.attendanceRuleId;
  if (query.ruleTypeId) params.ruleTypeId = query.ruleTypeId;
  if (query.actionTaken != null) params.actionTaken = query.actionTaken;
  if (query.actionType) params.actionType = query.actionType;
  if (query.actionTypes) params.actionTypes = query.actionTypes;
  if (query.from) params.from = query.from;
  if (query.to) params.to = query.to;
  if (includeSort) {
    if (query.orderBy) params.orderBy = query.orderBy;
    if (query.orderDirection) params.orderDirection = query.orderDirection;
  }

  return params;
};
