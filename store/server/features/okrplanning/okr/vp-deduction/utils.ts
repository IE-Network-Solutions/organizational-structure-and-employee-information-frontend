import { VpDeductionDetailItem } from './queries';

export type EmployeeNameFields = {
  firstName?: string;
  middleName?: string;
  lastName?: string;
};

export type FiscalMonth = {
  id: string;
};

export type FiscalSession = {
  id: string;
  active?: boolean;
  months?: FiscalMonth[];
};

export const getEmployeeDisplayName = (
  employee: EmployeeNameFields | null | undefined,
  fallback: string,
): string => {
  if (!employee) return fallback;
  const name =
    `${employee.firstName || ''} ${employee.middleName || ''} ${employee.lastName || ''}`
      .trim()
      .replace(/\s+/g, ' ');
  return name || fallback;
};

export const resolvePreviousMonthId = (
  sessions: FiscalSession[] | undefined,
  sessionId: string | undefined,
  monthId: string | undefined,
): string | undefined => {
  if (!sessions?.length || !monthId) return undefined;

  const session =
    sessions.find((item) => item.id === sessionId) ??
    sessions.find((item) => item.active) ??
    sessions[0];

  const months = session?.months ?? [];
  const monthIndex = months.findIndex((month) => month.id === monthId);
  if (monthIndex <= 0) return undefined;
  return months[monthIndex - 1]?.id;
};

export const getViolationNameLabels = (items: VpDeductionDetailItem[]) => {
  const labels = new Set<string>();
  items.forEach((item) => {
    const name = item.attendanceRuleName?.trim();
    if (name) labels.add(name);
  });
  return Array.from(labels);
};
