/** Default bank fields rendered in the manage-employee Bank Information card. */
export const BANK_DEFAULT_FIELDS: Record<string, string> = {
  bankName: '',
  branch: '',
  accountName: '',
  accountNumber: '',
};

export const BANK_DEFAULT_FIELD_KEYS = new Set(Object.keys(BANK_DEFAULT_FIELDS));

/** employee_information JSON columns stored as strings in the API/DB. */
export const EMPLOYEE_INFO_JSON_FIELDS = [
  'bankInformation',
  'addresses',
  'emergencyContact',
  'additionalInformation',
] as const;

/** API may return bankInformation as object or JSON string. */
export function normalizeBankInformation(
  raw: unknown,
): Record<string, unknown> {
  if (raw == null) return {};
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return {};
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return { ...(parsed as Record<string, unknown>) };
      }
    } catch {
      return {};
    }
    return {};
  }
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return { ...(raw as Record<string, unknown>) };
  }
  return {};
}

/** Resolve bank payload from PATCH employee-information response shapes. */
export function extractBankInformationFromPatchResponse(
  data: unknown,
  patchValues?: Record<string, unknown>,
): Record<string, unknown> | null {
  const fromSubmit = patchValues?.bankInformation
    ? normalizeBankInformation(patchValues.bankInformation)
    : null;

  if (data == null || typeof data !== 'object') {
    return fromSubmit;
  }

  const root = data as Record<string, unknown>;

  if (root.bankInformation != null) {
    return {
      ...fromSubmit,
      ...normalizeBankInformation(root.bankInformation),
    };
  }

  const nested = root.data;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const inner = nested as Record<string, unknown>;
    if (inner.bankInformation != null) {
      return {
        ...fromSubmit,
        ...normalizeBankInformation(inner.bankInformation),
      };
    }
  }

  const employeeInformation = root.employeeInformation;
  if (
    employeeInformation &&
    typeof employeeInformation === 'object' &&
    !Array.isArray(employeeInformation)
  ) {
    const ei = employeeInformation as Record<string, unknown>;
    if (ei.bankInformation != null) {
      return {
        ...fromSubmit,
        ...normalizeBankInformation(ei.bankInformation),
      };
    }
  }

  return fromSubmit;
}

/** Merge existing bank JSON with form values. */
export function mergeBankInformationFields(
  existingRaw: unknown,
  updates: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...normalizeBankInformation(existingRaw),
    ...updates,
  };
}

/**
 * Build a JSON column value for PATCH /employee-information/:id.
 * Backend DTO validates with @IsJSON — value must be a JSON string.
 */
export function prepareJsonFieldForPatch(
  existingRaw: unknown,
  updates: Record<string, unknown>,
): string {
  return JSON.stringify(mergeBankInformationFields(existingRaw, updates));
}

/** Turn PATCH payload JSON strings into objects for React Query cache / UI. */
export function normalizePatchPayloadForCache(
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const next = { ...patch };
  for (const key of EMPLOYEE_INFO_JSON_FIELDS) {
    if (key in next && typeof next[key] === 'string') {
      next[key] = normalizeBankInformation(next[key]);
    }
  }
  return next;
}

/** Parse JSON column strings on an employee-information record for display. */
export function parseEmployeeInformationJsonFields(
  employeeInformation: Record<string, unknown>,
): Record<string, unknown> {
  const next = { ...employeeInformation };
  for (const key of EMPLOYEE_INFO_JSON_FIELDS) {
    if (key in next) {
      next[key] = normalizeBankInformation(next[key]);
    }
  }
  return next;
}

export function buildBankFieldsForDisplay(
  employeeData: { employeeInformation?: { bankInformation?: unknown } } | undefined,
  bankInformationCustomFields: Array<{ fieldName: string }>,
  override?: Record<string, unknown> | null,
): Record<string, unknown> {
  const existing = normalizeBankInformation(
    employeeData?.employeeInformation?.bankInformation,
  );
  const fields: Record<string, unknown> = {
    ...BANK_DEFAULT_FIELDS,
    ...existing,
    ...(override ?? {}),
  };
  for (const field of bankInformationCustomFields) {
    if (!(field.fieldName in fields)) {
      fields[field.fieldName] = existing[field.fieldName] ?? '';
    }
  }
  return fields;
}

/** Merge a fresh employee-information row into cache without clobbering a just-saved bank PATCH. */
export function mergeEmployeeInformationRowPreservingBank(
  current: Record<string, unknown> | undefined,
  freshRow: Record<string, unknown>,
  bankPatch: Record<string, unknown> | null,
): Record<string, unknown> {
  const parsedFresh = parseEmployeeInformationJsonFields(freshRow);
  const merged = { ...(current ?? {}), ...parsedFresh };

  if (bankPatch && Object.keys(bankPatch).length > 0) {
    merged.bankInformation = {
      ...normalizeBankInformation(merged.bankInformation),
      ...bankPatch,
    };
  }

  return merged;
}

/** True when cached bank JSON matches the last saved form values (all default keys). */
export function bankInformationMatchesSnapshot(
  employeeInformation: { bankInformation?: unknown } | undefined,
  snapshot: Record<string, unknown> | null,
): boolean {
  if (!snapshot) return false;
  const fromApi = normalizeBankInformation(employeeInformation?.bankInformation);
  return Object.keys(BANK_DEFAULT_FIELDS).every(
    (key) => String(fromApi[key] ?? '') === String(snapshot[key] ?? ''),
  );
}
