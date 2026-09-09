import { DateInfo } from '@/types/commons/dateInfo';

export interface BreakType extends DateInfo {
  id?: string;
  tenantId?: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string;
  startAtFrom?: string | null;
  startAtTo?: string | null;
  endAtFrom?: string | null;
  endAtTo?: string | null;
  /** Shifts this break is attached to (from Core) */
  shiftIds?: string[];
}
export interface BreakTypeList {
  item: BreakType;
}
