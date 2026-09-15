export enum VpTimeConfigType {
  CLOCKIN = 'CLOCKIN',
  CLOCKOUT = 'CLOCKOUT',
}

export interface VpTimeConfiguration {
  id: string;
  configType: VpTimeConfigType;
  fromMinutes: number | null;
  toMinutes: number | null;
  deductableAmount: number;
  salaryDeductionMinutes?: number | null;
  description?: string | null;
  missedClockout?: boolean;
  isAbsent?: boolean;
  attendanceRuleId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface VpTimeConfigurationListQuery {
  configType?: VpTimeConfigType;
}

export interface CreateVpTimeConfigurationPayload {
  configType: VpTimeConfigType;
  fromMinutes?: number;
  toMinutes?: number | null;
  deductableAmount: number;
  salaryDeductionMinutes?: number | null;
  description?: string;
  missedClockout?: boolean;
  isAbsent?: boolean;
  attendanceRuleId?: string;
}

export type UpdateVpTimeConfigurationPayload =
  Partial<CreateVpTimeConfigurationPayload>;

interface VpTimeConfigurationFormValues {
  configType: VpTimeConfigType;
  startTime?: number;
  endTime?: number;
  applyAdditionalRules?: boolean;
  deductibleAmount?: number;
  salaryDeductionEnabled?: boolean;
  salaryDeductionMinutes?: number;
  description?: string;
  missedClockout?: boolean;
  isAbsent?: boolean;
  attendanceRuleId?: string;
}

/**
 * Builds the create payload from modal form values.
 *
 * Rules:
 * - When `missedClockout` is checked (CLOCKOUT only), omit the time range and
 *   send `missedClockout: true`.
 * - When "apply additional rules" is checked, the range is open-ended so
 *   `toMinutes` is sent as `null`.
 * - When `isAbsent` is checked (CLOCKIN only), include `isAbsent` and
 *   `attendanceRuleId` alongside the time range.
 */
export const buildVpTimeConfigurationPayload = (
  values: VpTimeConfigurationFormValues,
): CreateVpTimeConfigurationPayload => {
  const deductableAmount = Number(values.deductibleAmount ?? 0);
  const description = values.description?.trim() || undefined;
  const salaryDeductionMinutes =
    values.salaryDeductionEnabled && values.salaryDeductionMinutes != null
      ? Number(values.salaryDeductionMinutes)
      : null;

  if (
    values.configType === VpTimeConfigType.CLOCKOUT &&
    values.missedClockout
  ) {
    return {
      configType: VpTimeConfigType.CLOCKOUT,
      missedClockout: true,
      deductableAmount,
      salaryDeductionMinutes,
      ...(description ? { description } : {}),
    };
  }

  const isAbsent =
    values.configType === VpTimeConfigType.CLOCKIN && Boolean(values.isAbsent);

  return {
    configType: values.configType,
    fromMinutes: Number(values.startTime ?? 0),
    toMinutes: values.applyAdditionalRules
      ? null
      : values.endTime != null
        ? Number(values.endTime)
        : null,
    deductableAmount,
    salaryDeductionMinutes,
    ...(description ? { description } : {}),
    ...(isAbsent
      ? {
          isAbsent: true,
          ...(values.attendanceRuleId
            ? { attendanceRuleId: values.attendanceRuleId }
            : {}),
        }
      : {}),
  };
};

export const getVpTimeConfigTitle = (item: VpTimeConfiguration): string => {
  if (item.missedClockout) {
    return 'Missed Clockout Configuration';
  }
  if (item.isAbsent) {
    const from = item.fromMinutes ?? 0;
    if (item.toMinutes == null) {
      return `${from}+ Minute Absent Configuration`;
    }
    return `${from}-${item.toMinutes} Minute Absent Configuration`;
  }
  const from = item.fromMinutes ?? 0;
  if (item.toMinutes == null) {
    return `${from}+ Minute Configuration`;
  }
  return `${from}-${item.toMinutes} Minute Configuration`;
};
