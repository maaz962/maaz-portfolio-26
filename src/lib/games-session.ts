export const GAMES_SESSION_KEY = "mp_games_session";

export function getGamesSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(GAMES_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function setGamesSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(GAMES_SESSION_KEY, "1");
  } catch {}
}

export function clearGamesSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(GAMES_SESSION_KEY);
  } catch {}
}