import { DateInfo } from '@/types/commons/dateInfo';

export interface CourseCategory extends DateInfo {
  id: string;
  title: string;
  description: string;
  tenantId: string;
}
