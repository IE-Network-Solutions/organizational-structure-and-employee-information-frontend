import { create } from 'zustand';
import { CompanyInformation } from './interface';
import { UploadFile } from 'antd/es/upload/interface';

export const useCompanyProfile = create<CompanyInformation>((set) => ({
  companyProfileImage: undefined,
  companyStamp: undefined,

  companyName: '',
  companyDomainName: '',
  setCompanyProfile: (fileList: UploadFile<any> | undefined) =>
    set({ companyProfileImage: fileList }),
  setCompanyStamp: (fileList: UploadFile<any> | undefined) =>
    set({ companyStamp: fileList }),
  setCompanyName: (name: string) => set({ companyName: name }),
  setCompanyDomainName: (domainName: string) =>
    set({ companyDomainName: domainName }),
}));
