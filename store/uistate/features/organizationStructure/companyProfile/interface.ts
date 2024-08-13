import { UploadFile } from 'antd/es/upload/interface';
export interface CompanyInformation {
  companyProfileImage: UploadFile<any> | undefined | any;
  companyName: string;
  companyDomainName: string;
  setCompanyProfile: (fileList: UploadFile<any> | undefined) => void;
  setCompanyName: (name: string) => void;
  setCompanyDomainName: (domainName: string) => void;
}

export type CompanyProfileImage = Omit<UploadFile<any>, 'status' | 'percent'>;
