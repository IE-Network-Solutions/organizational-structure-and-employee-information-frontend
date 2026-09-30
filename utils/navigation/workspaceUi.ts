/**
 * Which shell a signed-in person gets.
 *
 * The workspace UI — the Home hub, and every page framed by the profile banner
 * with its section tabs — is built for the `user` role: people using the app
 * for their own work. Every other role (owner, admin, HR, …) keeps the classic
 * console from `develop`: the expandable module sidebar and full page headers.
 *
 * Kept free of imports so the edge middleware can use it too.
 */
export const WORKSPACE_UI_ROLE = 'user';

/** Cookie the login flow sets with the role slug (see the auth store). */
export const ROLE_COOKIE = 'loggedUserRole';

export const usesWorkspaceUi = (roleSlug?: string | null): boolean =>
  (roleSlug ?? '').trim().toLowerCase() === WORKSPACE_UI_ROLE;
