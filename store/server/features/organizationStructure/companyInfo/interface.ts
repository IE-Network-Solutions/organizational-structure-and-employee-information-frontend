export interface CompanyInfo {
    id?: string;
    domainName: string;
    businessSize: string;
    industry: string;
    preferredIndustry: string;
  }
  
  export interface CompanyInfoResponse {
    items: CompanyInfo[];
    total: number;
  }