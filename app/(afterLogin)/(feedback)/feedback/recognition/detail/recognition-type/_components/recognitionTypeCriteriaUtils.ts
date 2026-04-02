/** Child recognition type from GET …/childe-recognition-type/child/:id/paginated (raw array or `{ items }`). */
export type RecognitionTypeChildApi = {
  id: string;
  name?: string;
  description?: string;
  frequency?: string;
  isMonetized?: boolean;
  parentTypeId?: string | null;
  departmentId?: string | null;
  recognitionCriteria?: unknown[];
  department?: { id?: string; name?: string } | null;
};

export type RecognitionTypeRow = {
  id: string;
  name?: string;
  description?: string;
  frequency?: string;
  isMonetized?: boolean;
  departmentId?: string | null;
  recognitionCriteria?: unknown[];
  parentTypeId?: string | null;
  department?: { id?: string; name?: string } | null;
};

export function formatFrequency(freq?: string) {
  if (!freq) return null;
  return freq.charAt(0).toUpperCase() + freq.slice(1).toLowerCase();
}

export function getRecognitionTypeRows(
  items: unknown[] | undefined,
): RecognitionTypeRow[] {
  if (!items?.length) return [];
  const list = items as Array<
    {
      id: string;
      parentTypeId?: string | null;
      children?: RecognitionTypeRow[];
    } & RecognitionTypeRow
  >;
  const roots = list.filter((i) => i.parentTypeId == null);
  if (roots.length === 0) {
    return list as RecognitionTypeRow[];
  }
  const rows: RecognitionTypeRow[] = [];
  for (const root of roots) {
    if (root.children?.length) {
      for (const child of root.children) {
        rows.push(child);
      }
    } else {
      rows.push(root);
    }
  }
  return rows;
}
