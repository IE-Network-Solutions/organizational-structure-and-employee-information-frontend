import { create } from 'zustand';
import { CriticalRole } from '@/app/(afterLogin)/(employeeInformation)/employees/succession-planning/_components/criticalRoleModal';
import { MOCK_EMPLOYEES } from '@/app/(afterLogin)/(employeeInformation)/employees/succession-planning/_components/steps/stepEmployeeSelection';
import {
  CompetencyGap,
  deriveReadinessFromExperienceGap,
  deriveSuccessorGaps,
  DevelopmentAction,
  IndividualDevelopmentPlan,
  IdpActivity,
  resolveActionStatus,
  SuccessorReadiness,
} from '@/app/(afterLogin)/(employeeInformation)/employees/succession-planning/_components/successionTypes';
import type {
  EducationField,
  EducationLevel,
} from '@/app/(afterLogin)/(employeeInformation)/employees/succession-planning/_components/educationCatalog';
import { formatEducationLabel } from '@/app/(afterLogin)/(employeeInformation)/employees/succession-planning/_components/educationCatalog';
import {
  findPositionByTitle,
  resolvePositionTitle,
  resolvePositionTitles,
} from '@/app/(afterLogin)/(employeeInformation)/employees/succession-planning/_components/steps/stepRoleSelection';

const buildEducationMatchOptions = (
  role: {
    allowRelatedEducationFields?: boolean;
    requiredEducationField?: EducationField;
  },
  successor: { educationRelatedAccepted?: boolean },
) => ({
  allowRelated: Boolean(
    role.allowRelatedEducationFields &&
      role.requiredEducationField &&
      role.requiredEducationField !== 'Any',
  ),
  relatedAccepted: Boolean(successor.educationRelatedAccepted),
});

const defaultRoleEducation = (
  department: string,
): { level: EducationLevel; field: EducationField } => {
  switch (department) {
    case 'Engineering':
      return { level: 'Master', field: 'Computer Science' };
    case 'Finance':
      return { level: 'Master', field: 'Finance' };
    case 'Human Resources':
      return { level: 'Master', field: 'Human Resource Management' };
    case 'Sales':
      return { level: 'Bachelor', field: 'Business Administration' };
    case 'Product':
      return { level: 'Bachelor', field: 'Business Administration' };
    case 'Operations':
      return { level: 'Bachelor', field: 'Operations Management' };
    case 'Executive':
    default:
      return { level: 'Master', field: 'Business Administration' };
  }
};

const defaultRequiredExperienceYears = (department: string): number => {
  switch (department) {
    case 'Executive':
      return 11;
    case 'Engineering':
      return 10;
    default:
      return 8;
  }
};

/**
 * Scoring model (prototype):
 * - Each competency has a weight (%). Weights for a role must sum to 100.
 * - Evaluator rates each competency 0–100; weighted result = (rating/100)×weight
 *   (e.g. weight 40 → result is out of 40).
 * - Person total = sum of weighted results, out of 100.
 */
