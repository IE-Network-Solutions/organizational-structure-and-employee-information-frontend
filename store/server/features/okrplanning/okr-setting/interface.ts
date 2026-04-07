export interface OkrSetting {
  id: string;
  name: 'Basic' | 'Advanced';
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OkrSettingCheckResponse {
  exists: boolean;
}

export interface OkrSettingRequest {
  name: 'Basic' | 'Advanced';
}
