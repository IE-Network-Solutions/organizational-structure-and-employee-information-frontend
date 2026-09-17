import type { DeadlineKind } from '@/app/(afterLogin)/dashboard/_components/plan/deadline/types';

export type TaskWithParent = {
  id: string;
  parentId?: string | null;
};

export type HierarchicalTaskRow<T extends TaskWithParent> = T & {
  children?: HierarchicalTaskRow<T>[];
  treeDepth?: number;
};

/** Nest visible tasks under parentId; daily duration stays flat. */
export function buildHierarchicalTaskRows<T extends TaskWithParent>(
  flatRows: T[],
  durationKind: DeadlineKind,
): HierarchicalTaskRow<T>[] {
  if (durationKind === 'daily' || flatRows.length === 0) {
    return flatRows.map((row) => ({ ...row, treeDepth: 0 }));
  }

  const visibleIds = new Set(flatRows.map((r) => r.id));

  const getChildren = (parentId: string): T[] =>
    flatRows.filter(
      (row) => String(row.parentId ?? '') === parentId && row.id !== parentId,
    );

  const childIds = new Set(
    flatRows
      .filter(
        (row) =>
          row.parentId &&
          visibleIds.has(String(row.parentId)) &&
          String(row.parentId) !== row.id,
      )
      .map((row) => row.id),
  );

  const roots = flatRows.filter((row) => !childIds.has(row.id));

  const attach = (node: T, depth: number): HierarchicalTaskRow<T> => {
    const kids = getChildren(node.id).map((child) => attach(child, depth + 1));
    return {
      ...node,
      treeDepth: depth,
      ...(kids.length > 0 ? { children: kids } : {}),
    };
  };

  return roots.map((root) => attach(root, 0));
}
