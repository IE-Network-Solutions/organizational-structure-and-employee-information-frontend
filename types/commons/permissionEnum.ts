export enum Permissions {
    
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

    // Employment Information Permissions
    UpdateEmploymentInformation = 'update-employment-information',
    EndEmployment = 'end-employment',
    UpdateEmployeeStatus = 'update-employee-status',

    // Role Permissions
    UpdateRole = 'update-role',
    CreateRole = 'create-role',
    DeleteRole = 'delete-role',
    AssignRolesToUser = 'assign-roles-to-user',
    RevokeRolesFromUser = 'revoke-roles-from-user',
    ViewUserRoles = 'view-user-roles',

    // Leave and Attendance Permissions
    CreateAttendanceRuleType = 'create-attendance-rule-type',
    CreateCarryOverRule = 'create-carry-over-rule',
    UpdateLeaveType = 'update-leave-type',
    DeleteLeaveType = 'delete-leave-type',
    DownloadEmployeeLeaveInformation = 'download-employee-leave-information',
    ApproveLeaveJustification = 'approve-leave-justification',
    CreateAttendanceRule = 'create-attendance-rule',
    CreateLeaveAccrualPeriod = 'create-leave-accrual-period',
    CreateLeaveType = 'create-leave-type',
    ApproveEmployeeLeaveRequest = 'approve-employee-leave-request',
    DeclineEmployeeLeaveRequest = 'decline-employee-leave-request',
    ViewLeaveAvailability = 'view-leave-availability',
    GenerateLeaveReports = 'generate-leave-reports',

    // OKR Permissions
    ViewTeamOkr = 'view-team-okr',
    ViewCompanyOkr = 'view-company-okr',
    UpdateObjectives = 'update-objectives',
    UpdateKeyResults = 'update-key-results',
    DeleteOkrRule = 'delete-okr-rule',
    UpdateOkrRule = 'update-okr-rule',
    ViewOkrReports = 'view-okr-reports',

    // Talent Pool Permissions
    CreateTalentPool = 'create-talent-pool',
    UpdateTalentPool = 'update-talent-pool',
    DeleteTalentPoolCategory = 'delete-talent-pool-category',

    // Candidate Permissions
    CreateCandidate = 'create-candidate',
    UpdateCandidate = 'update-candidate',
    DeleteCandidate = 'delete-candidate',
    TransferCandidate = 'transfer-candidate',
    ReviewApplicationStage = 'review-application-stage',
    RecordCandidateReport = 'record-candidate-report',

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

    // Employee Role and Job Information Permissions
    RegisterNewEmployee = 'register-new-employee',
    UpdateEmployeeDetails = 'update-employee-details',
    UpdateEmployeeJobInformation = 'update-employee-job-information',
    UpdateClosedDate = 'update-closed-date',

    // Miscellaneous Permissions
    CreateClosedDate = 'create-closed-date',
    DeleteObjectives = 'delete-objectives',
    SetMaximumCarryOverLimit = 'set-maximum-carry-over-limit',
    ImportEmployeeAttendanceInformation = 'import-employee-attendance-information',
    UploadLeaveJustification = 'upload-leave-justification',
    DeleteGroupPermission = 'delete-group-permission',
    DeleteAllowedArea = 'delete-allowed-area',
    UpdateLeaveAccrual = 'update-leave-accrual',
    DeleteKeyResults = 'delete-key-results',
    DeleteAttendanceRuleType = 'delete-attendance-rule-type',
    DeleteCarryOverRule = 'delete-carry-over-rule',
    DeleteLeaveAccualPeriod = 'delete-leave-accrual-period',
}