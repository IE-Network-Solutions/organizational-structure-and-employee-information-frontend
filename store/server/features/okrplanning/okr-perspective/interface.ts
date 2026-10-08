export interface OkrPerspective {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  isSystem: boolean;
  sortOrder: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
