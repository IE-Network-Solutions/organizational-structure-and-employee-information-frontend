import { create } from 'zustand';
import { CompanyInformation } from './interface';
import { UploadFile } from 'antd/es/upload/interface';

export const useCompanyProfile = create<CompanyInformation>((set) => ({
  companyProfileImage: undefined,
  companyName: '',
  companyDomainName: '',
  setCompanyProfile: (fileList: UploadFile<any> | undefined) =>
    set({ companyProfileImage: fileList }),
  setCompanyName: (name: string) => set({ companyName: name }),
  setCompanyDomainName: (domainName: string) =>
    set({ companyDomainName: domainName }),
}));