const RAW_ROLES: CriticalRole[] = [
  {
    id: '1',
    positionId: 'pos-1',
    roleName: 'Chief Executive Officer',
    department: 'Executive',
    priority: 'Critical',
    riskLevel: 'High',
    successorCount: 1,
    notes: 'Requires board approval for succession.',
    requiredEducationLevel: 'Master',
    requiredEducationField: 'Business Administration',
    requiredRelevantExperience: 11,
    requiredCurrentPositionIds: ['pos-9', 'pos-2'],
    requiredCurrentPositions: [
      'Engineering Manager',
      'Chief Operating Officer',
    ],
    competencies: [
      {
        name: 'Executive leadership',
        category: 'Behavior',
        importance: 'Required',
        weight: 40,
        description: 'Ability to lead the organization through change.',
      },
      {
        name: 'Board & stakeholder management',
        category: 'Skill',
        importance: 'Required',
        weight: 30,
      },
      {
        name: 'Strategic vision',
        category: 'Knowledge',
        importance: 'Required',
        weight: 30,
      },
    ],
    successors: [
      {
        id: 'emp-2',
        name: 'Marcus Webb',
        jobTitle: 'Engineering Manager',
        department: 'Engineering',
        readiness: 'Ready within 1 Year',
        competencyEvaluations: [
          {
            competencyName: 'Executive leadership',
            category: 'Behavior',
            importance: 'Required',
            weight: 40,
            evaluatorId: 'emp-3',
            evaluatorName: 'Aiko Yamamoto',
            status: 'Evaluated',
            rating: 82,
            score: 32.8,
            comment:
              'Solid leadership presence; needs more exposure to enterprise-level change programs.',
          },
          {
            competencyName: 'Board & stakeholder management',
            category: 'Skill',
            importance: 'Required',
            weight: 30,
            evaluatorId: 'emp-6',
            evaluatorName: 'Amara Diallo',
            status: 'Pending',
          },
          {
            competencyName: 'Strategic vision',
            category: 'Knowledge',
            importance: 'Required',
            weight: 30,
            evaluatorId: 'emp-10',
            evaluatorName: 'Carlos Rivera',
            status: 'Evaluated',
            rating: 75,
            score: 22.5,
            comment:
              'Clear technical strategy; still building broader market and board-level narrative.',
          },
        ],
      },
    ],
  },
  {
    id: '2',
    positionId: 'pos-3',
    roleName: 'VP of Engineering',
    department: 'Engineering',
    priority: 'Critical',
    riskLevel: 'High',
    successorCount: 3,
    notes: 'Key technical leadership role.',
    requiredEducationLevel: 'Master',
    requiredEducationField: 'Computer Science',
    allowRelatedEducationFields: true,
    requiredRelevantExperience: 10,
    requiredCurrentPositionIds: ['pos-9', 'pos-12'],
    requiredCurrentPositions: ['Engineering Manager', 'Principal Engineer'],
    competencies: [
      {
        name: 'Technical architecture',
        category: 'Skill',
        importance: 'Required',
        weight: 40,
      },
      {
        name: 'Engineering people management',
        category: 'Behavior',
        importance: 'Required',
        weight: 35,
      },
      {
        name: 'Product delivery ownership',
        category: 'Experience',
        importance: 'Preferred',
        weight: 25,
      },
    ],
    successors: [
      {
        id: 'emp-1',
        name: 'Lena Fischer',
        jobTitle: 'Senior Software Engineer',
        department: 'Engineering',
        readiness: 'Ready within 1 Year',
        // Person total target: 36.8 + 28 + 22 = 86.8 / 100
        competencyEvaluations: [
          {
            competencyName: 'Technical architecture',
            category: 'Skill',
            importance: 'Required',
            weight: 40,
            evaluatorId: 'emp-3',
            evaluatorName: 'Aiko Yamamoto',
            status: 'Evaluated',
            rating: 92,
            score: 36.8,
            comment:
              'Strong system design skills and clear ownership of architecture decisions across squads.',
          },
          {
            competencyName: 'Engineering people management',
            category: 'Behavior',
            importance: 'Required',
            weight: 35,
            evaluatorId: 'emp-2',
            evaluatorName: 'Marcus Webb',
            status: 'Evaluated',
            rating: 80,
            score: 28,
            comment:
              'Mentors juniors well; ready for larger span of control with coaching support.',
          },
          {
            competencyName: 'Product delivery ownership',
            category: 'Experience',
            importance: 'Preferred',
            weight: 25,
            evaluatorId: 'emp-11',
            evaluatorName: 'Sofia Johansson',
            status: 'Evaluated',
            rating: 88,
            score: 22,
            comment:
              'Consistently drives delivery end-to-end and collaborates well with product stakeholders.',
          },
        ],
      },
      {
        id: 'emp-2',
        name: 'Marcus Webb',
        jobTitle: 'Engineering Manager',
        department: 'Engineering',
        readiness: 'Ready Now',
        // Partial scores so far: 21.3 / 100 (2 criteria pending)
        competencyEvaluations: [
          {
            competencyName: 'Technical architecture',
            category: 'Skill',
            importance: 'Required',
            weight: 40,
            evaluatorId: 'emp-3',
            evaluatorName: 'Aiko Yamamoto',
            status: 'Pending',
          },
          {
            competencyName: 'Engineering people management',
            category: 'Behavior',
            importance: 'Required',
            weight: 35,
            evaluatorId: 'emp-6',
            evaluatorName: 'Amara Diallo',
            status: 'Pending',
          },
          {
            competencyName: 'Product delivery ownership',
            category: 'Experience',
            importance: 'Preferred',
            weight: 25,
            evaluatorId: 'emp-11',
            evaluatorName: 'Sofia Johansson',
            status: 'Evaluated',
            rating: 85,
            score: 21.3,
            comment:
              'Reliable ownership of delivery milestones; room to grow on cross-team prioritization.',
          },
        ],
      },
      {
        id: 'emp-3',
        name: 'Aiko Yamamoto',
        jobTitle: 'Principal Engineer',
        department: 'Engineering',
        readiness: 'Ready Now',
        // Person total: 38 + 27.3 + 22.5 = 87.8 / 100
        competencyEvaluations: [
          {
            competencyName: 'Technical architecture',
            category: 'Skill',
            importance: 'Required',
            weight: 40,
            evaluatorId: 'emp-2',
            evaluatorName: 'Marcus Webb',
            status: 'Evaluated',
            rating: 95,
            score: 38,
            comment:
              'Exceptional depth in architecture and mentoring; ready for broader technical leadership.',
          },
          {
            competencyName: 'Engineering people management',
            category: 'Behavior',
            importance: 'Required',
            weight: 35,
            evaluatorId: 'emp-2',
            evaluatorName: 'Marcus Webb',
            status: 'Evaluated',
            rating: 78,
            score: 27.3,
            comment:
              'Strong peer influence; would benefit from more formal people-management practice.',
          },
          {
            competencyName: 'Product delivery ownership',
            category: 'Experience',
            importance: 'Preferred',
            weight: 25,
            evaluatorId: 'emp-10',
            evaluatorName: 'Carlos Rivera',
            status: 'Evaluated',
            rating: 90,
            score: 22.5,
            comment:
              'Owns complex delivery programs and keeps stakeholders aligned under pressure.',
          },
        ],
      },
    ],
  },
  {
    id: '3',
    positionId: 'pos-8',
    roleName: 'Head of Finance',
    department: 'Finance',
    priority: 'High',
    riskLevel: 'Medium',
    successorCount: 1,
    notes: 'Oversees all financial operations.',
    requiredEducationLevel: 'Master',
    requiredEducationField: 'Finance',
    requiredRelevantExperience: 8,
    requiredCurrentPositionIds: ['pos-13', 'pos-14'],
    requiredCurrentPositions: ['Finance Manager', 'Financial Analyst'],
    competencies: [
      {
        name: 'Financial reporting',
        category: 'Skill',
        importance: 'Required',
        weight: 40,
      },
      {
        name: 'Budget planning',
        category: 'Knowledge',
        importance: 'Required',
        weight: 35,
      },
      {
        name: 'Risk & compliance oversight',
        category: 'Experience',
        importance: 'Preferred',
        weight: 25,
      },
    ],
    successors: [
      {
        id: 'emp-4',
        name: 'Daniel Mensah',
        jobTitle: 'Finance Manager',
        department: 'Finance',
        readiness: 'Ready Now',
        // Person total: 34 + 29.8 + 20 = 83.8 / 100
        competencyEvaluations: [
          {
            competencyName: 'Financial reporting',
            category: 'Skill',
            importance: 'Required',
            weight: 40,
            evaluatorId: 'emp-10',
            evaluatorName: 'Carlos Rivera',
            status: 'Evaluated',
            rating: 85,
            score: 34,
            comment:
              'Accurate and timely reporting; can stretch further on narrative for non-finance leaders.',
          },
          {
            competencyName: 'Budget planning',
            category: 'Knowledge',
            importance: 'Required',
            weight: 35,
            evaluatorId: 'emp-6',
            evaluatorName: 'Amara Diallo',
            status: 'Evaluated',
            rating: 85,
            score: 29.8,
            comment:
              'Strong annual planning cycles; building multi-year scenario planning skills.',
          },
          {
            competencyName: 'Risk & compliance oversight',
            category: 'Experience',
            importance: 'Preferred',
            weight: 25,
            evaluatorId: 'emp-11',
            evaluatorName: 'Sofia Johansson',
            status: 'Evaluated',
            rating: 80,
            score: 20,
            comment:
              'Solid control awareness; needs more ownership of audit remediation programs.',
          },
        ],
      },
    ],
  },
  {
    id: '4',
    positionId: 'pos-7',
    roleName: 'Director of People',
    department: 'Human Resources',
    priority: 'High',
    riskLevel: 'Medium',
    successorCount: 2,
    notes: '',
    requiredEducationLevel: 'Master',
    requiredEducationField: 'Human Resource Management',
    requiredRelevantExperience: 8,
    requiredCurrentPositionIds: ['pos-15', 'pos-16'],
    requiredCurrentPositions: [
      'HR Business Partner',
      'Talent Acquisition Lead',
    ],
    competencies: [
      {
        name: 'Talent development',
        category: 'Skill',
        importance: 'Required',
        weight: 40,
      },
      {
        name: 'Organizational design',
        category: 'Knowledge',
        importance: 'Preferred',
        weight: 30,
      },
      {
        name: 'Employee relations leadership',
        category: 'Behavior',
        importance: 'Required',
        weight: 30,
      },
    ],
    successors: [
      {
        id: 'emp-6',
        name: 'Amara Diallo',
        jobTitle: 'HR Business Partner',
        department: 'Human Resources',
        readiness: 'Ready Now',
        // Person total: 36 + 25.5 + 27 = 88.5 / 100
        competencyEvaluations: [
          {
            competencyName: 'Talent development',
            category: 'Skill',
            importance: 'Required',
            weight: 40,
            evaluatorId: 'emp-2',
            evaluatorName: 'Marcus Webb',
            status: 'Evaluated',
            rating: 90,
            score: 36,
            comment:
              'Designs practical development paths and coaches managers effectively.',
          },
          {
            competencyName: 'Organizational design',
            category: 'Knowledge',
            importance: 'Preferred',
            weight: 30,
            evaluatorId: 'emp-3',
            evaluatorName: 'Aiko Yamamoto',
            status: 'Evaluated',
            rating: 85,
            score: 25.5,
            comment:
              'Thoughtful structure recommendations; deepen exposure to large reorgs.',
          },
          {
            competencyName: 'Employee relations leadership',
            category: 'Behavior',
            importance: 'Required',
            weight: 30,
            evaluatorId: 'emp-11',
            evaluatorName: 'Sofia Johansson',
            status: 'Evaluated',
            rating: 90,
            score: 27,
            comment:
              'Trusted advisor on sensitive matters; calm and fair under pressure.',
          },
        ],
      },
      {
        id: 'emp-7',
        name: 'Ravi Sharma',
        jobTitle: 'Talent Acquisition Lead',
        department: 'Human Resources',
        readiness: 'Ready within 1 Year',
        // Partial: 22.5 / 100
        competencyEvaluations: [
          {
            competencyName: 'Talent development',
            category: 'Skill',
            importance: 'Required',
            weight: 40,
            evaluatorId: 'emp-6',
            evaluatorName: 'Amara Diallo',
            status: 'Pending',
          },
          {
            competencyName: 'Organizational design',
            category: 'Knowledge',
            importance: 'Preferred',
            weight: 30,
            evaluatorId: 'emp-2',
            evaluatorName: 'Marcus Webb',
            status: 'Pending',
          },
          {
            competencyName: 'Employee relations leadership',
            category: 'Behavior',
            importance: 'Required',
            weight: 30,
            evaluatorId: 'emp-10',
            evaluatorName: 'Carlos Rivera',
            status: 'Evaluated',
            rating: 75,
            score: 22.5,
            comment:
              'Handles recruiting-related conflicts well; less experience with broader ER cases.',
          },
        ],
      },
    ],
  },
  {
    id: '5',
    positionId: 'pos-6',
    roleName: 'Head of Sales',
    department: 'Sales',
    priority: 'Medium',
    riskLevel: 'Low',
    successorCount: 3,
    notes: 'Regional lead succession plans in progress.',
    requiredEducationLevel: 'Bachelor',
    requiredEducationField: 'Business Administration',
    requiredRelevantExperience: 8,
    requiredCurrentPositionIds: ['pos-10', 'pos-17'],
    requiredCurrentPositions: ['Sales Manager', 'Account Executive'],
    competencies: [
      {
        name: 'Enterprise sales leadership',
        category: 'Experience',
        importance: 'Required',
        weight: 40,
      },
      {
        name: 'Pipeline forecasting',
        category: 'Skill',
        importance: 'Required',
        weight: 35,
      },
      {
        name: 'Cross-functional collaboration',
        category: 'Behavior',
        importance: 'Preferred',
        weight: 25,
      },
    ],
    successors: [
      {
        id: 'emp-8',
        name: 'Kwame Asante',
        jobTitle: 'Sales Manager',
        department: 'Sales',
        readiness: 'Ready Now',
        // Person total: 36 + 31.5 + 22 = 89.5 / 100
        competencyEvaluations: [
          {
            competencyName: 'Enterprise sales leadership',
            category: 'Experience',
            importance: 'Required',
            weight: 40,
            evaluatorId: 'emp-11',
            evaluatorName: 'Sofia Johansson',
            status: 'Evaluated',
            rating: 90,
            score: 36,
            comment:
              'Leads complex deals confidently and develops account managers well.',
          },
          {
            competencyName: 'Pipeline forecasting',
            category: 'Skill',
            importance: 'Required',
            weight: 35,
            evaluatorId: 'emp-10',
            evaluatorName: 'Carlos Rivera',
            status: 'Evaluated',
            rating: 90,
            score: 31.5,
            comment:
              'Forecast accuracy is consistently strong across quarters.',
          },
          {
            competencyName: 'Cross-functional collaboration',
            category: 'Behavior',
            importance: 'Preferred',
            weight: 25,
            evaluatorId: 'emp-3',
            evaluatorName: 'Aiko Yamamoto',
            status: 'Evaluated',
            rating: 88,
            score: 22,
            comment:
              'Partners effectively with product and engineering on customer commitments.',
          },
        ],
      },
      {
        id: 'emp-9',
        name: 'Nina Kovacs',
        jobTitle: 'Account Executive',
        department: 'Sales',
        readiness: 'Ready within 1 Year',
        // Partial: 28 + 24.5 = 52.5 / 100 (collaboration pending)
        competencyEvaluations: [
          {
            competencyName: 'Enterprise sales leadership',
            category: 'Experience',
            importance: 'Required',
            weight: 40,
            evaluatorId: 'emp-8',
            evaluatorName: 'Kwame Asante',
            status: 'Evaluated',
            rating: 70,
            score: 28,
            comment:
              'Strong individual contributor; still growing into leadership of multi-threaded deals.',
          },
          {
            competencyName: 'Pipeline forecasting',
            category: 'Skill',
            importance: 'Required',
            weight: 35,
            evaluatorId: 'emp-10',
            evaluatorName: 'Carlos Rivera',
            status: 'Evaluated',
            rating: 70,
            score: 24.5,
            comment:
              'Improving hygiene and stage discipline; forecasts occasionally optimistic.',
          },
          {
            competencyName: 'Cross-functional collaboration',
            category: 'Behavior',
            importance: 'Preferred',
            weight: 25,
            evaluatorId: 'emp-11',
            evaluatorName: 'Sofia Johansson',
            status: 'Pending',
          },
        ],
      },
      {
        id: 'emp-11',
        name: 'Sofia Johansson',
        jobTitle: 'Senior Product Manager',
        department: 'Product',
        readiness: 'Ready Now',
        // Person total: 30 + 28 + 23.8 = 81.8 / 100
        competencyEvaluations: [
          {
            competencyName: 'Enterprise sales leadership',
            category: 'Experience',
            importance: 'Required',
            weight: 40,
            evaluatorId: 'emp-8',
            evaluatorName: 'Kwame Asante',
            status: 'Evaluated',
            rating: 75,
            score: 30,
            comment:
              'Excellent customer empathy from product side; limited direct sales management experience.',
          },
          {
            competencyName: 'Pipeline forecasting',
            category: 'Skill',
            importance: 'Required',
            weight: 35,
            evaluatorId: 'emp-10',
            evaluatorName: 'Carlos Rivera',
            status: 'Evaluated',
            rating: 80,
            score: 28,
            comment:
              'Uses data well for revenue planning; would benefit from CRM ownership practice.',
          },
          {
            competencyName: 'Cross-functional collaboration',
            category: 'Behavior',
            importance: 'Preferred',
            weight: 25,
            evaluatorId: 'emp-2',
            evaluatorName: 'Marcus Webb',
            status: 'Evaluated',
            rating: 95,
            score: 23.8,
            comment:
              'Outstanding collaborator across product, eng, and go-to-market teams.',
          },
        ],
      },
    ],
  },
  {
    id: '6',
    positionId: 'pos-5',
    roleName: 'Head of Product',
    department: 'Product',
    priority: 'High',
    riskLevel: 'Medium',
    successorCount: 0,
    notes: 'Critical product leadership role — successors not yet nominated.',
    requiredEducationLevel: 'Bachelor',
    requiredEducationField: 'Any',
    requiredRelevantExperience: 8,
    requiredCurrentPositionIds: ['pos-19', 'pos-18'],
    requiredCurrentPositions: [
      'Senior Product Manager',
      'Product Manager',
    ],
    competencies: [
      {
        name: 'Product strategy',
        category: 'Knowledge',
        importance: 'Required',
        weight: 40,
      },
      {
        name: 'Stakeholder alignment',
        category: 'Behavior',
        importance: 'Required',
        weight: 35,
      },
      {
        name: 'Delivery ownership',
        category: 'Experience',
        importance: 'Preferred',
        weight: 25,
      },
    ],
    successors: [],
  },
];

