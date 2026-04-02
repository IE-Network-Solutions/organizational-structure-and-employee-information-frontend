/** Reorder `ids` by moving `activeId` so it ends up just before index `insertBeforeIndex` in the final list. */
export function reorderIdsAtInsertBefore(
  ids: string[],
  activeId: string,
  insertBeforeIndex: number,
): string[] {
  const oldIndex = ids.indexOf(activeId);
  if (oldIndex === -1) return ids;

  const next = [...ids];
  next.splice(oldIndex, 1);

  let target = insertBeforeIndex;
  if (oldIndex < insertBeforeIndex) {
    target -= 1;
  }

  const clamped = Math.max(0, Math.min(target, next.length));
  next.splice(clamped, 0, activeId);
  return next;
}

/**
 * Map a "line before index i in listIds" to an insert index in `orderedIds` only
 * (skips existing draft rows in listIds).
 */
export function listIdsInsertBeforeToOrderedInsertAt(
  listIds: string[],
  insertBeforeIndex: number,
): number {
  let n = 0;
  for (let i = 0; i < insertBeforeIndex; i++) {
    const id = listIds[i];
    if (!String(id).startsWith('draft-')) {
      n += 1;
    }
  }
  return n;
}
