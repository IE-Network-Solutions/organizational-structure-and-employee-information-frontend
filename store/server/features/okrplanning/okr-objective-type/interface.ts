export interface OkrObjectiveType {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface CreateOkrObjectiveTypeDto {
  name: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateOkrObjectiveTypeDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}