const seedDemoExtras = (
  roleId: string,
  successorId: string,
  gaps: CompetencyGap[],
): {
  developmentActions?: DevelopmentAction[];
  idp?: IndividualDevelopmentPlan;
} => {
  if (roleId === '2' && successorId === 'emp-1') {
    const gapId = gaps[0]?.id;
    return {
      developmentActions: [
        {
          id: 'da-1',
          actionItem: 'Shadow VP engineering leadership forum for one quarter',
          responsiblePersonId: 'emp-2',
          responsiblePersonName: 'Marcus Webb',
          targetCompletionDate: '2026-09-30',
          status: 'In Progress',
          remarks: 'Attend bi-weekly leadership syncs',
          gapId,
        },
        {
          id: 'da-2',
          actionItem: 'Complete people-management coaching series',
          responsiblePersonId: 'emp-6',
          responsiblePersonName: 'Amara Diallo',
          targetCompletionDate: '2026-08-15',
          status: 'Not Started',
          gapId,
        },
      ],
      idp: {
        objectives:
          'Prepare Lena for VP Engineering through leadership exposure and delivery ownership.',
        status: 'Active',
        activities: [
          {
            id: 'idp-a1',
            type: 'Leadership Training',
            title: 'Engineering Leadership Essentials',
            notes: 'Internal 6-week cohort',
            targetDate: '2026-10-01',
            status: 'In Progress',
            linkedActionIds: ['da-2'],
          },
          {
            id: 'idp-a2',
            type: 'Delegation / Acting Assignment',
            title: 'Acting Engineering Manager for Platform squad (6 weeks)',
            targetDate: '2026-11-15',
            status: 'Not Started',
            linkedActionIds: ['da-1'],
          },
          {
            id: 'idp-a3',
            type: 'Technical Training',
            title: 'Enterprise architecture deep-dive workshop',
            targetDate: '2026-09-01',
            status: 'Completed',
          },
        ],
      },
    };
  }
  if (roleId === '1' && successorId === 'emp-2') {
    const gapId = gaps.find((g) => g.status === 'Open')?.id ?? gaps[0]?.id;
    return {
      developmentActions: [
        {
          id: 'da-3',
          actionItem: 'Present quarterly strategy update to executive sponsors',
          responsiblePersonId: 'emp-10',
          responsiblePersonName: 'Carlos Rivera',
          targetCompletionDate: '2026-07-01',
          status: 'Overdue',
          remarks: 'Reschedule after Q2 board cycle',
          gapId,
        },
      ],
      idp: {
        objectives: 'Build board-level presence and strategic narrative skills.',
        status: 'Active',
        activities: [
          {
            id: 'idp-a4',
            type: 'Leadership Training',
            title: 'Executive communication clinic',
            targetDate: '2026-12-01',
            status: 'Not Started',
            linkedActionIds: ['da-3'],
          },
          {
            id: 'idp-a5',
            type: 'Certification',
            title: 'Strategic leadership certificate (external)',
            targetDate: '2027-03-01',
            status: 'Not Started',
          },
        ],
      },
    };
  }
  return {};
};

