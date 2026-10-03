export const calculateTotalWeight = (
  values: Array<number | undefined | null>,
) => values.reduce((total, value) => total + (Number(value) || 0), 0);
