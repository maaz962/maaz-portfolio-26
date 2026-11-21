/**
 * Analytics retention window.
 *
 * Shared by the server (automatic + manual pruning) and the admin UI so the
 * button always says the same number the cleanup actually uses. Keeping it in
 * a dependency-free module lets client components import it safely.
 */
export const TRACKING_RETENTION_DAYS = 60;
