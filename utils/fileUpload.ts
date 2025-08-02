import axios, { AxiosResponse } from 'axios';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { FILE_URL } from '@/utils/constants';

export interface CustomFile {
  image: string;
  viewImage: string;
}

export const fileUpload = async (
  file: File,
): Promise<AxiosResponse<CustomFile>> => {
  try {
    const formData = new FormData();
    formData.append('tenantId', useAuthenticationStore.getState().tenantId);
    // formData.append('createdBy', useAuthenticationStore.getState().userId);
    // formData.append('updatedBy', useAuthenticationStore.getState().userId);
    formData.append('file', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    const response = await axios.post(FILE_URL, formData, config);

    return response;
  } catch (error) {
    NotificationMessage.error({
      message: 'File upload error',
      description: '',
    });
    throw error;
  }
};
