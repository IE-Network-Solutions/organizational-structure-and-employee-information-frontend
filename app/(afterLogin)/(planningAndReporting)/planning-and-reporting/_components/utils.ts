import { Cadence, ViewMode } from './types';

export function getCadenceLabel(cadence: Cadence): string {
  const labels: Record<Cadence, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
  };
  return labels[cadence];
}

export function getSectionTitle(cadence: Cadence, viewMode: ViewMode): string {
  if (viewMode === 'reporting') {
    const titles: Record<Cadence, string> = {
      daily: "Today's Daily Report",
      weekly: "This week's Weekly Report",
      monthly: "This month's Monthly Report",
    };
    return titles[cadence];
  }

  const titles: Record<Cadence, string> = {
    daily: "Today's Daily Plan",
    weekly: "This week's Weekly Plan",
    monthly: "This month's Monthly Plan",
  };
  return titles[cadence];
}

export function getButtonText(cadence: Cadence, viewMode: ViewMode): string {
  const cadenceLabel = getCadenceLabel(cadence);
  if (viewMode === 'reporting') {
    return `Add ${cadenceLabel} Report`;
  }
  return `Add ${cadenceLabel} Plan`;
}

export function getCadenceTagText(cadence: Cadence): string {
  return `${getCadenceLabel(cadence)} cadence`;
}
