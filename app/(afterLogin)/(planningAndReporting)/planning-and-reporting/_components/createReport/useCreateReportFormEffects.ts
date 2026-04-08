'use client';

import type { FormInstance } from 'antd';
import { useEffect } from 'react';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';

/** Plan tasks use `pre_achieved`; some payloads used `pre-achieved`. */
function isPreAchievedStatus(status: unknown): boolean {
  return status === 'pre_achieved' || status === 'pre-achieved';
}

/**
 * Syncs store + form for create-report flow (drawer or inline card).
 * Mirrors the effects previously only in CreateReport.
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
    if (Object.keys(selectedStatuses).length === 0) return;

    const initialValues: Record<string, any> = {};

    formattedData.forEach((objective: any) => {
      objective?.keyResults?.forEach((keyresult: any) => {
        keyresult?.milestones?.forEach((milestone: any) => {
          milestone?.tasks?.forEach((task: any) => {
            if (selectedStatuses[task.taskId]) {
              if (selectedStatuses[task.taskId] === 'Done') {
                initialValues[task.taskId] = {
                  status: selectedStatuses[task.taskId],
                  actualValue: Number(task?.targetValue ?? 0)?.toLocaleString(),
                };
              } else if (selectedStatuses[task.taskId] === 'Not') {
                initialValues[task.taskId] = {
                  status: selectedStatuses[task.taskId],
                  actualValue: Number(task?.actualValue ?? 0)?.toLocaleString(),
                };
              }
            }
          });
        });
        keyresult?.tasks?.forEach((task: any) => {
          if (selectedStatuses[task.taskId]) {
            if (selectedStatuses[task.taskId] === 'Done') {
              initialValues[task.taskId] = {
                status: selectedStatuses[task.taskId],
                actualValue: Number(task?.targetValue ?? 0)?.toLocaleString(),
              };
            } else if (selectedStatuses[task.taskId] === 'Not') {
              initialValues[task.taskId] = {
                status: selectedStatuses[task.taskId],
                actualValue: 0,
              };
            }
          }
        });
      });
    });

    if (Object.keys(initialValues).length > 0) {
      form.setFieldsValue(initialValues);
    }
  }, [formattedData, selectedStatuses, form]);
}
