/**
 * The backend's address, from the API_URL setting, as scheme and host only:
 * "https://myst-api.example.com".
 *
 * Whatever else was typed is dropped: a slash at the end, a path, spaces. A
 * leftover slash would turn every forwarded address into "//api/…", which the
 * backend's host answers with a redirect that sends the browser in circles.
 * A missing "https://" is added. Nothing set means the local backend.
 *
 * Used by next.config.ts too, so it must not import anything from the app.
 */
export function apiOrigin(value: string | undefined = process.env.API_URL): string {
  const raw = (value ?? "").trim();
  if (!raw) return "http://localhost:5000";
  try {
    return new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`).origin;
  } catch {
    throw new Error(`API_URL is not a valid address: "${raw}". Expected something like https://myst-api.example.com`);
  }
}
