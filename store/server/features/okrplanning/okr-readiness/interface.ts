import { OkrScoringMode } from '../okr-setting/interface';

export interface MissingObjectiveType {
  id: string;
  name: string;
  weight: number;
}

export interface IncompleteObjective {
  id: string;
  title: string;
  reasons: string[];
}

export interface IncompleteKeyResult {
  id: string;
  title: string;
  objectiveId: string;
  reasons: string[];
}

export interface TypeChecklistItem {
  objectiveTypeId: string;
  name: string;
  weight: number;
  objectiveCount: number;
  status: 'ok' | 'missing' | 'incomplete';
}

export interface OkrReadinessResponse {
  canFinalize: boolean;
  scoringMode: OkrScoringMode;
  missingObjectiveTypes: MissingObjectiveType[];
  incompleteObjectives: IncompleteObjective[];
  incompleteKeyResults: IncompleteKeyResult[];
  typeChecklist: TypeChecklistItem[];
}

export interface FinalizeOkrPayload {
  userId: string;
  sessionId: string;
}
