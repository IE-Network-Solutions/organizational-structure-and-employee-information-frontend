export enum Permissions {

  // Could not be found Permissions that needs to be changed
  ViewAllEmployeePlan = 'view-all-employee-plan',
  ViewAllPlan = 'view-all-plan',
  ViewAllStatusPlan = 'view-all-status-plan',
  ViewReprimandAndAppreciation = 'view-reprimand-and-appreciation',
  ViewReprimandAndAppreciationDetails = 'view-reprimand-and-appreciation-details',
  EditAppreciationAndReprimand = 'edit-appreciation-and-reprimand',
  DeleteAppreciationAndReprimand = 'delete-appreciation-and-reprimand',
  CreateAppreciation = 'create-appreciation',
  ViewPlanningPeriod = 'view-planning-period',
  ViewPlanningAssignation = 'view-planning-assignation',
  ViewDefineAppreciation = 'view-define-appreciation',
  ViewDefineReprimand = 'view-define-reprimand',
  ViewDefineOKRRule = 'view-define-okr-rule',
  CreateCustomFields = 'create-custom-fields',
  EditCustomFields = 'edit-custom-fields',
  DeleteCustomFields = 'delete-custom-fields',
  CreateCommentOnPlanAndReport = 'create-comment-on-Plan-and-report',
  UpdateCommentOnPlanAndReport = 'update-comment-on-Plan-and-report',
  DeleteCommentOnPlanAndReport = 'delete-comment-on-Plan-and-report',
  CreateFormCategory = 'create-form-category',
  CreatePlanningPeriod = 'create-planning-period',
  UpdatePlanningPeriod = 'update-planning-period',
  DleletePlanningPeriod = 'delete-planning-period',
  ActivateDeactivatePlanningPeriod = 'activate-deactivate-planning-period',
  AssignPlanningPeriod = 'assign-planning-period',
  UpdateAssignedPlanningPeriod = 'update-assigned-planning-period',
  DeleteAssignedPlanningPeriod = 'delete-assigned-planning-period',
  CreateReprimandType = 'create-reprimand-type',
  DeleteReprimandType = 'delete-reprimand-type',
  CreateAppreciationType = 'create-appreciation-type',
  UpdateAppreciationType = 'update-appreciation-type',
  DeleteAppreciationType = 'delete-appreciation-type',
  CreateOkrRule = 'create-okr-rule',
  UpdateLeaveRequest = 'update-leave-request',
  DeleteLeaveRequest = 'delete-leave-request',
  ViewAttendanceDetails = 'view-attendance-details',
  CreateApprovalWorkFlow = 'create-approval-work-flow',
  CreateApprover = 'create-approver',
  UpdateApprover = 'update-approver',
  DeleteApprover = 'update-approver',


  // Course Permissions
  UpdateCourse = 'update-course',
  DeleteCourse = 'delete-course',
  CreateCourse = 'create-course',

  // Course Category Permissions
  CreateCourseCategory = 'create-course-category',
  UpdateCourseCategory = 'update-course-category',
  DeleteCourseCategory = 'delete-course-category',

  // TNA Permissions
  CreateTna = 'create-tna',
  UpdateTna = 'update-tna',
  DeleteTna = 'delete-tna',

  // TNA Category Permissions
  CreateTnaCategory = 'create-tna-category',
  UpdateTnaCategory = 'update-tna-category',
  DeleteTnaCategory = 'delete-tna-category',

  // Commitment Rule Permissions
  CreateCommitmentRule = 'create-commitment-rule',
  UpdateCommitmentRule = 'update-commitment-rule',
  DeleteCommitmentRule = 'delete-commitment-rule',

  // Lesson Permissions
  CreateLesson = 'create-lesson',
  UpdateLesson = 'update-lesson',
  DeleteLesson = 'delete-lesson',

  // Course Material Permissions
  CreateCourseMaterial = 'create-course-material',
  UpdateCourseMaterial = 'update-course-material',
  DeleteCourseMaterial = 'delete-course-material',

  // Department Permissions
  CreateDepartment = 'create-department',
  UpdateDepartment = 'update-department',
  DeleteDepartment = 'delete-department',
  MergeDepartment = 'merge-department',
  DissolveDepartment = 'dissolve-department',

  // Branch Permissions
  CreateBranch = 'create-branch',
  UpdateBranch = 'update-branch',
  DeleteBranch = 'delete-branch',

  // Working Schedule Permissions
  CreateWorkingSchedule = 'create-working-schedule',
  UpdateWorkingSchedule = 'update-working-schedule',
  DeleteWorkingSchedule = 'delete-working-schedule',

  // Calendar Permissions
  CreateCalendar = 'create-calendar',
  UpdateCalendar = 'update-calendar',
  DeleteCalendar = 'delete-calendar',

  // Organization Permissions
  AssignWorkingScheduleToOrg = 'assign-working-schedule-organization',
  AssignCalendarToOrg = 'assign-calendar-organization',
  ViewOrgStructureSidebar = 'view-organization-structure-sidebar',

  // Employee Document Permissions
  DownloadEmployeeDocument = 'download-employee-document',
  UploadEmployeeDocuments = 'upload-employee-documents',
  DeleteEmployeeDocument = 'delete-employee-document',

  // Employment and Related Information Permissions
  UpdateEmploymentInformation = 'update-employment-information',
  EndEmployment = 'end-employment',
  DeleteEmployee = 'delete-employee',
  UpdateEmployeeStatus = 'update-employee-status',
  ViewEmployeeDetail = 'view-employee-detail',

  AddOffloadingTasks = 'add-offloading-tasks',
  AddOffloadingTemplateTasks = 'add-offloading-template-tasks',

  CreateEmploymentType = 'create-employment-type',
  DeleteEmploymentType = 'delete-employment-type',
  UpdateEmploymentType = 'update-employment-type',

  RegisterNewEmployee = 'register-new-employee',
  UpdateEmployeeDetails = 'update-employee-details',
  UpdateEmployeeJobInformation = 'update-employee-job-information',

  // Role Permissions
  UpdateRole = 'update-role',
  CreateRole = 'create-role',
  DeleteRole = 'delete-role',
  AssignRolesToUser = 'assign-roles-to-user',
  RevokeRolesFromUser = 'revoke-roles-from-user',
  ViewUserRoles = 'view-user-roles',
  CreateGroupPermission = 'create-group-permission',
  UpdateGroupPermission = 'update-group-permission',
  DeleteGroupPermission = 'delete-group-permission',
  UpdateRoleForUser = 'update-role-for-user',

  // Leave and Attendance Permissions
  CreateAttendanceRuleType = 'create-attendance-rule-type',
  UpdateAttendanceRuleType = 'update-attendance-rule-type',
  DeleteAttendanceRuleType = 'delete-attendance-rule-type',
  CreateCarryOverRule = 'create-carry-over-rule',
  UpdateCarryOverRule = 'update-carry-over-rule',
  DeleteCarryOverRule = 'delete-carry-over-rule',
  CreateLeaveType = 'create-leave-type',
  UpdateLeaveType = 'update-leave-type',
  DeleteLeaveType = 'delete-leave-type',
  DownloadEmployeeLeaveInformation = 'download-employee-leave-information',
  UploadLeaveJustification = 'upload-leave-justification',
  ApproveLeaveJustification = 'approve-leave-justification',
  DeclineLeaveJustification = 'decline-leave-justification',
  CreateAttendanceRule = 'create-attendance-rule',
  UpdateAttendanceRule = 'update-attendance-rule',
  DeleteAttendanceRule = 'delete-attendance-rule',
  CreateLeaveAccrualPeriod = 'create-leave-accrual-period',
  UpdateLeaveAccrualPeriod = 'update-leave-accrual-period',
  DeleteLeaveAccrualPeriod = 'delete-leave-accrual-period',
  ApproveEmployeeLeaveRequest = 'approve-employee-leave-request',
  DeclineEmployeeLeaveRequest = 'decline-employee-leave-request',
  ViewLeaveAvailability = 'view-leave-availability',
  GenerateLeaveReports = 'generate-leave-reports',
  ImportEmployeeAttendanceInformation = 'import-employee-attendance-information',
  ExportEmployeeAttendanceInformation = 'export-employee-attendance-information',
  ApproveEmployeeAttendanceInformation = 'approve-employee-attendance-information',

  // What are LeaveAccuruals??????????
  CreateLeaveAccrual = 'create-leave-accrual',
  UpdateLeaveAccrual = 'update-leave-accrual',
  DeleteLeaveAccrual = 'delete-leave-accrual',
  CreateClosedDate = 'create-closed-date',
  DeleteClosedDate = 'delete-closed-date',
  UpdateClosedDate = 'update-closed-date',
  SetExpirationRule = 'set-expiration-rule',
  CreateApproverRoleInRuleSettings = 'create-approver-role-rule-settings',
  UpdateApproverRoleInRuleSettings = 'update-approver-role-rule-settings',
  DeleteApproverRoleInRuleSettings = 'delete-approver-role-rule-settings',
  CheckInRemotely = 'check-in-remotely',
  CheckOutRemotely = 'check-out-remotely',
  ViewCurrentLeaveStatus = 'view-current-leave-status',
  ViewLeaveHistory = 'view-leave-history',
  SubmitLeaveRequest = 'submit-leave-request',
  GenerateAttendanceReports = 'generate-attendance-reports',

  // OKR Permissions
  ViewTeamOkr = 'view-team-okr',
  ViewCompanyOkr = 'view-company-okr',
  UpdateObjectives = 'update-objectives',
  UpdateKeyResults = 'update-key-results',
  DeleteOkrRule = 'delete-okr-rule',
  UpdateOkrRule = 'update-okr-rule',
  ViewOkrReports = 'view-okr-reports',
  DeleteKeyResults = 'delete-key-results',
  DeleteObjectives = 'delete-objectives',

  // Talent Pool Permissions
  CreateTalentPool = 'create-talent-pool',
  UpdateTalentPool = 'update-talent-pool',
  DeleteTalentPool = 'delete-talent-pool',
  CreateTalentPoolCategory = 'create-talent-pool-category',
  DeleteTalentPoolCategory = 'delete-talent-pool-category',
  UpdateTalentPoolCategory = 'update-talent-pool-category',

  // Candidate Permissions
  CreateCandidate = 'create-candidate',
  UpdateCandidate = 'update-candidate',
  DeleteCandidate = 'delete-candidate',
  TransferCandidate = 'transfer-candidate',
  ReviewApplicationStage = 'review-application-stage',
  RecordCandidateReport = 'record-candidate-report',

  // Recruitment and Onboarding
  CreateJobDescription = 'create-job-description',
  UpdateJobDescription = 'update-job-description',
  DeleteJobDescription = 'delete-job-description',

  // Reprimand Permissions
  CreateReprimand = 'create-reprimand',
  UpdateReprimandType = 'update-reprimand-type',

  // Performance Review Permissions
  CreatePerformanceReview = 'create-performance-review',
  UpdatePerformanceReview = 'update-performance-review',
  DeletePerformanceReview = 'delete-performance-review',

  // Form Category Permissions
  DeleteFormCategory = 'delete-form-category',
  UpdateFormCategory = 'update-form-category',

  // Template Questions Permissions
  CreateTemplateQuestions = 'create-template-questions',
  UpdateTemplateQuestions = 'update-template-questions',
  DeleteTemplateQuestions = 'delete-template-questions',

  // Allowed Area Permissions
  CreateAllowedArea = 'create-allowed-area',
  UpdateAllowedArea = 'update-allowed-area',
  DeleteAllowedArea = 'delete-allowed-area',

  // Miscellaneous Permissions
  SetMaximumCarryOverLimit = 'set-maximum-carry-over-limit',
}
