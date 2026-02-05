/**
 * SelamNew Copilot - Predefined Intent Categories & Prompts
 *
 * These intents are built-in report shortcuts that users can click
 * to auto-fill the chat input and trigger AI responses.
 * Categories mirror the SelamNew module structure.
 */

export interface IntentCategory {
  id: string;
  label: string;
  icon: string; // Ant Design icon name
  intents: string[];
}

export const COPILOT_INTENTS: IntentCategory[] = [
  {
    id: 'employee',
    label: 'Employee',
    icon: 'UserOutlined',
    intents: [
      'Active employee list',
      'Employees under probation',
      'Employee resignation report',
      'Employee performance score summary',
      'Attendance rate by employee',
      'Attendance rate by team',
      'Attendance rate by department',
      'Headcount by department',
      'Headcount by role',
      'Headcount by location',
      'BI/Tableau dashboard reports',
    ],
  },
  {
    id: 'time-attendance',
    label: 'Time & Attendance',
    icon: 'ClockCircleOutlined',
    intents: [
      'Daily attendance summary',
      'Daily salary-impact report',
      'Weekly leave report by leave type',
      'Weekly leave report by department',
      'Monthly attendance summary',
      'Monthly absence trends',
      'Monthly lateness trends',
      'Lunch time check-in records',
      'Who is on leave today',
      'Who will be on leave next week',
      'Who is absent today',
      'Who is late today',
      'Pending leave requests',
      'Approved leave requests',
      'Rejected leave requests',
      'Leave report by department',
      'Leave report by leave type',
      'Leave report by duration',
      'Leave approval gap report',
    ],
  },
  {
    id: 'performance',
    label: 'Performance (OKR)',
    icon: 'RiseOutlined',
    intents: [
      'Who did not plan daily?',
      'Who did not plan weekly?',
      // 'Who did not plan monthly?',
      'Who did not report daily?',
      'Who did not report weekly?',
      'Who planned late daily?',
      'Who planned late weekly?',
      'Who reported late daily?',
      'Who reported late weekly?',
      'Who did not close their subordinate daily plan?',
      'Who did not close their subordinate weekly plan?',
      'Who did not close their subordinate daily report?',
      'Who did not close their subordinate weekly report?',
      // 'Employees who did not create a performance plan',
      // 'Employees who did not submit reports on time',
      // 'Employees who did not close assigned goals',
      // 'Employees who did not close assigned tasks',
      // 'Employee performance by OKR score',
      // 'Employee performance by attendance impact',
      // 'Average weekly performance score',
      // 'Top-performing departments',
      // 'Employees with no weekly plan',
      // 'Late planning submissions',
      // 'Late reporting submissions',
      // 'Plan vs. actual completion rate',
    ],
  },
];
