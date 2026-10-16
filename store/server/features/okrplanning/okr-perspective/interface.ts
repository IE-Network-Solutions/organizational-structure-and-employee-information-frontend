export interface OkrPerspective {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  isSystem: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
