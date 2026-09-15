import {
  EMPLOYEE_SCORECARD_VP_CRITERION,
  findVpCriterionById,
  type VpCriterionItem,
} from './prototypeCriteria';

export const MOCK_VP_SCORING_ID_PREFIX = 'mock-vp-scoring-';

const STORAGE_KEY = 'vp-scoring-prototype-mock-v1';

export type MockVpScoringCriterion = {
  id: string;
  vpCriteriaId: string;
  weight: string | number;
  vpCriteria: { id: string; name: string };
};

export type MockVpScoringUser = {
  id: string;
  userId: string;
};

export type MockVpScoringConfig = {
  id: string;
  name: string;
  totalPercentage: number;
  vpScoringCriterions: MockVpScoringCriterion[];
  userVpScoring: MockVpScoringUser[];
  isMock: true;
};

export type VpScoringWritePayload = {
  name: string;
  totalPercentage: number;
  createUserVpScoringDto: Array<{ userId: string; id?: string }>;
  vpScoringCriteria: Array<{
    vpCriteriaId: string;
    weight: string | number;
    id?: string;
  }>;
  createdBy?: string;
  updatedBy?: string;
};

export function isPrototypeVpCriterionId(vpCriteriaId: string): boolean {
  return vpCriteriaId.startsWith('prototype-');
}

export function isMockVpScoringId(id: string): boolean {
  return id.startsWith(MOCK_VP_SCORING_ID_PREFIX);
}

export function payloadUsesPrototypeCriteria(
  payload: VpScoringWritePayload,
): boolean {
  return (payload.vpScoringCriteria ?? []).some((row) =>
    isPrototypeVpCriterionId(row.vpCriteriaId),
  );
}

function createLocalId(prefix: string) {
  const suffix =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}${suffix}`;
}

function readStore(): MockVpScoringConfig[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStore(configs: MockVpScoringConfig[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}

export function listMockVpScoringConfigs(): MockVpScoringConfig[] {
  return readStore();
}

export function getMockVpScoringById(id: string): MockVpScoringConfig | null {
  return readStore().find((item) => item.id === id) ?? null;
}

function resolveCriterionName(
  vpCriteriaId: string,
  criteriaCatalog: VpCriterionItem[],
): string {
  if (vpCriteriaId === EMPLOYEE_SCORECARD_VP_CRITERION.id) {
    return EMPLOYEE_SCORECARD_VP_CRITERION.name;
  }
  return (
    findVpCriterionById(criteriaCatalog, vpCriteriaId)?.name ??
    'Unknown criterion'
  );
}

function buildMockRecord(
  payload: VpScoringWritePayload,
  criteriaCatalog: VpCriterionItem[],
  existingId?: string,
): MockVpScoringConfig {
  const id = existingId ?? createLocalId(MOCK_VP_SCORING_ID_PREFIX);

  return {
    id,
    name: payload.name,
    totalPercentage: Number(payload.totalPercentage),
    isMock: true,
    userVpScoring: (payload.createUserVpScoringDto ?? []).map((row) => ({
      id: row.id ?? createLocalId('mock-user-vp-'),
      userId: row.userId,
    })),
    vpScoringCriterions: (payload.vpScoringCriteria ?? []).map((row) => ({
      id: row.id ?? createLocalId('mock-vp-criterion-'),
      vpCriteriaId: row.vpCriteriaId,
      weight: row.weight,
      vpCriteria: {
        id: row.vpCriteriaId,
        name: resolveCriterionName(row.vpCriteriaId, criteriaCatalog),
      },
    })),
  };
}

export function createMockVpScoringConfig(
  payload: VpScoringWritePayload,
  criteriaCatalog: VpCriterionItem[],
): MockVpScoringConfig {
  const record = buildMockRecord(payload, criteriaCatalog);
  const next = [...readStore(), record];
  writeStore(next);
  return record;
}

export function updateMockVpScoringConfig(
  id: string,
  payload: VpScoringWritePayload,
  criteriaCatalog: VpCriterionItem[],
): MockVpScoringConfig {
  const record = buildMockRecord(payload, criteriaCatalog, id);
  const next = readStore().map((item) => (item.id === id ? record : item));
  writeStore(next);
  return record;
}

export function deleteMockVpScoringConfig(id: string) {
  writeStore(readStore().filter((item) => item.id !== id));
}

/** Strip prototype criteria before sending to the real API. */
export function toApiVpScoringPayload(payload: VpScoringWritePayload) {
  return {
    ...payload,
    vpScoringCriteria: (payload.vpScoringCriteria ?? []).filter(
      (row) => !isPrototypeVpCriterionId(row.vpCriteriaId),
    ),
  };
}

export function canPersistViaApi(payload: VpScoringWritePayload): boolean {
  const apiPayload = toApiVpScoringPayload(payload);
  return (
    apiPayload.vpScoringCriteria.length > 0 &&
    (apiPayload.createUserVpScoringDto?.length ?? 0) > 0
  );
}
