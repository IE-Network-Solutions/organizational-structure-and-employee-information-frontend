import NotificationMessage from '@/components/common/notification/notificationMessage';

/**
 * Handles network errors and displays a descriptive notification message.
 *
 * @param {any} error - The error object from the Axios request.
 */
export const handleNetworkError = (error: any) => {
  if (error?.response) {
    // Server responded with a status code that falls out of the range of 2xx
    const { status, statusText, data } = error.response;

    NotificationMessage.error({
      message: `Error ${status}: ${statusText}`,
      description: `
        ${data?.message ? `Details: ${data.message}` : 'An unexpected error occurred.'}
      `,
    });
  } else if (error?.request) {
    // The request was made but no response was received
    NotificationMessage.error({
      message: 'Network Error',
      description: `
        No response received from the server. Please check your network connection.
      `,
    });
  } else {
    // An error occurred while setting up the request
    NotificationMessage.error({
      message: 'Request Error',
      description: `
        ${error?.message || 'An unexpected error occurred.'}
      `,
    });
  }
};
