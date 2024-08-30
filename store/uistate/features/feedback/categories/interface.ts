export interface SubcategoryCardProps {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  hasQuestions: boolean;
  completedCount?: number;
  totalCount?: number;
  resolvedCount?: number;
}
