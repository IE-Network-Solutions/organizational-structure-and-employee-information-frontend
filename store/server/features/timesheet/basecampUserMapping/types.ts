export interface BasecampUserMappingItem {
  id: string;
  userId: string;
  basecampPersonId: string;
  basecampDisplayName: string | null;
  basecampEmail: string | null;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBasecampUserMappingDto {
  userId: string;
  basecampPersonId: string;
  basecampDisplayName?: string;
  basecampEmail?: string;
}

export interface UpdateBasecampUserMappingDto {
  userId?: string;
  basecampPersonId?: string;
  basecampDisplayName?: string;
  basecampEmail?: string;
}