const enrichRoles = (roles: CriticalRole[]): CriticalRole[] =>
  roles.map((role) => {
    const eduDefault = defaultRoleEducation(role.department);
    const requiredEducationLevel =
      role.requiredEducationLevel ?? eduDefault.level;
    const requiredEducationField =
      role.requiredEducationField ?? eduDefault.field;
    const requiredRelevantExperience =
      role.requiredRelevantExperience ??
      defaultRequiredExperienceYears(role.department);
    const requiredCurrentPositionIds = (() => {
      if (role.requiredCurrentPositionIds?.length) {
        return role.requiredCurrentPositionIds;
      }
      const fromTitle = findPositionByTitle(
        (role as { requiredCurrentPosition?: string }).requiredCurrentPosition,
      )?.id;
      return fromTitle ? [fromTitle] : [];
    })();
    const requiredCurrentPositions =
      resolvePositionTitles(requiredCurrentPositionIds).length > 0
        ? resolvePositionTitles(requiredCurrentPositionIds)
        : role.requiredCurrentPositions?.length
          ? role.requiredCurrentPositions
          : [];
    return {
      ...role,
      requiredEducationLevel,
      requiredEducationField,
      requiredRelevantExperience,
      requiredCurrentPositionIds,
      requiredCurrentPositions,
      successorCount: (role.successors ?? []).length,
      successors: (role.successors ?? []).map((successor) => {
        const mock = MOCK_EMPLOYEES.find((e) => e.id === successor.id);
        const educationLevel =
          successor.educationLevel ?? mock?.educationLevel;
        const educationField =
          successor.educationField ?? mock?.educationField;
        const education =
          successor.education ??
          mock?.education ??
          formatEducationLabel(educationLevel, educationField);
        const relevantExperience =
          successor.relevantExperience ?? mock?.relevantExperience;
        const currentPositionId =
          successor.currentPositionId ??
          mock?.currentPositionId ??
          findPositionByTitle(
            successor.currentPosition ??
              mock?.currentPosition ??
              successor.jobTitle,
          )?.id;
        const currentPosition =
          resolvePositionTitles(
            currentPositionId ? [currentPositionId] : [],
          )[0] ??
          successor.currentPosition ??
          mock?.currentPosition ??
          successor.jobTitle;
        const readinessFromExperience = deriveReadinessFromExperienceGap(
          requiredRelevantExperience,
          relevantExperience,
        );
        const readiness = (readinessFromExperience ??
          successor.readiness ??
          mock?.readiness ??
          'Ready within 1 Year') as SuccessorReadiness;
        const gaps = deriveSuccessorGaps(
          role.competencies ?? [],
          successor.competencyEvaluations ?? [],
          successor.gaps ?? [],
          {
            level: requiredEducationLevel,
            field: requiredEducationField,
          },
          { level: educationLevel, field: educationField },
          requiredRelevantExperience,
          relevantExperience,
          buildEducationMatchOptions(
            {
              allowRelatedEducationFields: role.allowRelatedEducationFields,
              requiredEducationField,
            },
            successor,
          ),
        );
        const extras = seedDemoExtras(role.id, successor.id, gaps);
        return {
          ...successor,
          educationLevel,
          educationField,
          education,
          relevantExperience,
          currentPositionId,
          currentPosition,
          readiness,
          gaps,
          developmentActions:
            successor.developmentActions ?? extras.developmentActions ?? [],
          idp: successor.idp ?? extras.idp,
        };
      }),
    };
  });

