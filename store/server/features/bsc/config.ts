/**
 * When true, BSC server hooks call OKR_AND_PLANNING_URL instead of the in-memory mock.
 * Default: enabled. Set NEXT_PUBLIC_USE_BSC_API=false to force mock.
 */
export const USE_BSC_API =
  (process.env.NEXT_PUBLIC_USE_BSC_API ?? 'true').toLowerCase() !== 'false';
