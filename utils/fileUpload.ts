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
 * A URL-safe version of a file name: whitespace and characters that break
 * links (`#`, `?`, `%`, `&`, …) become `_`; letters in any script, digits,
 * `.`, `-` and `_` are kept, as is the extension.
 * e.g. "tyt fgfd.pdf" → "tyt_fgfd.pdf".
 */
export const toSafeUploadName = (name: string): string => {
  const dot = name.lastIndexOf('.');
  const hasExtension = dot > 0 && dot < name.length - 1;
  const base = hasExtension ? name.slice(0, dot) : name;
  const extension = hasExtension ? name.slice(dot + 1) : '';

  const clean = (part: string) =>
    part
      .normalize('NFC')
      .replace(/[^\p{L}\p{N}._-]+/gu, '_')
      .replace(/_+/g, '_')
      .replace(/^[._]+|[._]+$/g, '');

  const safeBase = clean(base) || 'file';
  const safeExtension = clean(extension);
  return safeExtension ? `${safeBase}.${safeExtension}` : safeBase;
};

/**
 * Same upload as `fileUpload`, reporting progress (0–100) and resolving to the
 * stored file's URL. The file is sent under a URL-safe name so the returned
 * link never contains spaces. Errors are thrown for the caller to show inline.
 */
export const uploadFileWithProgress = async (
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> => {
  const tenantId = String(useAuthenticationStore.getState().tenantId ?? '');
  const safeName = toSafeUploadName(file.name);
  const upload =
    safeName === file.name
      ? file
      : new File([file], safeName, {
          type: file.type,
          lastModified: file.lastModified,
        });

  const formData = new FormData();
  formData.append('tenantId', tenantId);
  formData.append('file', upload);

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
