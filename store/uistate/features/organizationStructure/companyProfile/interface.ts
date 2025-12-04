import { UploadFile } from 'antd/es/upload/interface';
import { Tenant } from '@/types/tenant-management/index';

export interface CompanyInformation {
  companyProfileImage: UploadFile<any> | undefined | any;
  companyStamp: UploadFile<any> | undefined | any;
  setCompanyStamp: (fileList: UploadFile<any> | undefined) => void;
  companyName: string;
  companyDomainName: string;
  setCompanyProfile: (fileList: UploadFile<any> | undefined) => void;
  setCompanyName: (name: string) => void;
  setCompanyDomainName: (domainName: string) => void;

  // Admin profile state
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  clientData: Tenant | null;
  setClientData: (clientData: Tenant | null) => void;
  logoExists: boolean;
  setLogoExists: (logoExists: boolean) => void;
  stampExists: boolean;
  setStampExists: (stampExists: boolean) => void;
  submitting: boolean;
  setSubmitting: (submitting: boolean) => void;
  logoFileList: UploadFile[];
  setLogoFileList: (logoFileList: UploadFile[]) => void;
  stampFileList: UploadFile[];
  setStampFileList: (stampFileList: UploadFile[]) => void;
  logoPreview: string | undefined;
  setLogoPreview: (logoPreview: string | undefined) => void;
  stampPreview: string | undefined;
  setStampPreview: (stampPreview: string | undefined) => void;

  // Reset functions
  resetFileLists: () => void;
  resetPreviews: () => void;
  resetAll: () => void;

  // Version for cache busting
  dataVersion: number;
  incrementDataVersion: () => void;
}

export type CompanyProfileImage = Omit<UploadFile<any>, 'status' | 'percent'>;
