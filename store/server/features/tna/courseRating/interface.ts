import { DateInfo } from '@/types/commons/dateInfo';

export interface CourseRating extends DateInfo {
  id: string;
  courseId: string;
  userId: string;
  rating: number;
  comment: string;
  tenantId?: string;
}

export interface CreateCourseRatingRequest {
  courseId: string;
  rating: number;
  comment: string;
}

export interface UpdateCourseRatingRequest {
  id: string;
  courseId: string;
  rating: number;
  comment?: string | null;
}

export interface CourseRatingsResponse {
  items?: CourseRating[];
  item?: CourseRating;
  meta?: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}
