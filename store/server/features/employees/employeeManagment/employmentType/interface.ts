import { Meta } from '../../../okrPlanningAndReporting/interface';

// interface jobInformation {
//   id?: string;
//   name: string;
//   description: string;
// }
export interface EmploymentTypeInfo {
  id?: string;
  name: string;
  description: string;
  // jobInformations?: jobInformation;
}

export interface EmploymentTypeList {
  items: EmploymentTypeInfo[];
  meta: Meta;
}
