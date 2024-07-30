export const validatePhoneNumber = (rule: any, value: any) => {
  if (!value) {
    return Promise.reject(new Error('Please enter a phone number'));
  }

  if (!/^\d+$/.test(value)) {
    return Promise.reject(new Error('Phone number should only contain digits'));
  }

  if (value.length !== 9) {
    return Promise.reject(new Error('Phone number should be 9 digits long'));
  }

  if (value[0] === '0') {
    return Promise.reject(new Error('Phone number should not start with 0'));
  }

  return Promise.resolve();
};

export const validateEmailURL = (rule: any, value: any) => {
  if (!value) {
    return Promise.reject(new Error('Please enter an email address'));
  }

  // Regular expression to validate basic email format
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+$/;

  // Check if the email matches the basic pattern
  if (!emailPattern.test(value)) {
    return Promise.reject(new Error('Email must be in a valid format'));
  }

  // Split the email into local and domain parts
  const domainPart = value.split('@')[1];

  if (!domainPart) {
    return Promise.reject(new Error('Email must contain a domain part'));
  }

  // Count the number of `.com` occurrences in the domain part
  const comCount = (domainPart.match(/\.com/g) || []).length;

  if (comCount > 1) {
    return Promise.reject(
      new Error('Email domain must end with a single .com'),
    );
  }

  // Ensure the domain ends with `.com` if there is exactly one `.com`
  const domainEndingPattern = /\.com$/;
  if (!domainEndingPattern.test(domainPart)) {
    return Promise.reject(
      new Error('Email domain must end with a single .com'),
    );
  }

  return Promise.resolve();
};
