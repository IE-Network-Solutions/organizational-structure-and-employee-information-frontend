export type OkrScoringMode = 'CLASSIC_AVERAGE' | 'TYPE_WEIGHTED';

export interface OkrSetting {
  id: string;
  name: 'Basic' | 'Advanced';
  tenantId: string;
  modeSwitchedAt?: Date | string | null;
  scoringMode?: OkrScoringMode;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface OkrSettingCheckResponse {
  exists: boolean;
}

export interface OkrSettingRequest {
  name: 'Basic' | 'Advanced';
  scoringMode?: OkrScoringMode;
}

export interface UpdateOkrSettingPayload {
  name?: 'Basic' | 'Advanced';
  scoringMode?: OkrScoringMode;
}
