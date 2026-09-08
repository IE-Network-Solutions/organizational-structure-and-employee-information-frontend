/**
 * Postgres uuid columns reject "". Treat blank / invalid values as omitted.
 */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function toOptionalUuid(value: unknown): string | undefined {
  if (value == null) return undefined;
  const raw = String(value).trim();
  if (!raw) return undefined;
  return UUID_RE.test(raw) ? raw : undefined;
}

/** Drop client-only / empty fields before POST /objective. */
export function sanitizeCreateObjectivePayload(
  raw: Record<string, any> | null | undefined,
  fallbackUserId?: string,
): Record<string, any> {
  const src = raw && typeof raw === 'object' ? raw : {};
  const userId = toOptionalUuid(src.userId) || toOptionalUuid(fallbackUserId);
  const deadline =
    src.deadline != null && String(src.deadline).trim() !== ''
      ? String(src.deadline).trim()
      : undefined;

  const keyResults = Array.isArray(src.keyResults)
    ? src.keyResults
        .filter((kr) => kr && typeof kr === 'object')
        .map((kr) => sanitizeKeyResultForCreate(kr, deadline))
    : [];

  const out: Record<string, any> = {
    title: String(src.title ?? '').trim(),
    keyResults,
  };

  if (userId) out.userId = userId;
  if (deadline) out.deadline = deadline;

  const description =
    src.description != null && String(src.description).trim() !== ''
      ? String(src.description).trim()
      : undefined;
  if (description) out.description = description;

  const aligned = toOptionalUuid(src.allignedKeyResultId);
  if (aligned) out.allignedKeyResultId = aligned;

  const sessionId = toOptionalUuid(src.sessionId);
  if (sessionId) out.sessionId = sessionId;

  return out;
}

function sanitizeKeyResultForCreate(
  kr: Record<string, any>,
  objectiveDeadline?: string,
): Record<string, any> {
  const out: Record<string, any> = {
    title: String(kr.title ?? '').trim(),
    weight: Number(kr.weight ?? 0),
  };

  const deadline =
    kr.deadline != null && String(kr.deadline).trim() !== ''
      ? String(kr.deadline).trim()
      : objectiveDeadline;
  if (deadline) out.deadline = deadline;

  const metricTypeId = toOptionalUuid(kr.metricTypeId);
  if (metricTypeId) out.metricTypeId = metricTypeId;

  const sessionId = toOptionalUuid(kr.sessionId);
  if (sessionId) out.sessionId = sessionId;

  const objectiveId = toOptionalUuid(kr.objectiveId);
  if (objectiveId) out.objectiveId = objectiveId;

  if (kr.description != null && String(kr.description).trim() !== '') {
    out.description = String(kr.description).trim();
  }

  for (const numKey of [
    'initialValue',
    'targetValue',
    'currentValue',
    'progress',
  ] as const) {
    if (kr[numKey] !== undefined && kr[numKey] !== null && kr[numKey] !== '') {
      const n = Number(kr[numKey]);
      if (Number.isFinite(n)) out[numKey] = n;
    }
  }

  if (Array.isArray(kr.milestones) && kr.milestones.length > 0) {
    out.milestones = kr.milestones
      .filter((m) => m && typeof m === 'object')
      .map((m) => ({
        title: String(m.title ?? '').trim(),
        weight: Number(m.weight ?? 0),
        ...(m.description != null && String(m.description).trim() !== ''
          ? { description: String(m.description).trim() }
          : {}),
        ...(m.status != null && String(m.status).trim() !== ''
          ? { status: m.status }
          : {}),
      }));
  }

  return out;
}