const INITIAL_ROLES = enrichRoles(RAW_ROLES);

const mapSuccessors = (
  roles: CriticalRole[],
  roleId: string,
  successorId: string,
  updater: (
    successor: CriticalRole['successors'][number],
    role: CriticalRole,
  ) => CriticalRole['successors'][number],
): CriticalRole[] =>
  roles.map((role) => {
    if (role.id !== roleId) return role;
    return {
      ...role,
      successors: (role.successors ?? []).map((successor) =>
        successor.id === successorId ? updater(successor, role) : successor,
      ),
    };
  });

export interface EvaluationScoreUpdate {
  competencyName: string;
  category: string;
  /** Raw 0–100 rating entered by the evaluator */
  rating: number;
  /** Weighted points (≤ criterion weight) */
  score: number;
  comment?: string;
}

export type SuccessorProfilePatch = Partial<{
  educationLevel: EducationLevel;
  educationField: EducationField;
  education: string;
  relevantExperience: number;
  currentPositionId: string;
  currentPosition: string;
  readiness: SuccessorReadiness;
}>;

interface SuccessionPlanningStore {
  roles: CriticalRole[];
  nextId: number;
  nextActionId: number;
  nextIdpActivityId: number;
  setRoles: (roles: CriticalRole[]) => void;
  addRole: (
    role: Omit<CriticalRole, 'id' | 'successorCount'> & {
      successorCount?: number;
    },
  ) => CriticalRole;
  updateRole: (
    id: string,
    values: Omit<CriticalRole, 'id' | 'successorCount'>,
  ) => void;
  deleteRole: (id: string) => void;
  getRoleById: (id: string) => CriticalRole | undefined;
  saveEvaluationScores: (
    roleId: string,
    successorId: string,
    evaluatorId: string,
    scores: EvaluationScoreUpdate[],
  ) => void;
  assignCompetencyEvaluator: (
    roleId: string,
    successorId: string,
    competencyName: string,
    category: string,
    evaluatorId: string,
    evaluatorName: string,
  ) => void;
  updateSuccessorProfile: (
    roleId: string,
    successorId: string,
    patch: SuccessorProfilePatch,
  ) => void;
  setEducationRelatedAccepted: (
    roleId: string,
    successorId: string,
    accepted: boolean,
  ) => void;
  recomputeGaps: (roleId: string, successorId: string) => void;
  updateGap: (
    roleId: string,
    successorId: string,
    gapId: string,
    patch: Partial<CompetencyGap>,
  ) => void;
  addDevelopmentAction: (
    roleId: string,
    successorId: string,
    action: Omit<DevelopmentAction, 'id'>,
  ) => void;
  updateDevelopmentAction: (
    roleId: string,
    successorId: string,
    actionId: string,
    patch: Partial<DevelopmentAction>,
  ) => void;
  deleteDevelopmentAction: (
    roleId: string,
    successorId: string,
    actionId: string,
  ) => void;
  upsertIdp: (
    roleId: string,
    successorId: string,
    plan: Omit<IndividualDevelopmentPlan, 'activities'> & {
      activities?: IdpActivity[];
    },
  ) => void;
  addIdpActivity: (
    roleId: string,
    successorId: string,
    activity: Omit<IdpActivity, 'id'>,
  ) => void;
  updateIdpActivity: (
    roleId: string,
    successorId: string,
    activityId: string,
    patch: Partial<IdpActivity>,
  ) => void;
}

