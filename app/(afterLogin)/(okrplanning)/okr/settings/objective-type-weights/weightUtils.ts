export const calculateTotalWeight = (
  values: Array<number | undefined | null>,
): number => values.reduce<number>((total, value) => total + (Number(value) || 0), 0);
