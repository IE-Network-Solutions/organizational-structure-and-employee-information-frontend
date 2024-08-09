export interface OrgChart {
    id?: string;
    name: string;
    description: string;
    branchId: string;
    department: Department[];
    [key:string] :any
  }
  
  export interface Department {
    id: string;
    branchId: string;
    name: string;
    description: string;
    department: Department[];
  }
  
  export interface OrgChartResponse {
    data: OrgChart;

  }
  