export const useSuccessionPlanningStore = create<SuccessionPlanningStore>(
  (set, get) => ({
    roles: INITIAL_ROLES,
    nextId: INITIAL_ROLES.length + 1,
    nextActionId: 10,
    nextIdpActivityId: 20,

    setRoles: (roles) => set({ roles }),

    addRole: (values) => {
      const successors = (values.successors ?? []).map((successor) => ({
        ...successor,
        gaps:
          successor.gaps ??
          deriveSuccessorGaps(
            values.competencies ?? [],
            successor.competencyEvaluations ?? [],
            [],
            {
              level: values.requiredEducationLevel,
              field: values.requiredEducationField ?? 'Any',
            },
            {
              level: successor.educationLevel,
              field: successor.educationField,
            },
            values.requiredRelevantExperience,
            successor.relevantExperience,
            buildEducationMatchOptions(values, successor),
          ),
        developmentActions: successor.developmentActions ?? [],
      }));
      const successorCount = successors.length;
      const id = String(get().nextId);
      const newRole: CriticalRole = {
        ...values,
        id,
        successors,
        successorCount,
      };
      set((state) => ({
        roles: [newRole, ...state.roles],
        nextId: state.nextId + 1,
      }));
      return newRole;
    },

    updateRole: (id, values) => {
      const successors = (values.successors ?? []).map((successor) => ({
        ...successor,
        gaps: deriveSuccessorGaps(
          values.competencies ?? [],
          successor.competencyEvaluations ?? [],
          successor.gaps ?? [],
          {
            level: values.requiredEducationLevel,
            field: values.requiredEducationField ?? 'Any',
          },
          {
            level: successor.educationLevel,
            field: successor.educationField,
          },
          values.requiredRelevantExperience,
          successor.relevantExperience,
          buildEducationMatchOptions(values, successor),
        ),
        developmentActions: successor.developmentActions ?? [],
      }));
      const successorCount = successors.length;
      set((state) => ({
        roles: state.roles.map((r) =>
          r.id === id
            ? { ...r, ...values, successors, successorCount }
            : r,
        ),
      }));
    },

    deleteRole: (id) => {
      set((state) => ({
        roles: state.roles.filter((r) => r.id !== id),
      }));
    },

    getRoleById: (id) => get().roles.find((r) => r.id === id),

    saveEvaluationScores: (roleId, successorId, evaluatorId, scores) => {
      set((state) => ({
        roles: mapSuccessors(state.roles, roleId, successorId, (successor, role) => {
          const competencyEvaluations = (
            successor.competencyEvaluations ?? []
          ).map((evaluation) => {
            if (evaluation.evaluatorId !== evaluatorId) return evaluation;
            const match = scores.find(
              (s) =>
                s.competencyName === evaluation.competencyName &&
                s.category === evaluation.category,
            );
            if (!match) return evaluation;
            return {
              ...evaluation,
              rating: match.rating,
              score: match.score,
              comment: match.comment,
              status: 'Evaluated' as const,
            };
          });
          return {
            ...successor,
            competencyEvaluations,
            gaps: deriveSuccessorGaps(
              role.competencies ?? [],
              competencyEvaluations,
              successor.gaps ?? [],
              {
                level: role.requiredEducationLevel,
                field: role.requiredEducationField ?? 'Any',
              },
              {
                level: successor.educationLevel,
                field: successor.educationField,
              },
              role.requiredRelevantExperience,
              successor.relevantExperience,
              buildEducationMatchOptions(role, successor),
            ),
          };
        }),
      }));
    },

    assignCompetencyEvaluator: (
      roleId,
      successorId,
      competencyName,
      category,
      evaluatorId,
      evaluatorName,
    ) => {
      set((state) => ({
        roles: mapSuccessors(state.roles, roleId, successorId, (successor, role) => {
          const competencyEvaluations = (
            successor.competencyEvaluations ?? []
          ).map((evaluation) => {
            if (
              evaluation.competencyName !== competencyName ||
              evaluation.category !== category
            ) {
              return evaluation;
            }
            const sameEvaluator = evaluation.evaluatorId === evaluatorId;
            if (sameEvaluator) {
              return {
                ...evaluation,
                evaluatorId,
                evaluatorName,
              };
            }
            return {
              ...evaluation,
              evaluatorId,
              evaluatorName,
              status: 'Pending' as const,
              rating: undefined,
              score: undefined,
              comment: undefined,
            };
          });
          return {
            ...successor,
            competencyEvaluations,
            gaps: deriveSuccessorGaps(
              role.competencies ?? [],
              competencyEvaluations,
              successor.gaps ?? [],
              {
                level: role.requiredEducationLevel,
                field: role.requiredEducationField ?? 'Any',
              },
              {
                level: successor.educationLevel,
                field: successor.educationField,
              },
              role.requiredRelevantExperience,
              successor.relevantExperience,
              buildEducationMatchOptions(role, successor),
            ),
          };
        }),
      }));
    },

    updateSuccessorProfile: (roleId, successorId, patch) => {
      set((state) => ({
        roles: mapSuccessors(state.roles, roleId, successorId, (successor, role) => {
          const nextField =
            patch.educationField ?? successor.educationField;
          const fieldChanged =
            patch.educationField != null &&
            patch.educationField !== successor.educationField;
          const next = {
            ...successor,
            ...patch,
            education:
              patch.education ??
              formatEducationLabel(
                patch.educationLevel ?? successor.educationLevel,
                nextField,
              ),
            currentPosition:
              patch.currentPosition ??
              resolvePositionTitle(
                patch.currentPositionId ?? successor.currentPositionId,
              ) ??
              successor.currentPosition,
            educationRelatedAccepted: fieldChanged
              ? false
              : successor.educationRelatedAccepted,
            educationRelatedAcceptedField: fieldChanged
              ? undefined
              : successor.educationRelatedAcceptedField,
          };
          const readinessFromExperience = deriveReadinessFromExperienceGap(
            role.requiredRelevantExperience,
            next.relevantExperience,
          );
          const withReadiness = {
            ...next,
            readiness:
              readinessFromExperience ??
              next.readiness ??
              ('Ready within 1 Year' as SuccessorReadiness),
          };
          return {
            ...withReadiness,
            gaps: deriveSuccessorGaps(
              role.competencies ?? [],
              withReadiness.competencyEvaluations ?? [],
              successor.gaps ?? [],
              {
                level: role.requiredEducationLevel,
                field: role.requiredEducationField ?? 'Any',
              },
              {
                level: withReadiness.educationLevel,
                field: withReadiness.educationField,
              },
              role.requiredRelevantExperience,
              withReadiness.relevantExperience,
              buildEducationMatchOptions(role, withReadiness),
            ),
          };
        }),
      }));
    },

    setEducationRelatedAccepted: (roleId, successorId, accepted) => {
      set((state) => ({
        roles: mapSuccessors(state.roles, roleId, successorId, (successor, role) => {
          const next = {
            ...successor,
            educationRelatedAccepted: accepted,
            educationRelatedAcceptedField: accepted
              ? successor.educationField
              : undefined,
          };
          return {
            ...next,
            gaps: deriveSuccessorGaps(
              role.competencies ?? [],
              next.competencyEvaluations ?? [],
              successor.gaps ?? [],
              {
                level: role.requiredEducationLevel,
                field: role.requiredEducationField ?? 'Any',
              },
              {
                level: next.educationLevel,
                field: next.educationField,
              },
              role.requiredRelevantExperience,
              next.relevantExperience,
              buildEducationMatchOptions(role, next),
            ),
          };
        }),
      }));
    },

    recomputeGaps: (roleId, successorId) => {
      set((state) => ({
        roles: mapSuccessors(state.roles, roleId, successorId, (successor, role) => ({
          ...successor,
          gaps: deriveSuccessorGaps(
            role.competencies ?? [],
            successor.competencyEvaluations ?? [],
            [],
            {
              level: role.requiredEducationLevel,
              field: role.requiredEducationField ?? 'Any',
            },
            {
              level: successor.educationLevel,
              field: successor.educationField,
            },
            role.requiredRelevantExperience,
            successor.relevantExperience,
            buildEducationMatchOptions(role, successor),
          ),
        })),
      }));
    },

    updateGap: (roleId, successorId, gapId, patch) => {
      set((state) => ({
        roles: mapSuccessors(state.roles, roleId, successorId, (successor) => ({
          ...successor,
          gaps: (successor.gaps ?? []).map((gap) =>
            gap.id === gapId ? { ...gap, ...patch } : gap,
          ),
        })),
      }));
    },

    addDevelopmentAction: (roleId, successorId, action) => {
      const id = `da-${get().nextActionId}`;
      set((state) => ({
        nextActionId: state.nextActionId + 1,
        roles: mapSuccessors(state.roles, roleId, successorId, (successor) => ({
          ...successor,
          developmentActions: [
            ...(successor.developmentActions ?? []),
            {
              ...action,
              id,
              status: resolveActionStatus(
                action.status,
                action.targetCompletionDate,
                action.completionDate,
              ),
            },
          ],
        })),
      }));
    },

    updateDevelopmentAction: (roleId, successorId, actionId, patch) => {
      set((state) => ({
        roles: mapSuccessors(state.roles, roleId, successorId, (successor) => ({
          ...successor,
          developmentActions: (successor.developmentActions ?? []).map(
            (action) => {
              if (action.id !== actionId) return action;
              const next = { ...action, ...patch };
              return {
                ...next,
                status: resolveActionStatus(
                  next.status,
                  next.targetCompletionDate,
                  next.completionDate,
                ),
              };
            },
          ),
        })),
      }));
    },

    deleteDevelopmentAction: (roleId, successorId, actionId) => {
      set((state) => ({
        roles: mapSuccessors(state.roles, roleId, successorId, (successor) => ({
          ...successor,
          developmentActions: (successor.developmentActions ?? []).filter(
            (a) => a.id !== actionId,
          ),
        })),
      }));
    },

    upsertIdp: (roleId, successorId, plan) => {
      set((state) => ({
        roles: mapSuccessors(state.roles, roleId, successorId, (successor) => ({
          ...successor,
          idp: {
            status: plan.status,
            activities: plan.activities ?? successor.idp?.activities ?? [],
          },
        })),
      }));
    },

    addIdpActivity: (roleId, successorId, activity) => {
      const id = `idp-a-${get().nextIdpActivityId}`;
      set((state) => ({
        nextIdpActivityId: state.nextIdpActivityId + 1,
        roles: mapSuccessors(state.roles, roleId, successorId, (successor) => {
          const idp = successor.idp ?? {
            status: 'Draft' as const,
            activities: [],
          };
          return {
            ...successor,
            idp: {
              ...idp,
              activities: [...idp.activities, { ...activity, id }],
            },
          };
        }),
      }));
    },

    updateIdpActivity: (roleId, successorId, activityId, patch) => {
      set((state) => ({
        roles: mapSuccessors(state.roles, roleId, successorId, (successor) => {
          if (!successor.idp) return successor;
          return {
            ...successor,
            idp: {
              ...successor.idp,
              activities: successor.idp.activities.map((activity) =>
                activity.id === activityId
                  ? { ...activity, ...patch }
                  : activity,
              ),
            },
          };
        }),
      }));
    },
  }),
);
