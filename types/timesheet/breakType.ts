import { DateInfo } from '@/types/commons/dateInfo';

export interface BreakTypeList extends DateInfo {
  id?: string;
  tenantId?: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string;
}
export interface BreakType {
  item: BreakTypeList;
}
