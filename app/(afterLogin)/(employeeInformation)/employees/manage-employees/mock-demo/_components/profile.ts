import dayjs from 'dayjs';

export const MOCK_JOINED_DATE = '2023-08-14';

export const MOCK_PROFILE = {
  dateOfBirth: '1994-03-12',
  gender: 'Male',
  nationality: 'Ethiopian',
  maritalStatus: 'Married',
  addressLine: 'Bole, Addis Ababa Ethiopia',
  office: 'Head Office',
  address: {
    country: 'Ethiopia',
    city: 'Addis Ababa',
    subCity: 'Bole',
    phoneNumber: '+251 91 111 2233',
  },
  emergency: {
    fullName: 'Sara Kebede',
    phoneNumber: '+251 91 234 5678',
    gender: 'Female',
    nationality: 'Ethiopian',
    relationship: 'Spouse',
  },
  bank: {
    bankName: 'Commercial Bank of Ethiopia',
    accountNumber: '1000123456789',
    branch: 'Bole',
    accountName: 'Abebe Kebede',
  },
  job: {
    title: 'Operations Officer',
    salary: '25,000',
    type: 'Permanent',
    status: 'Active',
    office: 'Head Office',
    position: 'Operations Officer',
    manager: 'Sara Tadesse',
    department: 'Operations',
  },
};

export function formatServiceYear(joinedDate: string): string {
  const start = dayjs(joinedDate);
  const now = dayjs();
  const years = now.diff(start, 'year');
  const months = now.diff(start.add(years, 'year'), 'month');
  if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`;
  return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
}
