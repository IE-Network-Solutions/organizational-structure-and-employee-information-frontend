import { create } from 'zustand';
import { CompanyInfo, CompanyInfoStore } from './interface';

export const useStep2Store = create<CompanyInfoStore>((set) => ({
  companyInfo: {
    domainName: 'ienetworksolutions.pep.com',
    businessSize: '',
    industry: '',
    preferredIndustry: '',
  },
  editingCompanyInfo: null,
  setCompanyInfo: (info: CompanyInfo) => set({ companyInfo: info }),
  setEditingCompanyInfo: (info: CompanyInfo | null) =>
    set({ editingCompanyInfo: info }),
}));
