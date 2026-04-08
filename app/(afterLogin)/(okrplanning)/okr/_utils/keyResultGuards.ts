export const isKeyResultLockedForWeightEdit = (keyResult: any): boolean => {
  const status = String(
    keyResult?.status ?? keyResult?.keyResultCompletionStatus ?? '',
  ).toLowerCase();

  return Number(keyResult?.progress) === 100 || status === 'achieved';
};

export const hasCompletedKeyResult = (keyResults: any[] = []): boolean => {
  return keyResults.some(isKeyResultLockedForWeightEdit);
};

/** Returns true if any key result has progress > 0 */
export const hasAnyProgress = (keyResults: any[] = []): boolean => {
  return keyResults.some((kr) => Number(kr?.progress ?? 0) > 0);
};
