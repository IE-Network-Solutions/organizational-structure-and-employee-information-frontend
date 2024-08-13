export interface Branch {
  id?: string;
  name: string;
  description: string;
  location: string;
  contactNumber: string;
  contactEmail: string;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface Meta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface BranchResponse {
  items: Branch[];
  meta: Meta;
}
