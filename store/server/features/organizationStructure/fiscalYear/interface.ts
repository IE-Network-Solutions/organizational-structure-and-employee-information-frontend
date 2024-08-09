export interface FiscalYear {
    name: string;
    description: string; 
    startDate: Date | null;
    endDate: Date | null;
  }
  
  export interface FiscalYearResponse {
    data: FiscalYear[];
  }
  