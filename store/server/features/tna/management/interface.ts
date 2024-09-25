export interface CourseManagementRequestBody {
  filter: {
    id?: string[];
    courseCategoryId?: string[];
  };
  modifiers: {
    search: string;
  };
}
