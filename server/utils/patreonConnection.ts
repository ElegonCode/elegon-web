import type { H3Event } from "h3";
import type { PatreonOAuthConfig } from "./patreonOAuth";

export function patreonConnectionAvailable(event: H3Event) {
  const config = useRuntimeConfig(event);
  return !!config.patreonClientId && !!config.patreonClientSecret;
}
export function patreonConnectionConfig(event: H3Event): PatreonOAuthConfig {
  if (!patreonConnectionAvailable(event)) throw createError({ statusCode: 503, statusMessage: "Patreon connections are not configured yet" });
  const config = useRuntimeConfig(event);
  return { clientId: config.patreonClientId, clientSecret: config.patreonClientSecret,
    redirectUri: `${accountConfig(event).origin}/auth/patreon/callback` };
}
export function patreonStateCookie(event: H3Event) {
  return accountConfig(event).secure ? "__Host-elegon_patreon_state" : "elegon_patreon_state_dev";
}
