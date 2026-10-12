export type FriendlyOkrError = {
  message: string;
  /** Where the user can fix the problem, when there is a dedicated screen. */
  fixPath?: string;
  fixLabel?: string;
};

const WEIGHTS_PATH = '/okr/settings/objective-type-weights';

const KNOWN_ERRORS: Array<{ match: RegExp; friendly: FriendlyOkrError }> = [
  {
    match: /default objective type weights must be configured/i,
    friendly: {
      message:
        'Type-weighted scoring cannot be turned on yet. Give every active objective type a weight in the tenant default weights, make sure they add up to 100%, and then try again.',
      fixPath: WEIGHTS_PATH,
      fixLabel: 'Set type weights',
    },
  },
  {
    match: /default weights cannot be deleted while type-weighted/i,
    friendly: {
      message:
        'The tenant default weights are needed while Type-weighted scoring is on. Edit them instead of deleting, or switch to Classic average first.',
    },
  },
];

const rawMessage = (error: any): string => {
  const message = error?.response?.data?.message ?? error?.message;
  return Array.isArray(message) ? message.join(', ') : (message ?? '');
};

/**
 * Turns a technical backend error into plain language for the OKR settings
 * screens. Unknown messages are returned unchanged so nothing is hidden.
 */
export const getFriendlyOkrError = (
  error: any,
  fallback = 'Something went wrong. Please try again.',
): FriendlyOkrError => {
  const raw = rawMessage(error);
  const known = KNOWN_ERRORS.find(({ match }) => match.test(raw));
  if (known) return known.friendly;
  return { message: raw || fallback };
};
