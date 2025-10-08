import { crudRequest } from '@/utils/crudRequest';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

export interface CustomFile {
  image: string;
  viewImage: string;
  data: any;
}

export const fileUpload = async (file: File): Promise<CustomFile> => {
  try {
    const formData = new FormData();
    formData.append('tenantId', useAuthenticationStore.getState().tenantId);
    // formData.append('createdBy', useAuthenticationStore.getState().userId);
    // formData.append('updatedBy', useAuthenticationStore.getState().userId);
    formData.append('file', file);

    const response = await crudRequest({
      url: 'https://files.ienetworks.co/testUpload',
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
