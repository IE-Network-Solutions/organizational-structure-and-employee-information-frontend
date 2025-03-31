import { useAuthenticationStore } from "@/store/uistate/features/authentication";

export const ORG_AND_EMP_URL = process.env.ORG_AND_EMP_URL;
export const OKR_URL = process.env.OKR_URL;
export const PAYROLL_URL = process.env.PAYROLL_URL;
export const INCENTIVE_URL = process.env.INCENTIVE_URL;

export const OKR_AND_PLANNING_URL =
  process.env.NEXT_PUBLIC_OKR_AND_PLANNING_URL;
export const ORG_DEV_URL = process.env.ORG_DEV_URL;
export const RECRUITMENT_URL = process.env.RECRUITMENT_URL;
export const PUBLIC_DOMAIN = process.env.PUBLIC_DOMAIN;
export const TENANT_BASE_URL = process.env.TENANT_MGMT_URL || 'https://dev.api.tenant.pep.staging.lobsterlab.io';
export const TENANT_MGMT_URL = `${TENANT_BASE_URL}/api/v1`;

export const NOTIFICATION_URL = process.env.NOTIFICATION_URL;
export const APPROVER_URL = process.env.NEXT_PUBLIC_APPROVERS_URL;
export const ORG_DEV = process.env.ORG_DEV;

export const BASE_FRONT_URL = process.env.BASE_FRONT_URL;

export const DATE_FORMAT = 'DD MMM YYYY';
export const DATETIME_FORMAT = 'DD MMM YYYY hh:mm A';
export const TIME_FORMAT = 'hh:mm A';

export const localUserID = process.env.NEXT_PUBLIC_LOCAL_USER_ID ?? '';
export const TIME_AND_ATTENDANCE_URL =
  process.env.NEXT_PUBLIC_TIME_AND_ATTENDANCE_URL;
export const TNA_URL = process.env.NEXT_PUBLIC_TRAIN_AND_LEARNING_URL;
export const EMAIL_URL = process.env.EMAIL_URL;

const tenantId = useAuthenticationStore.getState().tenantId;
export const DEFAULT_TENANT_ID = tenantId || '659b45f7-b10f-44bc-b3cd-1562721a0133';

