export function reconcileSelectedSessionIds(
  selectedSessionIds: string[],
  allSessionIds: string[],
) {
  if (selectedSessionIds.length === 0) return [];
  const validSessionIds = new Set(allSessionIds);
  return selectedSessionIds.filter((id) => validSessionIds.has(id));
}
