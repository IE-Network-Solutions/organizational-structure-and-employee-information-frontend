/** Mock Balanced Scorecard perspectives for Create Objective. */
export const BSC_PILLARS = [
  { id: 'financial', name: 'Financial' },
  { id: 'customer', name: 'Customer' },
  { id: 'internal-process', name: 'Internal Process' },
  { id: 'learning-growth', name: 'Learning & Growth' },
] as const;

export type BscPillarId = (typeof BSC_PILLARS)[number]['id'];
