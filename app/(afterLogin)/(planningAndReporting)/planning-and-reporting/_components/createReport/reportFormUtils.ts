import { NAME } from '@/types/enumTypes';

/** Suffix for actual-value input from KR metric type */
export function metricAddonSymbol(keyresult: any): string {
  const name = keyresult?.metricType?.name;
  if (name === NAME.CURRENCY) return '$';
  if (name === NAME.PERCENTAGE) return '%';
  if (name === NAME.NUMERIC) return '#';
  return '#';
}

export function computeReportTotalWeight(
  formattedData: any[] | null | undefined | false,
  selectedStatuses: Record<string, string | undefined>,
): number {
  if (!formattedData || !Array.isArray(formattedData)) return 0;
  return formattedData.reduce((sum: number, objective: any) => {
    return (
      sum +
      (objective?.keyResults?.reduce((keyResultSum: number, keyResult: any) => {
        const taskWeight = keyResult?.tasks?.reduce(
          (taskSum: number, task: any) => {
            if (selectedStatuses[task.taskId] === 'Done') {
              return taskSum + Number(task.weight || 0);
            }
            return taskSum;
          },
          0,
        );
        const milestoneWeight = keyResult?.milestones?.reduce(
          (milestoneSum: number, milestone: any) => {
            return (
              milestoneSum +
              milestone?.tasks?.reduce((taskSum: number, task: any) => {
                if (selectedStatuses[task.taskId] === 'Done') {
                  return taskSum + Number(task.weight || 0);
                }
                return taskSum;
              }, 0)
            );
          },
          0,
        );
        return keyResultSum + taskWeight + milestoneWeight;
      }, 0) ?? 0)
    );
  }, 0);
}
