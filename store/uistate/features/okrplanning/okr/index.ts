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

    selectedCard: null,
    setSelectedCard: (selectedCard: string | null) => set({ selectedCard }),

    // Initialize objective state with keyResults as an empty array
    objective: {
      title: '',
      userId: '',
      deadline: '',
      isClosed: false,
      keyResults: [],
    },
    objectiveValue: {
      title: '',
      userId: '',
      deadline: '',
      isClosed: false,
    },

    selectedMetric: null,
    setSelectedMetric: (selectedMetric: any) => set({ selectedMetric }),
    // Initialize key result value state
    keyResultValue: [],
    keyResultId: '',
    objectiveId: '',

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
    setKeyResultId: (keyResultId: string) => set({ keyResultId }),
    setObjectiveId: (objectiveId: string) => set({ objectiveId }),

    // Add key result to objective
    addKeyResult: (keyType = 'Milestone', metricTypeId = '') =>
      set((state) => ({
        objective: {
          ...state.objective,
          keyResults: [
            ...state.objective.keyResults,
            {
              key_type: keyType,
              metricTypeId: metricTypeId,
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
      set((state) => {
        const currentKeyResults = [...state.objective.keyResults];
        const removedKeyResult = currentKeyResults[index];
        const remainingKeyResults = currentKeyResults.filter(
          (form: any, i: number) => i !== index,
        );

        // Redistribute the weight of the removed key result
        if (remainingKeyResults.length > 0 && removedKeyResult) {
          const removedWeight = Number(removedKeyResult.weight || 0);
          const weightPerRemaining = Math.round(
            removedWeight / remainingKeyResults.length,
          );

          const redistributedKeyResults = remainingKeyResults.map(
            (kr: any) => ({
              ...kr,
              weight: Number(kr.weight || 0) + weightPerRemaining,
            }),
          );

          // Check if there's a rounding discrepancy and add 1% to the first key result
          const totalWeight = redistributedKeyResults.reduce(
            (sum: number, kr: any) => sum + Number(kr.weight || 0),
            0,
          );

          // Calculate the expected total (original total should be 100%)
          const originalTotal =
            remainingKeyResults.reduce(
              (sum: number, kr: any) => sum + Number(kr.weight || 0),
              0,
            ) + Number(removedKeyResult.weight || 0);

          // Only add 1% if we lost weight due to rounding and we're below the original total
          if (
            totalWeight < originalTotal &&
            redistributedKeyResults.length > 0
          ) {
            redistributedKeyResults[0] = {
              ...redistributedKeyResults[0],
              weight: Number(redistributedKeyResults[0].weight || 0) + 1,
            };
          }

          return {
            objective: {
              ...state.objective,
              keyResults: redistributedKeyResults,
            },
          };
        }

        return {
          objective: {
            ...state.objective,
            keyResults: remainingKeyResults,
          },
        };
      }),

    // Remove a specific key result from keyResultValue
    removeKeyResultValue: (index: number) =>
      set((state) => {
        // Remove the key result from keyResultValue
        const updatedKeyResultValue = state.keyResultValue.filter(
          /* eslint-disable @typescript-eslint/no-unused-vars */
          (form: any, i: number) => i !== index,
          /* eslint-enable @typescript-eslint/no-unused-vars */
        );

        // Handle weight redistribution for objectiveValue's keyResults
        const currentKeyResults = [...(state.objectiveValue.keyResults || [])];
        const removedKeyResult = currentKeyResults[index];
        const remainingKeyResults = currentKeyResults.filter(
          (form: any, i: number) => i !== index,
        );

        let redistributedKeyResults = remainingKeyResults;

        // Redistribute the weight of the removed key result
        if (remainingKeyResults.length > 0 && removedKeyResult) {
          const removedWeight = Number(removedKeyResult.weight || 0);
          const weightPerRemaining = Math.round(
            removedWeight / remainingKeyResults.length,
          );

          redistributedKeyResults = remainingKeyResults.map((kr: any) => ({
            ...kr,
            weight: Number(kr.weight || 0) + weightPerRemaining,
          }));

          // Check if there's a rounding discrepancy and add 1% to the first key result
          const totalWeight = redistributedKeyResults.reduce(
            (sum: number, kr: any) => sum + Number(kr.weight || 0),
            0,
          );

          // Calculate the expected total (original total should be 100%)
          const originalTotal =
            remainingKeyResults.reduce(
              (sum: number, kr: any) => sum + Number(kr.weight || 0),
              0,
            ) + Number(removedKeyResult.weight || 0);

          // Only add 1% if we lost weight due to rounding and we're below the original total
          if (
            totalWeight < originalTotal &&
            redistributedKeyResults.length > 0
          ) {
            redistributedKeyResults[0] = {
              ...redistributedKeyResults[0],
              weight: Number(redistributedKeyResults[0].weight || 0) + 1,
            };
          }
        }

        const updatedObjectiveValue = {
          ...state.objectiveValue,
          keyResults: redistributedKeyResults,
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
    employeePageSize: 10,
    setEmployeePageSize: (employeePageSize: number) =>
      set({ employeePageSize }),
    employeeCurrentPage: 1,
    setEmployeeCurrentPage: (employeeCurrentPage: number) =>
      set({ employeeCurrentPage }),
    okrTab: 1,
    setOkrTab: (okrTab: number | string) => set({ okrTab }),
    alignment: false,
    setAlignment: (alignment: boolean) => set({ alignment }),
    fiscalYearId: '',
    setFiscalYearId: (fiscalYearId: string) => set({ fiscalYearId }),
    sessionIds: [],
    setSessionIds: (sessionIds: string[]) => set({ sessionIds }),
  })),
);
