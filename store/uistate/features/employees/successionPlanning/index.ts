import { create } from 'zustand';
import { CriticalRole } from '@/app/(afterLogin)/(employeeInformation)/employees/succession-planning/_components/criticalRoleModal';

/**
 * Scoring model (prototype):
 * - Each competency has a weight (%). Weights for a role must sum to 100.
 * - Evaluator rates each competency 0–100; weighted result = (rating/100)×weight
 *   (e.g. weight 40 → result is out of 40).
 * - Person total = sum of weighted results, out of 100.
 */
const INITIAL_ROLES: CriticalRole[] = [
  {
    id: '1',
    positionId: 'pos-1',
    roleName: 'Chief Executive Officer',
    department: 'Executive',
    priority: 'Critical',
    riskLevel: 'High',
    successorCount: 1,
    notes: 'Requires board approval for succession.',
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
        readiness: '1-2 Years',
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
        readiness: 'Ready Now',
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
        readiness: '1-2 Years',
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
        readiness: '1-2 Years',
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
        readiness: '1-2 Years',
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
        readiness: '1-2 Years',
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
];

export interface EvaluationScoreUpdate {
  competencyName: string;
  category: string;
  /** Raw 0–100 rating entered by the evaluator */
  rating: number;
  /** Weighted points (≤ criterion weight) */
  score: number;
  comment?: string;
}

interface SuccessionPlanningStore {
  roles: CriticalRole[];
  nextId: number;
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
  /** Persist scores for an evaluator's assigned competencies on a successor */
  saveEvaluationScores: (
    roleId: string,
    successorId: string,
    evaluatorId: string,
    scores: EvaluationScoreUpdate[],
  ) => void;
}

export const useSuccessionPlanningStore = create<SuccessionPlanningStore>(
  (set, get) => ({
    roles: INITIAL_ROLES,
    nextId: INITIAL_ROLES.length + 1,

    setRoles: (roles) => set({ roles }),

    addRole: (values) => {
      const successorCount =
        values.successorCount ?? values.successors?.length ?? 0;
      const id = String(get().nextId);
      const newRole: CriticalRole = {
        ...values,
        id,
        successorCount,
      };
      set((state) => ({
        roles: [newRole, ...state.roles],
        nextId: state.nextId + 1,
      }));
      return newRole;
    },

    updateRole: (id, values) => {
      const successorCount = values.successors?.length ?? 0;
      set((state) => ({
        roles: state.roles.map((r) =>
          r.id === id ? { ...r, ...values, successorCount } : r,
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
        roles: state.roles.map((role) => {
          if (role.id !== roleId) return role;
          return {
            ...role,
            successors: (role.successors ?? []).map((successor) => {
              if (successor.id !== successorId) return successor;
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
              return { ...successor, competencyEvaluations };
            }),
          };
        }),
      }));
    },
  }),
);
