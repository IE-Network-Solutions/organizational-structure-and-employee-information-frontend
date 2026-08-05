'use client';

import type { FormInstance } from 'antd';
import { useEffect } from 'react';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';

/** Plan tasks use `pre_achieved`; some payloads used `pre-achieved`. */
function isPreAchievedStatus(status: unknown): boolean {
  return status === 'pre_achieved' || status === 'pre-achieved';
}

function isLockedFromChildren(task: any): boolean {
  return Boolean(task?.lockedFromChildren);
}

function rollupStatusForTask(task: any): 'Done' | 'Not' | null {
  const status = task?.rollupStatus ?? task?.status;
  if (status === 'Done' || status === 'Not') return status;
  return null;
}

/**
 * Syncs store + form for create-report flow (drawer or inline card).
 * Mirrors the effects previously only in CreateReport.
 * Also prefills + locks parent rows derived from child plan reports.
 */
export function useCreateReportFormEffects(
  formattedData: any[] | null | undefined | false,
  form: FormInstance,
) {
  const setStatus = PlanningAndReportingStore((s) => s.setStatus);
  const selectedStatuses = PlanningAndReportingStore((s) => s.selectedStatuses);

  useEffect(() => {
    if (!formattedData || !Array.isArray(formattedData)) return;
    const newStatuses: Record<string, string> = {};
    let hasChanges = false;

    const considerTask = (task: any) => {
      if (selectedStatuses[task.taskId] !== undefined) return;

      if (isLockedFromChildren(task)) {
        const rollup = rollupStatusForTask(task);
        if (rollup) {
          newStatuses[task.taskId] = rollup;
          hasChanges = true;
        }
        return;
      }

      if (isPreAchievedStatus(task?.status)) {
        newStatuses[task.taskId] = 'Done';
        hasChanges = true;
      }
    };

    formattedData.forEach((objective: any) => {
      objective?.keyResults?.forEach((keyresult: any) => {
        keyresult?.milestones?.forEach((milestone: any) => {
          milestone?.tasks?.forEach(considerTask);
        });
        keyresult?.tasks?.forEach(considerTask);
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
    if (Object.keys(selectedStatuses).length === 0) return;

    const initialValues: Record<string, any> = {};

    const applyTaskValues = (task: any) => {
      if (!selectedStatuses[task.taskId]) return;

      if (isLockedFromChildren(task)) {
        const status = selectedStatuses[task.taskId];
        const actual = Number(
          task?.rollupActualValue ?? task?.actualValue ?? 0,
        );
        initialValues[task.taskId] = {
          status,
          actualValue: actual,
          ...(status === 'Not'
            ? {
                customReason:
                  task?.rollupCustomReason ||
                  'Failed based on child plan reports',
              }
            : {}),
        };
        return;
      }

      if (selectedStatuses[task.taskId] === 'Done') {
        initialValues[task.taskId] = {
          status: selectedStatuses[task.taskId],
          actualValue: Number(task?.targetValue ?? 0),
        };
      } else if (selectedStatuses[task.taskId] === 'Not') {
        initialValues[task.taskId] = {
          status: selectedStatuses[task.taskId],
          actualValue: Number(task?.actualValue ?? 0),
        };
      }
    };

    formattedData.forEach((objective: any) => {
      objective?.keyResults?.forEach((keyresult: any) => {
        keyresult?.milestones?.forEach((milestone: any) => {
          milestone?.tasks?.forEach(applyTaskValues);
        });
        keyresult?.tasks?.forEach(applyTaskValues);
      });
    });

    if (Object.keys(initialValues).length > 0) {
      form.setFieldsValue(initialValues);
    }
  }, [formattedData, selectedStatuses, form]);
}
