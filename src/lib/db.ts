import * as fileDb from "./db-file";
import * as postgresDb from "./db-postgres";

/**
 * Database facade.
 *
 * - When process.env.DATABASE_URL is set (i.e. on Vercel) → Postgres
 *   (persistent across deploys/cold starts).
 * - Otherwise → file-based store (local development without a DB).
 *
 * All module exports are the same either way, so callers (API routes) never
 * need to know which backend is active.
 */

const usePostgres = Boolean(process.env.DATABASE_URL);
const impl = usePostgres ? postgresDb : fileDb;

export const findUserById = impl.findUserById;
export const listUsers = impl.listUsers;
export const registerUser = impl.registerUser;
export const validateCredentials = impl.validateCredentials;

export const getGameProgressForUser = impl.getGameProgressForUser;
export const getGameProgress = impl.getGameProgress;
export const saveGameProgress = impl.saveGameProgress;

export const getBlogEngagement = impl.getBlogEngagement;
export const getComments = impl.getComments;
export const toggleCommentLike = impl.toggleCommentLike;
export const toggleLike = impl.toggleLike;
export const addComment = impl.addComment;
export const editComment = impl.editComment;
export const deleteComment = impl.deleteComment;

// Password helpers are backend-agnostic; re-export from the shared module.
export { hashPassword, verifyPassword } from "./password";
