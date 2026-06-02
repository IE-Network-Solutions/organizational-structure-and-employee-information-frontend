/** Normalizes paginated list responses from org-emp GET /users (and similar). */
export type PaginatedList<T> = {
  items: T[];
  meta: {
    totalItems: number;
    itemCount?: number;
    totalPages?: number;
    currentPage?: number;
  };
};

export function normalizePaginatedListResponse<T = unknown>(
  raw: unknown,
): PaginatedList<T> {
  if (!raw || typeof raw !== 'object') {
    return { items: [], meta: { totalItems: 0, itemCount: 0 } };
  }

  const body = raw as Record<string, unknown>;

  const nested =
    body.data && typeof body.data === 'object'
      ? (body.data as Record<string, unknown>)
      : null;
  const source = nested ?? body;

  const items = Array.isArray(source.items)
    ? (source.items as T[])
    : Array.isArray(source)
      ? (source as T[])
      : [];

  const metaRaw =
    source.meta && typeof source.meta === 'object'
      ? (source.meta as Record<string, unknown>)
      : {};

  const totalItems =
    Number(metaRaw.totalItems ?? metaRaw.total ?? items.length) || 0;

  return {
    items,
    meta: {
      totalItems,
      itemCount: Number(metaRaw.itemCount ?? items.length) || items.length,
      totalPages: metaRaw.totalPages as number | undefined,
      currentPage: metaRaw.currentPage as number | undefined,
    },
  };
}
