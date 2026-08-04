import { useAuthenticationStore } from '@/store/uistate/features/authentication';

/** Org & employee API. Override in `.env.local` for local backend (see `.env.local.example`). */
export const ORG_AND_EMP_URL = "https://test-api.ienetworks.co/org-emp/api/v1";
export const OKR_URL = process.env.OKR_URL;
export const PAYROLL_URL = process.env.PAYROLL_URL;

export const OKR_AND_PLANNING_URL =
  process.env.NEXT_PUBLIC_OKR_AND_PLANNING_URL;
export const ORG_DEV_URL = process.env.ORG_DEV_URL;
export const RECRUITMENT_URL = process.env.RECRUITMENT_URL;
export const PUBLIC_DOMAIN = process.env.PUBLIC_DOMAIN;

export const TENANT_BASE_URL = process.env.TENANT_BASE_URL;
export const TENANT_MGMT_URL = `${TENANT_BASE_URL}/api/v1`;

// Notification: NOTIFICATION_URL for REST and WebSocket (WS URL = origin). Push: NEXT_PUBLIC_VAPID_PUBLIC_KEY.
export const NOTIFICATION_URL = process.env.NOTIFICATION_URL;
export const NOTIFICATION_WS_URL = NOTIFICATION_URL
  ? new URL(NOTIFICATION_URL).origin
  : '';
export const NOTIFICATION_WS_PATH = '/api/v1/notifications-ws';
export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
export const APPROVER_URL = process.env.NEXT_PUBLIC_APPROVERS_URL;
export const ORG_DEV = process.env.ORG_DEV;

export const BASE_FRONT_URL = process.env.BASE_FRONT_URL;

export const DATE_FORMAT = 'DD MMM YYYY';
export const DATETIME_FORMAT = 'DD MMM YYYY hh:mm A';
export const TIME_FORMAT = 'hh:mm A';

export const localUserID = process.env.NEXT_PUBLIC_LOCAL_USER_ID;
export const TIME_AND_ATTENDANCE_URL =
  process.env.NEXT_PUBLIC_TIME_AND_ATTENDANCE_URL;
export const TNA_URL = process.env.NEXT_PUBLIC_TRAIN_AND_LEARNING_URL;

export const INCENTIVE_URL = process.env.INCENTIVE_URL;
export const EMAIL_URL = process.env.EMAIL_URL;

const tenantId = useAuthenticationStore.getState().tenantId;

export const DEFAULT_TENANT_ID = tenantId;

export const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export const AI_BASE_URL = process.env.NEXT_PUBLIC_AI_BASE_URL;
export const AI_REC_BASE_URL = process.env.NEXT_PUBLIC_AI_REC_BASE_URL;

/**
 * Copilot (direct-to-Azure).
 *
 * Set `NEXT_PUBLIC_AZURE_APP_SERVICE` to the full Copilot endpoint URL, e.g.
 * `https://<app>.azurewebsites.net/copilot`
 */
export const AZURE_APP_SERVICE = process.env.NEXT_PUBLIC_AZURE_APP_SERVICE;
