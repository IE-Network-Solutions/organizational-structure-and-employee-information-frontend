export const validateField = (
  fieldType: string,
  value: any,
  fieldValidation: string,
) => {
  if (!value) return `${fieldType} is required`;
  switch (fieldValidation) {
    case 'number':
      return isNaN(value) ? 'Must be a valid number' : null;
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ? null
        : 'Invalid email format';
    case 'url':
      return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(value)
        ? null
        : 'Invalid URL format';
    case 'text':
      return /^[A-Za-z\s]+$/.test(value)
        ? null
        : 'Only alphabetic characters are allowed';
    case 'any':
    case 'date':
      return null;
    default:
      return 'Invalid field type';
  }
};
