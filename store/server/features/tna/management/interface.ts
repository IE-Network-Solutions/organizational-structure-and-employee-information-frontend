export interface CourseManagementRequestBody {
  filter: {
    id: string[];
  };
  modifiers: {
    search: string;
  };
}
