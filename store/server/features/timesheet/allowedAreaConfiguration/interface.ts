import {
  AllowedAreaConfiguration,
  AllowedAreaResolverType,
} from '@/types/timesheet/settings';

export interface AllowedAreaConfigurationListQuery {
  departmentId?: string;
}

export interface AllowedAreaConfigurationQueryData {
  id?: string;
  departmentId?: string;
}

export enum AllowedAreaConfigType {
  DEPARTMENT_BASED = 'DEPARTMENT_BASED',
  USER_BASED = 'USER_BASED',
}

export const CONFIG_TYPE_LABELS: Record<AllowedAreaConfigType, string> = {
  [AllowedAreaConfigType.DEPARTMENT_BASED]: 'Department Based',
  [AllowedAreaConfigType.USER_BASED]: 'User Based',
};

export type DepartmentBasedConfigPayload = {
  configType: AllowedAreaConfigType.DEPARTMENT_BASED;
  departmentId: string;
};

export type UserBasedConfigPayload = {
  configType: AllowedAreaConfigType.USER_BASED;
  departmentId?: string;
  userIds: string[];
};

export type CreateAllowedAreaConfigurationWithUsersPayload =
  | DepartmentBasedConfigPayload
  | UserBasedConfigPayload;

export interface AllowedAreaConfigurationPayload {
  id?: string;
  resolverType: AllowedAreaResolverType;
  departmentId?: string | null;
  userIds?: string[];
}

export const toApiConfigType = (
  resolverType: AllowedAreaResolverType,
): AllowedAreaConfigType =>
  resolverType === AllowedAreaResolverType.USER_BASED
    ? AllowedAreaConfigType.USER_BASED
    : AllowedAreaConfigType.DEPARTMENT_BASED;

export const fromApiConfigType = (
  configType?: string | null,
): AllowedAreaResolverType | undefined => {
  if (!configType) return undefined;
  const normalized = configType.toUpperCase();
  if (
    normalized === AllowedAreaConfigType.USER_BASED ||
    configType === AllowedAreaResolverType.USER_BASED
  ) {
    return AllowedAreaResolverType.USER_BASED;
  }
  if (
    normalized === AllowedAreaConfigType.DEPARTMENT_BASED ||
    configType === AllowedAreaResolverType.DEPARTMENT_BASED
  ) {
    return AllowedAreaResolverType.DEPARTMENT_BASED;
  }
  return undefined;
};

export const getAllowedAreaConfigType = (
  item: AllowedAreaConfiguration,
): AllowedAreaResolverType =>
  fromApiConfigType(item.configType) ??
  item.resolverType ??
  AllowedAreaResolverType.DEPARTMENT_BASED;

export const getAllowedAreaConfigUserIds = (
  item: AllowedAreaConfiguration,
): string[] => {
  if (item.userIds?.length) {
    return item.userIds.map(String);
  }
  return (item.userAllowedAreaConfigs ?? []).map((entry) =>
    String(entry.userId),
  );
};

export const isUserBasedAllowedAreaConfig = (
  item: AllowedAreaConfiguration,
): boolean =>
  getAllowedAreaConfigType(item) === AllowedAreaResolverType.USER_BASED;

export const getAllowedAreaConfigTypeLabel = (
  item: AllowedAreaConfiguration,
): string => {
  const configType = getAllowedAreaConfigType(item);
  return configType === AllowedAreaResolverType.USER_BASED
    ? CONFIG_TYPE_LABELS[AllowedAreaConfigType.USER_BASED]
    : CONFIG_TYPE_LABELS[AllowedAreaConfigType.DEPARTMENT_BASED];
};

export const buildCreateAllowedAreaConfigurationPayload = (values: {
  configType: AllowedAreaResolverType;
  departmentId: string;
  userIds?: string[];
}): CreateAllowedAreaConfigurationWithUsersPayload => {
  if (values.configType === AllowedAreaResolverType.USER_BASED) {
    return {
      configType: AllowedAreaConfigType.USER_BASED,
      ...(values.departmentId ? { departmentId: values.departmentId } : {}),
      userIds: values.userIds ?? [],
    };
  }

  return {
    configType: AllowedAreaConfigType.DEPARTMENT_BASED,
    departmentId: values.departmentId,
  };
};

export type UpdateAllowedAreaConfigurationPayload = {
  id: string;
  departmentId?: string;
  configType?: AllowedAreaConfigType;
  userIds?: string[];
};

export const buildUpdateAllowedAreaConfigurationPayload = (
  id: string,
  values: {
    configType: AllowedAreaResolverType;
    departmentId: string;
    userIds?: string[];
  },
): UpdateAllowedAreaConfigurationPayload => {
  const payload: UpdateAllowedAreaConfigurationPayload = {
    id,
    configType: toApiConfigType(values.configType),
  };

  if (values.configType === AllowedAreaResolverType.USER_BASED) {
    payload.userIds = values.userIds ?? [];
  }

  return payload;
};
