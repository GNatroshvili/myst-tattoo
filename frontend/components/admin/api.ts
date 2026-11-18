/**
 * The admin panel's line to the backend. Requests go to the site's own /api
 * address (next.config.ts forwards them), so the sign-in cookie comes along.
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    /** short fixed name of the problem, when the backend gives one */
    public code?: string,
    public details?: Record<string, number>
  ) {
    super(message);
  }
}

/** Calls the API and returns what it sent; throws `ApiError` on any failure. */
export async function api<T = void>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, { credentials: "same-origin", ...init });
  } catch {
    throw new ApiError(0, "Network error", "offline");
  }
  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    // no JSON in a failed answer: the backend itself could not be reached
    if (!data) throw new ApiError(res.status, res.statusText, "offline");
    throw new ApiError(res.status, data.message ?? res.statusText, data.code, data.details);
  }
  return data as T;
}

/** Request options for sending JSON. */
export const json = (method: "POST" | "PATCH", body: unknown): RequestInit => ({
  method,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

/** Request options for sending a form (the only way to send a photo). */
export const form = (method: "POST" | "PATCH", body: FormData): RequestInit => ({ method, body });

export const isSignedOut = (err: unknown) => err instanceof ApiError && err.code === "signed_out";

/** The problem in Georgian, for showing to whoever is using the panel. */
export function errorText(err: unknown): string {
  if (!(err instanceof ApiError)) return "დაფიქსირდა შეცდომა. სცადე თავიდან.";
  switch (err.code) {
    case "offline":
      return "სერვერთან დაკავშირება ვერ მოხერხდა. შეამოწმე, გაშვებულია თუ არა ბექენდი.";
    case "wrong_password":
      return "პაროლი არასწორია.";
    case "too_many_attempts":
      return "ძალიან ბევრი მცდელობა. სცადე რამდენიმე წუთში.";
    case "login_not_configured":
      return "შესვლა არ არის გამართული: backend/.env ფაილში შეავსე ADMIN_PASSWORD და SESSION_SECRET.";
    case "signed_out":
      return "სესია ამოიწურა. შედი თავიდან.";
    case "style_in_use":
      return `ამ სტილს ${err.details?.tattoos ?? "რამდენიმე"} ტატუ იყენებს. ჯერ მათ შეუცვალე სტილი.`;
    case "bad_photo":
      return "ფოტო ვერ წავიკითხეთ. გამოიყენე JPEG, PNG, WebP ან AVIF ფორმატი.";
    case "photo_too_large":
      return "ფოტო ძალიან დიდია (მაქსიმუმ 15 MB).";
    case "bad_instagram":
      return "Instagram-ის ბმული არასწორია. ჩაწერე @სახელი ან instagram.com-ის სრული ბმული.";
    default:
      return `შეცდომა: ${err.message}`;
  }
}
