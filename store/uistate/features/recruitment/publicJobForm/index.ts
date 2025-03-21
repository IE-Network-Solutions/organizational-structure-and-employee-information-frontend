import { create } from 'zustand';

interface ResponseDetail {
  questionId: string;
  respondentId?: string | null;
  responseDetail: Record<string, string>[];
}
interface JobFormState {
  selectedAnswer: ResponseDetail[];
  setSelectedAnswer: (responseDetail: ResponseDetail) => void;
}

export const useJobFormStore = create<JobFormState>((set) => ({
  selectedAnswer: [],
  setSelectedAnswer: (newResponseDetail: ResponseDetail) =>
    set((state: any) => {
      const index = state.selectedAnswer.findIndex(
        (item: any) =>
          item.questionId === newResponseDetail.questionId &&
          item.respondentId === newResponseDetail.respondentId,
      );

      if (index !== -1) {
        const updatedSelectedAnswer = [...state.selectedAnswer];
        updatedSelectedAnswer[index] = newResponseDetail;
        return { selectedAnswer: updatedSelectedAnswer };
      } else {
        return { selectedAnswer: [...state.selectedAnswer, newResponseDetail] };
      }
    }),
}));
