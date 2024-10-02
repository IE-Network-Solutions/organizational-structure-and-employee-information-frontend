export interface CategoryData {
  id?: string;
  name: string;
  description: string;
  items?: any[];
  users?: string[];
}

interface Item {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  description: string;
  tenantId: string | null;
}

interface Meta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface ResponseData {
  items: Item[];
  meta: Meta;
}

export interface CategoryFetch {
  pageSize: number;
  currentPage: number;
}
