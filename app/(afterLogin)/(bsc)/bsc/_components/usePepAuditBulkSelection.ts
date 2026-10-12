'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  bulkSelectionKeys,
  pepAuditSelectionKey,
  resolveSelectedBulkItems,
  type PepAuditBulkItem,
} from '@/utils/bsc/pepAuditBulk';

export function usePepAuditBulkSelection() {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const clear = useCallback(() => setSelectedKeys([]), []);

  const toggleKey = useCallback((key: string, checked: boolean) => {
    setSelectedKeys((prev) => {
      if (checked) return prev.includes(key) ? prev : [...prev, key];
      return prev.filter((item) => item !== key);
    });
  }, []);

  const toggleItem = useCallback(
    (item: PepAuditBulkItem, checked: boolean) => {
      toggleKey(pepAuditSelectionKey(item), checked);
    },
    [toggleKey],
  );

  const isSelected = useCallback(
    (item: Pick<PepAuditBulkItem, 'scorecardId' | 'targetId'>) =>
      selectedKeys.includes(pepAuditSelectionKey(item)),
    [selectedKeys],
  );

  const selectAll = useCallback((items: PepAuditBulkItem[]) => {
    setSelectedKeys(bulkSelectionKeys(items));
  }, []);

  const resolveSelected = useCallback(
    (actionable: PepAuditBulkItem[]) =>
      resolveSelectedBulkItems(actionable, selectedKeys),
    [selectedKeys],
  );

  const selectedCount = selectedKeys.length;

  return useMemo(
    () => ({
      selectedKeys,
      setSelectedKeys,
      selectedCount,
      clear,
      toggleKey,
      toggleItem,
      isSelected,
      selectAll,
      resolveSelected,
    }),
    [
      clear,
      isSelected,
      resolveSelected,
      selectAll,
      selectedCount,
      selectedKeys,
      toggleItem,
      toggleKey,
    ],
  );
}
