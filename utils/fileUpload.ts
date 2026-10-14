import { AxiosProgressEvent } from 'axios';
import { crudRequest } from '@/utils/crudRequest';
import apiClient from '@/utils/apiClient';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

export interface CustomFile {
  image: string;
  viewImage: string;
  data: any;
}

/** Shared file server endpoint used by every upload in the app. */
export const FILE_UPLOAD_URL = 'https://files.ienetworks.co/testUpload';

/** The file server wraps the stored file's link differently per endpoint. */
export const resolveUploadedFileUrl = (response: any): string | null => {
  const candidates = [
    response?.viewImage,
    response?.data?.viewImage,
    response?.data?.data?.viewImage,
    response?.url,
    response?.fileUrl,
    response?.data?.url,
    response?.data?.fileUrl,
    response?.data?.data?.url,
    response?.data?.data?.fileUrl,
    response?.image,
    response?.data?.image,
    response?.data?.data?.image,
  ];
  const url = candidates.find(
    (candidate) => typeof candidate === 'string' && candidate.trim(),
  );
  return url ? url.trim() : null;
};

/**
 * Same upload as `fileUpload`, reporting progress (0–100) and resolving to the
 * stored file's URL. Errors are thrown for the caller to show inline.
 */
export const uploadFileWithProgress = async (
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> => {
  const tenantId = String(useAuthenticationStore.getState().tenantId ?? '');
  const formData = new FormData();
  formData.append('tenantId', tenantId);
  formData.append('file', file);

  const response = await apiClient({
    url: FILE_UPLOAD_URL,
    method: 'POST',
    data: formData,
    headers: { tenantId, tenantid: tenantId },
    skipEncryption: true,
    onUploadProgress: (event: AxiosProgressEvent) => {
      if (onProgress && event.total) {
        onProgress(
          Math.min(99, Math.round((event.loaded / event.total) * 100)),
        );
      }
    },
  } as any);

  const url = resolveUploadedFileUrl(response?.data);
  if (!url) {
    throw new Error('The file server did not return a link for the file.');
  }
  onProgress?.(100);
  return url;
};

export const fileUpload = async (file: File): Promise<CustomFile> => {
  try {
    const formData = new FormData();
    formData.append('tenantId', useAuthenticationStore.getState().tenantId);
    // formData.append('createdBy', useAuthenticationStore.getState().userId);
    // formData.append('updatedBy', useAuthenticationStore.getState().userId);
    formData.append('file', file);

    const response = await crudRequest({
      url: FILE_UPLOAD_URL,
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      skipEncryption: true, // Skip encryption for file uploads
    });

    return response;
  } catch (error) {
    NotificationMessage.error({
      message: 'File upload error',
      description: '',
    });
    throw error;
  }
};
