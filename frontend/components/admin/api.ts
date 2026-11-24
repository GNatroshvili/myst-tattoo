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
    // the host itself turned the request away for its size, before the backend saw it
    if (res.status === 413) throw new ApiError(413, "Request too large", "photo_too_large");
    // no JSON in a failed answer: the backend itself could not be reached
    if (!data) throw new ApiError(res.status, res.statusText, "offline");
    throw new ApiError(res.status, data.message ?? res.statusText, data.code, data.details);
  }
  return data as T;
}

/** Request options for sending JSON. */
export const json = (method: "POST" | "PATCH" | "PUT", body: unknown): RequestInit => ({
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
    case "zone_in_use":
      return `ამ ზონის ადგილებს ${err.details?.piercings ?? "რამდენიმე"} პირსინგის ფოტო იყენებს. ჯერ ისინი სხვა ადგილზე გადაიტანე ან წაშალე.`;
    case "place_in_use":
      return `ამ ადგილს ${err.details?.piercings ?? "რამდენიმე"} პირსინგის ფოტო იყენებს. ჯერ ისინი სხვა ადგილზე გადაიტანე ან წაშალე.`;
    case "topic_in_use":
      return `ამ თემას ${err.details?.posts ?? "რამდენიმე"} სტატია იყენებს. ჯერ მათ შეუცვალე თემა.`;
    case "title_both_languages":
      return "სათაური ორივე ენაზე შეავსე: ქართულად და ინგლისურად.";
    case "body_missing":
      return "სტატიის ტექსტი ერთ ენაზე მაინც დაწერე.";
    case "bad_topic":
      return "აირჩიე სტატიის თემა.";
    case "photo_required":
      return "ატვირთე სტატიის სურათი.";
    case "course_body_missing":
      return "კურსის ტექსტი ერთ ენაზე მაინც დაწერე.";
    case "course_missing":
      return "ჯერ კურსის სათაური და ტექსტი შეინახე, ფოტოები მერე დაემატება.";
    case "too_many_photos":
      return `კურსს მაქსიმუმ ${err.details?.max ?? 4} ფოტო შეიძლება ჰქონდეს.`;
    case "photo_missing":
      return "აირჩიე ფოტო.";
    case "bad_photos":
      return "კურსის ფოტოები სხვაგან შეიცვალა. გადატვირთე გვერდი და სცადე თავიდან.";
    case "question_both_languages":
      return "კითხვა ორივე ენაზე შეავსე: ქართულად და ინგლისურად.";
    case "answer_missing":
      return "პასუხი ერთ ენაზე მაინც დაწერე.";
    case "about_body_missing":
      return "სექციის ტექსტი ერთ ენაზე მაინც დაწერე.";
    case "about_bad_order":
      return "სექციების სია სხვაგან შეიცვალა. სია განახლდა: სცადე თავიდან.";
    case "privacy_body_missing":
      return "პოლიტიკის ტექსტი ერთ ენაზე მაინც დაწერე.";
    case "bad_order":
      return "კითხვების სია სხვაგან შეიცვალა. სია განახლდა: სცადე თავიდან.";
    case "db_down":
      return "ბაზასთან დაკავშირება ვერ მოხერხდა. შეამოწმე MONGODB_URI და სცადე თავიდან.";
    case "storage_not_configured":
      return "ფოტოების საცავი არ არის გამართული: Vercel-ში ბექენდის პროექტს მიუერთე Blob store.";
    case "storage_failed":
      return `ფოტოების საცავმა ფაილი არ მიიღო. შეამოწმე, რომ Blob store საჯაროა (public) და პროექტს მიერთებულია. (${err.message})`;
    case "bad_photo":
      return "ფოტო ვერ წავიკითხეთ. გამოიყენე JPEG, PNG, WebP ან AVIF ფორმატი.";
    case "photo_too_large":
      return "ფოტო ძალიან დიდია. სცადე უფრო პატარა ფაილი.";
    case "both_languages":
      return "სახელი ორივე ენაზე შეავსე: ქართულად და ინგლისურად.";
    case "bad_instagram":
      return "Instagram-ის ბმული არასწორია. ჩაწერე @სახელი ან instagram.com-ის სრული ბმული.";
    default:
      return `შეცდომა: ${err.message}`;
  }
}
