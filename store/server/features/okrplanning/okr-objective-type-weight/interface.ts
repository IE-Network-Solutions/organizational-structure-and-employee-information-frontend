export type OkrWeightScopeType = 'TENANT' | 'DEPARTMENT' | 'USER';

export interface OkrObjectiveTypeWeightLine {
  id?: string;
  assignmentId?: string;
  objectiveTypeId: string;
  weightPercent: number;
}

export interface OkrObjectiveTypeWeightAssignment {
  id: string;
  tenantId: string;
  scopeType: OkrWeightScopeType;
  scopeId: string | null;
  lines: OkrObjectiveTypeWeightLine[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface EffectiveWeightLine {
  objectiveTypeId: string;
  name: string;
  weightPercent: number;
}

export interface EffectiveWeightsResponse {
  source: OkrWeightScopeType;
  lines: EffectiveWeightLine[];
}

export interface OkrObjectiveTypeWeightLineDto {
  objectiveTypeId: string;
  weightPercent: number;
}

export interface UpsertOkrObjectiveTypeWeightDto {
  scopeType: OkrWeightScopeType;
  scopeId?: string | null;
  lines: OkrObjectiveTypeWeightLineDto[];
}

export interface GetAssignmentsFilter {
  scopeType?: OkrWeightScopeType;
  scopeId?: string | null;
}
