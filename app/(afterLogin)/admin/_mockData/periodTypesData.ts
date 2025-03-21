import { PeriodType } from '../_mockInterfaces/periodType';

export const mockPeriodTypes: PeriodType[] = [
  {
    id: '497f6eca-6276-4993-bfeb-53cbbbba6f08',
    code: 'Monthly',
    description: 'Monthly subscription',
    periodInMonths: 1,
  },
  {
    id: '497f6eca-6276-4993-bfeb-53cbbbba6f09',
    code: 'Yearly',
    description: 'Yearly subscription',
    periodInMonths: 12,
  },
  {
    id: '497f6eca-6276-4993-bfeb-53cbbbba6f0a',
    code: 'Quarterly',
    description: 'Quarterly subscription',
    periodInMonths: 3,
  },
  {
    id: '497f6eca-6276-4993-bfeb-53cbbbba6f0b',
    code: 'Custom-bimonthly',
    description: 'Custom-bimonthly subscription',
    periodInMonths: 2,
  },
];
