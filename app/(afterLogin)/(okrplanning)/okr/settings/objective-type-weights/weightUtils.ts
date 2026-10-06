export const calculateTotalWeight = (
  values: Array<number | undefined | null>,
): number =>
  values.reduce<number>((total, value) => total + (Number(value) || 0), 0);

/** Rounds to 2 decimals so floating point noise (e.g. 33.33 × 3) never blocks a valid 100%. */
export const roundWeight = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

/**
 * Splits 100% across `count` items in 2-decimal steps. The remainder is added
 * to the last item so the result always totals exactly 100.
 */
export const distributeEvenly = (count: number): number[] => {
  if (count <= 0) return [];
  const base = Math.floor((100 / count) * 100) / 100;
  const shares = Array.from({ length: count }, () => base);
  shares[count - 1] = roundWeight(100 - base * (count - 1));
  return shares;
};
