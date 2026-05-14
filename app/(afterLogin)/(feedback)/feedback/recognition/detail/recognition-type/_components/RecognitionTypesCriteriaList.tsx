'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { useRecongnitionStore } from '@/store/uistate/features/conversation/recognition';
import RecognitionTypeCriteriaCard from './RecognitionTypeCriteriaCard';
import {
  formatFrequency,
  getRecognitionTypeRows,
} from './recognitionTypeCriteriaUtils';

type Props = {
  items: unknown[] | undefined;
  departmentNameById: Map<string, string>;
};

export default function RecognitionTypesCriteriaList({
  items,
  departmentNameById,
}: Props) {
  const {
    typesCriteriaExpanded: expanded,
    setTypesCriteriaExpanded: setExpanded,
  } = useRecongnitionStore();
  const didAutoExpand = useRef(false);
  const lastItemsRef = useRef<unknown[] | undefined>(undefined);

  const rows = useMemo(() => getRecognitionTypeRows(items), [items]);

  useEffect(() => {
    if (lastItemsRef.current !== items) {
      lastItemsRef.current = items;
      didAutoExpand.current = false;
      setExpanded({});
    }
  }, [items, setExpanded]);

  useEffect(() => {
    if (!rows.length || didAutoExpand.current) return;
    setExpanded({ [rows[0].id]: true });
    didAutoExpand.current = true;
  }, [rows, setExpanded]);

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!rows.length) {
    return (
      <div
        className="rounded-lg border border-dashed border-[#DEE2E6] bg-white py-12 text-center text-sm text-[#6C757D]"
        data-cy="recognition-types-criteria-empty"
      >
        No recognition types match your search.
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-4"
      data-cy="recognition-types-criteria-list"
    >
      {rows.map((type) => {
        const isOpen = !!expanded[type.id];
        const freqLabel = formatFrequency(type.frequency);
        const deptLabel =
          type.department?.name?.trim() ||
          (type.departmentId
            ? (departmentNameById.get(type.departmentId) ?? 'Department')
            : 'All Departments');

        return (
          <RecognitionTypeCriteriaCard
            key={type.id}
            type={type}
            departmentLabel={deptLabel}
            frequencyLabel={freqLabel}
            expanded={isOpen}
            onToggle={() => toggle(type.id)}
          />
        );
      })}
    </div>
  );
}
