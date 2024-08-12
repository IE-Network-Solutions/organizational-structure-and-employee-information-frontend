import moment, { Moment } from "moment";

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

// validation.ts

// Function to validate name
export const validateName = (key:string,name: string): string | null => {
  if (!name) {
    return `${key} is required.`;
  }
    // Allow spaces and alphabetic characters, counting spaces as part of the length
    // const regex = /^[A-Za-z\s]{3,19}$/;

  const regex = /^[A-Za-z]{2,20}$/; //does not allow spaces

  if (!regex.test(name)) {
    return `${key} must be between 2 and 20 alphabetic characters.`;
  }
  return null;
};

// Function to validate email
export const validateEmail = (email: string): string | null => {
  if (!email) {
    return 'Email is required.';
  }
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email) || email.split('@')[1].split('.').length !== 2) {
    return 'Invalid email format. Email must contain only one dot after @.';
  }
  return null;
};

export const disabledDate = (current: Moment) => {
  // Can not select days before today
  return current && current < moment().startOf('day');
};