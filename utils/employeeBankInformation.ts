/** Default bank fields rendered in the manage-employee Bank Information card. */
export const BANK_DEFAULT_FIELDS: Record<string, string> = {
  bankName: '',
  branch: '',
  accountName: '',
  accountNumber: '',
};

export const BANK_DEFAULT_FIELD_KEYS = new Set(Object.keys(BANK_DEFAULT_FIELDS));

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
