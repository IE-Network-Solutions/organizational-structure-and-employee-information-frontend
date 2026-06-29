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
  description?: string | null;
  missedClockout?: boolean;
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
  description?: string;
  missedClockout?: boolean;
}

export type UpdateVpTimeConfigurationPayload =
  Partial<CreateVpTimeConfigurationPayload>;

interface VpTimeConfigurationFormValues {
  configType: VpTimeConfigType;
  startTime?: number;
  endTime?: number;
  applyAdditionalRules?: boolean;
  deductibleAmount?: number;
  description?: string;
  missedClockout?: boolean;
}

/**
 * Builds the create payload from modal form values.
 *
 * Rules:
 * - When `missedClockout` is checked (CLOCKOUT only), omit the time range and
 *   send `missedClockout: true`.
 * - When "apply additional rules" is checked, the range is open-ended so
 *   `toMinutes` is sent as `null`.
 */
export const buildVpTimeConfigurationPayload = (
  values: VpTimeConfigurationFormValues,
): CreateVpTimeConfigurationPayload => {
  const deductableAmount = Number(values.deductibleAmount ?? 0);
  const description = values.description?.trim() || undefined;

  if (
    values.configType === VpTimeConfigType.CLOCKOUT &&
    values.missedClockout
  ) {
    return {
      configType: VpTimeConfigType.CLOCKOUT,
      missedClockout: true,
      deductableAmount,
      ...(description ? { description } : {}),
    };
  }

  return {
    configType: values.configType,
    fromMinutes: Number(values.startTime ?? 0),
    toMinutes: values.applyAdditionalRules
      ? null
      : values.endTime != null
        ? Number(values.endTime)
        : null,
    deductableAmount,
    ...(description ? { description } : {}),
  };
};

export const getVpTimeConfigTitle = (item: VpTimeConfiguration): string => {
  if (item.missedClockout) {
    return 'Missed Clockout Configuration';
  }
  const from = item.fromMinutes ?? 0;
  if (item.toMinutes == null) {
    return `${from}+ Minute Configuration`;
  }
  return `${from}-${item.toMinutes} Minute Configuration`;
};
