import dayjs from 'dayjs';
import {
  BlueprintAssignment,
  DEMO_LOGGED_IN_EMPLOYEE_ID,
  MockEmployee,
  ShiftSwapRequest,
  WorkScheduleBlueprint,
} from '@/types/timesheet/workSchedule';
import { DATE_FORMAT } from './helpers';

export const MOCK_EMPLOYEES: MockEmployee[] = [
  {
    id: DEMO_LOGGED_IN_EMPLOYEE_ID,
    firstName: 'Abebe',
    lastName: 'Kebede',
    email: 'abebe.kebede@example.com',
    jobTitle: 'Operations Officer',
  },
  {
    id: 'emp-2',
    firstName: 'Sara',
    lastName: 'Tadesse',
    email: 'sara.tadesse@example.com',
    jobTitle: 'Shift Lead',
  },
  {
    id: 'emp-3',
    firstName: 'Daniel',
    lastName: 'Haile',
    email: 'daniel.haile@example.com',
    jobTitle: 'Technician',
  },
  {
    id: 'emp-4',
    firstName: 'Marta',
    lastName: 'Yonas',
    email: 'marta.yonas@example.com',
    jobTitle: 'Coordinator',
  },
  {
    id: 'emp-5',
    firstName: 'Yonas',
    lastName: 'Bekele',
    email: 'yonas.bekele@example.com',
    jobTitle: 'Support Staff',
  },
];

export const SEED_BLUEPRINTS: WorkScheduleBlueprint[] = [
  {
    id: 'bp-office-standard',
    title: 'Office Standard',
    hasShifts: false,
    isSwappable: false,
    activeWeekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    defaultStartTime: '08:00',
    defaultEndTime: '17:00',
    shifts: [],
    createdAt: dayjs().subtract(20, 'day').toISOString(),
  },
  {
    id: 'bp-morning-shift',
    title: 'Split Day Shift',
    hasShifts: true,
    isSwappable: true,
    activeWeekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    defaultStartTime: '08:00',
    defaultEndTime: '17:00',
    shifts: [
      {
        id: 'sh-morning',
        name: 'Morning',
        startTime: '08:00',
        endTime: '12:00',
        weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
      {
        id: 'sh-afternoon',
        name: 'Afternoon',
        startTime: '13:00',
        endTime: '17:00',
        weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      },
    ],
    createdAt: dayjs().subtract(14, 'day').toISOString(),
  },
  {
    id: 'bp-afternoon-shift',
    title: 'Evening Shift',
    hasShifts: true,
    isSwappable: false,
    activeWeekdays: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ],
    defaultStartTime: '14:00',
    defaultEndTime: '22:00',
    shifts: [
      {
        id: 'sh-evening',
        name: 'Evening',
        startTime: '14:00',
        endTime: '22:00',
        weekdays: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ],
      },
    ],
    createdAt: dayjs().subtract(10, 'day').toISOString(),
  },
];

export const SEED_ASSIGNMENTS: BlueprintAssignment[] = [
  {
    id: 'asg-office-marta',
    blueprintId: 'bp-office-standard',
    userId: 'emp-4',
    shiftIds: [],
  },
  {
    id: 'asg-morning-abebe',
    blueprintId: 'bp-morning-shift',
    userId: DEMO_LOGGED_IN_EMPLOYEE_ID,
    shiftIds: ['sh-morning', 'sh-afternoon'],
  },
  {
    id: 'asg-morning-sara',
    blueprintId: 'bp-morning-shift',
    userId: 'emp-2',
    shiftIds: ['sh-morning'],
  },
  {
    id: 'asg-morning-daniel',
    blueprintId: 'bp-morning-shift',
    userId: 'emp-3',
    shiftIds: ['sh-afternoon'],
  },
  {
    id: 'asg-afternoon-yonas',
    blueprintId: 'bp-afternoon-shift',
    userId: 'emp-5',
    shiftIds: ['sh-evening'],
  },
];

export function buildSeedSwapTemplates(): Array<
  Omit<ShiftSwapRequest, 'requesterShiftId' | 'targetShiftId'> & {
    requesterDate: string;
    targetDate: string;
    requesterId: string;
    targetUserId: string;
    blueprintId: string;
    shiftId: string;
  }
> {
  const upcomingMonday =
    dayjs().day() <= 1 ? dayjs().day(1) : dayjs().add(1, 'week').day(1);
  const pendingPeerRequester = upcomingMonday.format(DATE_FORMAT);
  const pendingPeerTarget = upcomingMonday.add(1, 'day').format(DATE_FORMAT);
  const pendingAdminRequester = upcomingMonday
    .add(3, 'day')
    .format(DATE_FORMAT);
  const pendingAdminTarget = upcomingMonday.add(4, 'day').format(DATE_FORMAT);
  const approvedRequester = dayjs()
    .subtract(1, 'week')
    .day(1)
    .format(DATE_FORMAT);
  const approvedTarget = dayjs().subtract(1, 'week').day(2).format(DATE_FORMAT);

  return [
    {
      id: 'swap-pending-peer',
      blueprintId: 'bp-morning-shift',
      shiftId: 'sh-morning',
      requesterId: DEMO_LOGGED_IN_EMPLOYEE_ID,
      targetUserId: 'emp-2',
      requesterDate: pendingPeerRequester,
      targetDate: pendingPeerTarget,
      status: 'PENDING_PEER',
      reason: 'Need Tuesday off for a family appointment.',
      createdAt: dayjs().subtract(1, 'day').toISOString(),
    },
    {
      id: 'swap-pending-admin',
      blueprintId: 'bp-morning-shift',
      shiftId: 'sh-morning',
      requesterId: 'emp-2',
      targetUserId: DEMO_LOGGED_IN_EMPLOYEE_ID,
      requesterDate: pendingAdminRequester,
      targetDate: pendingAdminTarget,
      status: 'PENDING_ADMIN',
      reason: 'Covering a training day — ready for admin approval.',
      peerAcceptedAt: dayjs().subtract(4, 'hour').toISOString(),
      createdAt: dayjs().subtract(2, 'day').toISOString(),
    },
    {
      id: 'swap-approved',
      blueprintId: 'bp-morning-shift',
      shiftId: 'sh-morning',
      requesterId: DEMO_LOGGED_IN_EMPLOYEE_ID,
      targetUserId: 'emp-2',
      requesterDate: approvedRequester,
      targetDate: approvedTarget,
      status: 'APPROVED',
      reason: 'Already completed swap.',
      peerAcceptedAt: dayjs().subtract(8, 'day').toISOString(),
      adminApprovedAt: dayjs().subtract(7, 'day').toISOString(),
      createdAt: dayjs().subtract(9, 'day').toISOString(),
    },
  ];
}
