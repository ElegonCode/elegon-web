import { randomBytes } from "node:crypto";
import { steamLoginUrl } from "../../../utils/steamOpenId";

export default defineEventHandler((event) => {
  privateAccountResponse(event);
  const config = accountConfig(event);
  if (!config.key) return sendRedirect(event, "/account?login=unavailable", 303);
  // Host-only cookies must be set on the same canonical origin as the callback.
  if (getRequestURL(event).origin !== config.origin) {
    return sendRedirect(event, `${config.origin}/auth/steam/start`, 302);
  }
  const state = randomBytes(32).toString("hex");
  setCookie(event, config.stateCookie, state, {
    httpOnly: true, secure: config.secure, sameSite: "lax", path: "/", maxAge: 600,
  });
  const returnTo = `${config.origin}/auth/steam/callback?state=${state}`;
  return sendRedirect(event, steamLoginUrl(returnTo, `${config.origin}/`), 302);
});
