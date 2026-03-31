export type BasecampModuleCategory =
  | 'personal_notifications'
  | 'public_posts';

export interface BasecampModuleRow {
  slug: string;
  displayName: string;
  category: BasecampModuleCategory;
  enabled: boolean;
}

export interface BasecampStatus {
  connected: boolean;
  connectedAt?: string;
  accountId?: string;
}

export interface BasecampProjectMapping {
  id?: string;
  tenantId?: string;
  selamnewModule: string;
  basecampProjectId: string;
  basecampProjectName?: string | null;
}

export interface BasecampUserMapping {
  id?: string;
  tenantId?: string;
  selamnewUserId: string;
  basecampUserId: string;
}

export interface BasecampProjectOption {
  id: number;
  name: string;
}

export interface BasecampPersonOption {
  id: number;
  name: string;
  email_address?: string;
}
