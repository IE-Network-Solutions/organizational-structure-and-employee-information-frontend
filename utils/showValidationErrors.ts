import NotificationMessage from '@/components/common/notification/notificationMessage';

export const showValidationErrors = (errorFields: any[] = []) => {
  errorFields.forEach((item: any) => {
    item?.errors?.forEach((errorText: any) => {
      NotificationMessage.warning({
        message: 'Validation Error',
        description: errorText,
      });
    });
  });
};



export const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'red';
    case 'medium':
      return 'orange';
    case 'low':
      return 'green';
    default:
      return 'blue';
  }
};