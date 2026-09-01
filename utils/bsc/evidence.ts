/** True when at least one evidence artifact is present (URL, file name, or hash). */
export function hasEvidenceArtifact(input: {
  evidenceUrl?: string | null;
  evidenceFileName?: string | null;
  evidenceHash?: string | null;
}): boolean {
  return Boolean(
    input.evidenceUrl?.trim() ||
      input.evidenceFileName?.trim() ||
      input.evidenceHash?.trim(),
  );
}
