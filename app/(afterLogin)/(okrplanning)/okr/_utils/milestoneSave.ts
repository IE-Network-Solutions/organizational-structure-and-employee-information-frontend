export const collectMilestoneIds = (milestones: any[]): Set<string> =>
  new Set(
    (milestones || [])
      .map((milestone) => milestone?.id)
      .filter((id) => id != null && String(id).trim() !== '')
      .map((id) => String(id)),
  );

export const getRemovedMilestoneIds = (
  baselineIds: Iterable<string>,
  currentMilestones: any[],
): string[] => {
  const currentIdSet = collectMilestoneIds(currentMilestones);
  return [...baselineIds].filter((id) => !currentIdSet.has(id));
};

export const sanitizeMilestonesForSave = (
  milestones: any[],
  deletedIds: string[] = [],
): any[] => {
  const deletedSet = new Set(deletedIds.map(String));
  return (milestones || []).filter(
    (milestone) => !milestone?.id || !deletedSet.has(String(milestone.id)),
  );
};
