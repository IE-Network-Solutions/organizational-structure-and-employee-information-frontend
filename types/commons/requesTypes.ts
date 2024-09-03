export interface RequestCommonQueryData {
  limit: string;
  page: string;
  cacheQueries?: string;
  countQueries?: string;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
  paginationType?: 'limit' | 'take';
}
