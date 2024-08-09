

export  interface CompanyInfo {
    domainName: string;
    businessSize: string;
    industry: string;
    preferredIndustry: string;
  }


 export  interface CompanyInfoStore {
    companyInfo: CompanyInfo;
    editingCompanyInfo: CompanyInfo | null;
    setCompanyInfo: (info: CompanyInfo) => void;
    setEditingCompanyInfo: (info: CompanyInfo | null) => void;
  }