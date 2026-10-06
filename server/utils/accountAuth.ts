import type { H3Event } from "h3";

export type AccountInfo = {
  id: string; steam_id: string; display_name: string; avatar_url: string;
  linked_methods: string[]; game_identity: string; has_legacy_link: boolean;
  created_at: string; signed_in_at: string; deletion_pending: boolean;
  connections: { provider: string; provider_subject: string; display_name: string; avatar_url: string; linked_at: string }[];
};
export type AuthServicePath = "/website/email" | "/website/email/start" | "/website/email/verify" | `/website/oauth/request?request=${string}` | "/website/oauth/approve" | "/website/oauth/deny" | "/website/account/username" | "/website/account/delete" | "/website/account/delete/realm" | "/website/session" | "/website/connections/discord" | "/website/connections/discord/start" | "/website/connections/patreon" | "/website/connections/patreon/start";
export type AccountSession = { account: AccountInfo; realm_token: string };

export function accountConfig(event: H3Event) {
  const config = useRuntimeConfig(event);
  const origin = new URL(config.accountSiteOrigin).origin;
  const secure = origin.startsWith("https://");
  if (!secure && (process.env.NODE_ENV === "production" || new URL(origin).hostname !== "localhost")) {
    throw createError({ statusCode: 503, statusMessage: "Account login requires HTTPS" });
  }
  return {
    origin, secure, key: config.authWebsiteApiKey,
    serviceUrl: config.authServiceUrl.replace(/\/+$/, ""),
    sessionCookie: secure ? "__Host-elegon_account" : "elegon_account_dev",
    stateCookie: secure ? "__Host-elegon_login" : "elegon_login_dev",
  };
}

export function privateAccountResponse(event: H3Event) {
  setResponseHeader(event, "Cache-Control", "private, no-store");
  setResponseHeader(event, "Vary", "Cookie");
  setResponseHeader(event, "Referrer-Policy", "no-referrer");
}

export function requireAccountOrigin(event: H3Event) {
  if (getRequestHeader(event, "origin") !== accountConfig(event).origin) {
    throw createError({ statusCode: 403, statusMessage: "Invalid request origin" });
  }
}

export async function authServiceRequest<T>(event: H3Event, options: { method?: "GET" | "POST" | "DELETE"; body?: unknown; session?: string; path?: AuthServicePath } = {}) {
  const config = accountConfig(event);
  if (!config.key) throw createError({ statusCode: 503, statusMessage: "Account sign-in is not configured yet" });
  return $fetch<T>(`${config.serviceUrl}${options.path ?? "/website/session"}`, {
    method: options.method ?? "GET", body: options.body,
    headers: { Authorization: `Bearer ${config.key}`, ...(options.session ? { "x-website-session": options.session } : {}) },
    timeout: 15_000, retry: 0,
  });
}

export async function getAccountSession(event: H3Event) {
  privateAccountResponse(event);
  const config = accountConfig(event);
  const session = getCookie(event, config.sessionCookie);
  if (!session || !/^[a-f0-9]{64}$/.test(session)) return null;
  try { return await authServiceRequest<AccountSession>(event, { session }); }
  catch (error: any) {
    if (error.statusCode === 401 || error.response?.status === 401) {
      deleteCookie(event, config.sessionCookie, { path: "/", secure: config.secure });
      return null;
    }
    throw createError({ statusCode: 503, statusMessage: "Your account could not be loaded. Please try again." });
  }
}
