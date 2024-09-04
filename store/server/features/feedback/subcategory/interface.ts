export interface Creator {
  name: string;
  role: string;
}

export interface Form {
  id: string;
  name: string;
  description: string;
  creator: Creator;
  createdAt: string;
  updatedAt: string;
  totalFeedbacks: number;
  users?: string[];
}

export interface Meta {
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface FormsResponse {
  items: Form[];
  meta: Meta;
}
