import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { CompanyInformation } from './interface';
import { UploadFile } from 'antd/es/upload/interface';
import { Tenant } from '@/types/tenant-management/index';

export const useCompanyProfile = create<CompanyInformation>()(
  devtools(
    (set) => ({
      // Original company profile state
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

      // Admin profile state
      isLoading: true,
      setIsLoading: (isLoading: boolean) => set({ isLoading }),
      clientData: null,
      setClientData: (clientData: Tenant | null) => {
        // Always update to ensure fresh data is reflected
        set({ clientData });
      },
      logoExists: false,
      setLogoExists: (logoExists: boolean) => set({ logoExists }),
      stampExists: false,
      setStampExists: (stampExists: boolean) => set({ stampExists }),
      submitting: false,
      setSubmitting: (submitting: boolean) => set({ submitting }),
      logoFileList: [],
      setLogoFileList: (logoFileList: UploadFile[]) => set({ logoFileList }),
      stampFileList: [],
      setStampFileList: (stampFileList: UploadFile[]) => set({ stampFileList }),
      logoPreview: undefined,
      setLogoPreview: (logoPreview: string | undefined) => set({ logoPreview }),
      stampPreview: undefined,
      setStampPreview: (stampPreview: string | undefined) =>
        set({ stampPreview }),

      // Reset functions
      resetFileLists: () =>
        set({
          logoFileList: [],
          stampFileList: [],
        }),
      resetPreviews: () =>
        set((state) => {
          if (state.logoPreview) {
            URL.revokeObjectURL(state.logoPreview);
          }
          if (state.stampPreview) {
            URL.revokeObjectURL(state.stampPreview);
          }
          return {
            logoPreview: undefined,
            stampPreview: undefined,
          };
        }),
      resetAll: () =>
        set((state) => {
          if (state.logoPreview) {
            URL.revokeObjectURL(state.logoPreview);
          }
          if (state.stampPreview) {
            URL.revokeObjectURL(state.stampPreview);
          }
          return {
            logoFileList: [],
            stampFileList: [],
            logoPreview: undefined,
            stampPreview: undefined,
            submitting: false,
          };
        }),

      // Version for cache busting images after updates
      dataVersion: 0,
      incrementDataVersion: () =>
        set((state) => ({ dataVersion: state.dataVersion + 1 })),
    }),
    { name: 'CompanyProfileStore' },
  ),
);
