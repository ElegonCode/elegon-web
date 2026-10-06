import { randomBytes } from "node:crypto";
import { steamLoginUrl } from "../../../utils/steamOpenId";

export default defineEventHandler((event) => {
  privateAccountResponse(event);
  const config = accountConfig(event);
  if (!config.key) return sendRedirect(event, "/account?login=unavailable", 303);
  // Host-only cookies must be set on the same canonical origin as the callback.
  const returnPath = feedbackReturnPath(getQuery(event).return);
  if (getRequestURL(event).origin !== config.origin) {
    const query = returnPath ? `?return=${encodeURIComponent(returnPath)}` : "";
    return sendRedirect(event, `${config.origin}/auth/steam/start${query}`, 302);
  }
  // Only the feedback sign-in page may be returned to; anything else lands on /account.
  if (returnPath) {
    setCookie(event, feedbackReturnCookie(event), returnPath, {
      httpOnly: true, secure: config.secure, sameSite: "lax", path: "/", maxAge: 600,
    });
  } else {
    deleteCookie(event, feedbackReturnCookie(event), { path: "/", secure: config.secure });
  }
  const state = randomBytes(32).toString("hex");
  setCookie(event, config.stateCookie, state, {
    httpOnly: true, secure: config.secure, sameSite: "lax", path: "/", maxAge: 600,
  });
  const returnTo = `${config.origin}/auth/steam/callback?state=${state}`;
  return sendRedirect(event, steamLoginUrl(returnTo, `${config.origin}/`), 302);
});
