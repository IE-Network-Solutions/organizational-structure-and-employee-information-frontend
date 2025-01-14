import { create } from 'zustand';
import { KeyResult, Objective, OKRState } from './interface';
import { devtools } from 'zustand/middleware';

export const useOKRStore = create<OKRState>()(
  devtools((set) => ({
    isVP: true,
    toggleDashboard: () => set((state) => ({ isVP: !state.isVP })),

    revenue: 123050,
    financialSales: 10050,
    progressRevenue: 56.02,
    progressSales: 123100000,

    selectedPeriodId: '',
    setSelectedPeriodId: (value) => set({ selectedPeriodId: value }),

    // Initialize objective state with keyResults as an empty array
    objective: {
      title: '',
      userId: '',
      deadline: '',
      keyResults: [
        {
          key_type: 'Milestone',
          metricTypeId: '',
          title: '',
          weight: 0,
          deadline: null,
          initialValue: 0,
          targetValue: 0,
          milestones: [],
        },
      ],
    },
    objectiveValue: {
      title: '',
      userId: '',
      deadline: '',
    },

    // Initialize key result value state
    keyResultValue: [],

    // Setters
    setObjective: (objective: Objective) => set({ objective }),
    setObjectiveValue: (objectiveValue: Objective) => set({ objectiveValue }),
    setKeyResult: (keyResults: KeyResult[]) =>
      set((state) => ({
        objective: {
          ...state.objective,
          keyResults,
        },
      })),
    setKeyResultValue: (keyResultValue: KeyResult[]) => set({ keyResultValue }),

    // Add key result to objective
    addKeyResult: () =>
      set((state) => ({
        objective: {
          ...state.objective,
          keyResults: [
            ...state.objective.keyResults,
            {
              key_type: 'Milestone',
              metricTypeId: '',
              title: '',
              weight: 0,
              deadline: null,
              initialValue: 0,
              targetValue: 0,
              milestones: [],
            },
          ],
        },
      })),

    // Add last key result to keyResultValue
    addKeyResultValue: (newKeyResult) =>
      set((state) => {
        const lastKeyResult =
          state.objective.keyResults[state.objective.keyResults.length - 1];
        if (lastKeyResult) {
          return {
            // Append the new key result value and copy the last key result
            keyResultValue: [
              ...state.keyResultValue,
              { ...lastKeyResult, ...newKeyResult },
            ],

            // Also append it to objectiveValue's keyResults array
            objectiveValue: {
              ...state.objectiveValue,
              keyResults: [
                ...(state.objectiveValue.keyResults || []), // Handle case when keyResults might be undefined
                { ...lastKeyResult, ...newKeyResult },
              ],
            },
          };
        }

        // If no key result, add the new key result directly
        return {
          ...state,
          keyResultValue: [...state.keyResultValue, { ...newKeyResult }],
          objectiveValue: {
            ...state.objectiveValue,
            keyResults: [
              ...(state.objectiveValue.keyResults || []),
              { ...newKeyResult },
            ],
          },
        };
      }),

    // Update a specific key result in the objective
    updateKeyResult: (index: number, field: keyof KeyResult, value: any) =>
      set((state) => ({
        objective: {
          ...state.objective,
          keyResults: state.objective.keyResults.map((item: any, i: number) =>
            i === index ? { ...item, [field]: value } : item,
          ),
        },
      })),
    updateKeyResultValue: (index: number, field: keyof KeyResult, value: any) =>
      set((state) => ({
        keyResultValue: state.keyResultValue.map((item: any, i: number) =>
          i === index ? { ...item, [field]: value } : item,
        ),
      })),
    handleKeyResultChange: (value: any, index: number, field: string) =>
      set((state) => {
        const newKeyResult = [...state.objectiveValue.keyResults];
        newKeyResult[index] = {
          ...newKeyResult[index],
          [field]: value,
        };
        return {
          objectiveValue: {
            ...state.objectiveValue,
            keyResults: newKeyResult,
          },
        };
      }),

    handleSingleKeyResultChange: (value: any, field: string) => {
      set((state) => {
        // Log the current state here
        return {
          keyResultValue: {
            ...state.keyResultValue, // Ensure you're updating the correct state field
            [field]: value, // Update the specific field with the new value
          },
        };
      });
    },
    // Action to handle changes to milestones within keyResults
    handleMilestoneChange: (
      value: any,
      keyResultIndex: number,
      mindex: number,
      field: string,
    ) =>
      set((state) => {
        const newKeyResult = [...state.objectiveValue.keyResults];
        newKeyResult[keyResultIndex].milestones = newKeyResult[
          keyResultIndex
        ].milestones.map((m: any, i: number) =>
          i === mindex ? { ...m, [field]: value } : m,
        );
        return {
          objectiveValue: {
            ...state.objectiveValue,
            keyResults: newKeyResult,
          },
        };
      }),

    handleMilestoneSingleChange: (
      value: any,
      mindex: number,
      field: string,
    ) => {
      set((state) => {
        // Update milestones based on the provided index and field
        const updatedMilestones = state.keyResultValue.milestones.map(
          (milestone: any, index: number) =>
            index === mindex ? { ...milestone, [field]: value } : milestone,
        );

        // Return the updated keyResultValue
        return {
          keyResultValue: {
            ...state.keyResultValue,
            milestones: updatedMilestones,
          },
        };
      });
    },

    // Remove a specific key result from objective
    removeKeyResult: (index: number) =>
      set((state) => ({
        objective: {
          ...state.objective,
          /* eslint-disable @typescript-eslint/no-unused-vars */
          keyResults: state.objective.keyResults.filter(
            (form: any, i: number) => i !== index,
            /* eslint-enable @typescript-eslint/no-unused-vars */
          ),
        },
      })),

    // Remove a specific key result from keyResultValue
    removeKeyResultValue: (index: number) =>
      set((state) => {
        // Remove the key result from keyResultValue
        const updatedKeyResultValue = state.keyResultValue.filter(
          /* eslint-disable @typescript-eslint/no-unused-vars */
          (form: any, i: number) => i !== index,
          /* eslint-enable @typescript-eslint/no-unused-vars */
        );

        // Also update objectiveValue's keyResults array
        const updatedObjectiveValue = {
          ...state.objectiveValue,
          keyResults: state.objectiveValue.keyResults.filter(
            /* eslint-disable @typescript-eslint/no-unused-vars */
            (form: any, i: number) => i !== index,
            /* eslint-enable @typescript-eslint/no-unused-vars */
          ),
        };

        return {
          keyResultValue: updatedKeyResultValue,
          objectiveValue: updatedObjectiveValue,
        };
      }),
    searchObjParams: {
      userId: '',
      metricTypeId: '',
      departmentId: '',
    },
    setSearchObjParams: (key, value) =>
      set((state) => ({
        searchObjParams: { ...state.searchObjParams, [key]: value },
      })),
    pageSize: 5,
    setPageSize: (pageSize: number) => set({ pageSize }),
    currentPage: 1,
    teamPageSize: 5,
    setTeamPageSize: (teamPageSize: number) => set({ teamPageSize }),
    teamCurrentPage: 1,
    setCurrentPage: (currentPage: number) => set({ currentPage }),
    setTeamCurrentPage: (teamCurrentPage: number) => set({ teamCurrentPage }),
    companyPageSize: 5,
    setCompanyPageSize: (companyPageSize: number) => set({ companyPageSize }),
    companyCurrentPage: 1,
    setCompanyCurrentPage: (companyCurrentPage: number) =>
      set({ companyCurrentPage }),
    okrTab: 1,
    setOkrTab: (okrTab: number | string) => set({ okrTab }),
  })),
);
