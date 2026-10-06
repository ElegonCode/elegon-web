import type { H3Event } from "h3";
import type { AuthServicePath } from "./accountAuth";

/** The only place a Steam sign-in may return to besides the account page. */
export function feedbackReturnPath(value: unknown) {
  return typeof value === "string" && /^\/feedback\/sign-in\?request=[a-f0-9]{64}$/.test(value) ? value : null;
}

export function feedbackRequestId(value: unknown) {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value) ? value : null;
}

/** Set when the game opens the feedback site, so the sign-in page continues by itself. */
export function feedbackAutoContinueCookie(event: H3Event) {
  return accountConfig(event).secure ? "__Host-elegon_feedback_auto" : "elegon_feedback_auto_dev";
}

/** Where a game sign-in link may go next; anything else goes to the account page. */
export function gameLoginTarget(value: unknown) {
  return value === "feedback" ? "feedback" : "account";
}

export function feedbackReturnCookie(event: H3Event) {
  return accountConfig(event).secure ? "__Host-elegon_return" : "elegon_return_dev";
}

/** Passes the auth service's error code and player-facing message through. */
export function authServiceFailure(error: any): never {
  const status = error?.statusCode ?? error?.response?.status;
  const data = error?.data;
  if (typeof status === "number" && status < 500 && typeof data?.error === "string") {
    throw createError({ statusCode: status, statusMessage: typeof data.message === "string" ? data.message : "Request failed", data: { error: data.error } });
  }
  throw createError({ statusCode: 503, statusMessage: "Please try again in a moment." });
}

export async function feedbackRequest<T>(event: H3Event, path: AuthServicePath, options: { method?: "GET" | "POST"; body?: unknown } = {}): Promise<T> {
  try {
    return await authServiceRequest<T>(event, { ...options, path, session: getCookie(event, accountConfig(event).sessionCookie) });
  } catch (error) { authServiceFailure(error); }
}
