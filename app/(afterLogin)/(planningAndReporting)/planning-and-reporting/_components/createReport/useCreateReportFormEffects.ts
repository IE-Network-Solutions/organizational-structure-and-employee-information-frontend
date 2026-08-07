'use client';

import type { FormInstance } from 'antd';
import { useEffect, useRef } from 'react';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';

/** Plan tasks use `pre_achieved`; some payloads used `pre-achieved`. */
function isPreAchievedStatus(status: unknown): boolean {
  return status === 'pre_achieved' || status === 'pre-achieved';
}

function toNumericActual(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'number') return Number.isNaN(value) ? fallback : value;
  const parsed = Number(String(value).replace(/,/g, ''));
  return Number.isNaN(parsed) ? fallback : parsed;
}

/**
 * Syncs store + form for create-report flow (drawer or inline card).
 * Only applies default actualValue when a task's status first changes —
 * never overwrites a value the user (or edit hydrate) already entered.
 */
export function useCreateReportFormEffects(
  formattedData: any[] | null | undefined | false,
  form: FormInstance,
) {
  const setStatus = PlanningAndReportingStore((s) => s.setStatus);
  const selectedStatuses = PlanningAndReportingStore((s) => s.selectedStatuses);
  /** Last statuses we applied defaults for — avoids wiping typed Achieved on re-renders. */
  const appliedStatusRef = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!formattedData || !Array.isArray(formattedData)) return;
    const newStatuses: Record<string, string> = {};
    let hasChanges = false;

    formattedData.forEach((objective: any) => {
      objective?.keyResults?.forEach((keyresult: any) => {
        keyresult?.milestones?.forEach((milestone: any) => {
          milestone?.tasks?.forEach((task: any) => {
            if (
              isPreAchievedStatus(task?.status) &&
              selectedStatuses[task.taskId] === undefined
            ) {
              newStatuses[task.taskId] = 'Done';
              hasChanges = true;
            }
          });
        });
        keyresult?.tasks?.forEach((task: any) => {
          if (
            isPreAchievedStatus(task?.status) &&
            selectedStatuses[task.taskId] === undefined
          ) {
            newStatuses[task.taskId] = 'Done';
            hasChanges = true;
          }
        });
      });
    });

    if (hasChanges) {
      Object.entries(newStatuses).forEach(([taskId, status]) => {
        setStatus(taskId, status);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- match CreateReport: avoid re-running when user changes statuses
  }, [formattedData, setStatus]);

  useEffect(() => {
    if (!formattedData || !Array.isArray(formattedData)) return;
    if (Object.keys(selectedStatuses).length === 0) {
      appliedStatusRef.current = {};
      return;
    }

    const currentValues = form.getFieldsValue(true) as Record<string, any>;
    const updates: Record<string, any> = {};
    const nextApplied = { ...appliedStatusRef.current };

    const applyStatusDefault = (task: any) => {
      const status = selectedStatuses[task.taskId];
      if (!status || (status !== 'Done' && status !== 'Not')) return;

      // Already applied this status for this task — do not reset Achieved.
      if (nextApplied[task.taskId] === status) return;

      const existing = currentValues?.[task.taskId];
      const existingActual = existing?.actualValue;

      if (status === 'Done') {
        updates[task.taskId] = {
          ...(existing ?? {}),
          status,
          // Prefer form value (Done click / edit hydrate); else default to target.
          actualValue:
            existingActual !== null &&
            existingActual !== undefined &&
            existingActual !== ''
              ? toNumericActual(existingActual)
              : Number(task?.targetValue ?? 0),
        };
      } else {
        // Prefer form value (edit hydrate / user input / Not click default).
        // Fall back to task payload, then 0 — never force-wipe a typed amount.
        const preserved =
          existingActual !== null &&
          existingActual !== undefined &&
          existingActual !== ''
            ? toNumericActual(existingActual)
            : toNumericActual(task?.actualValue, 0);
        updates[task.taskId] = {
          ...(existing ?? {}),
          status,
          actualValue: preserved,
        };
      }

      nextApplied[task.taskId] = status;
    };

    formattedData.forEach((objective: any) => {
      objective?.keyResults?.forEach((keyresult: any) => {
        keyresult?.milestones?.forEach((milestone: any) => {
          milestone?.tasks?.forEach((task: any) => {
            applyStatusDefault(task);
          });
        });
        keyresult?.tasks?.forEach((task: any) => {
          applyStatusDefault(task);
        });
      });
    });

    // Drop applied entries for tasks no longer in selectedStatuses (form reset).
    Object.keys(nextApplied).forEach((taskId) => {
      if (!selectedStatuses[taskId]) {
        delete nextApplied[taskId];
      }
    });
    appliedStatusRef.current = nextApplied;

    if (Object.keys(updates).length > 0) {
      form.setFieldsValue(updates);
    }
  }, [formattedData, selectedStatuses, form]);
}
