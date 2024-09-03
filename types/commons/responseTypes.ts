export interface ResponseMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  error: string;
  meta: ResponseMeta;
  items: T[];
}
