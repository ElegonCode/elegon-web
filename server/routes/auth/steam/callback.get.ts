import { timingSafeEqual } from "node:crypto";
import { verifySteamOpenId } from "../../../utils/steamOpenId";

export default defineEventHandler(async (event) => {
  privateAccountResponse(event);
  const config = accountConfig(event);
  const params = getRequestURL(event).searchParams;
  const state = params.get("state") ?? "";
  const expected = getCookie(event, config.stateCookie) ?? "";
  deleteCookie(event, config.stateCookie, { path: "/", secure: config.secure });
  if (!/^[a-f0-9]{64}$/.test(state) || !/^[a-f0-9]{64}$/.test(expected) || !timingSafeEqual(Buffer.from(state), Buffer.from(expected))) {
    return sendRedirect(event, "/account?login=expired", 303);
  }
  try {
    const { steamId, nonce } = await verifySteamOpenId(params, `${config.origin}/auth/steam/callback?state=${state}`);
    const result = await authServiceRequest<{ session: string; max_age: number }>(event, {
      method: "POST", body: { steam_id: steamId, nonce },
    });
    // Replace and revoke any previous website session, without touching game login.
    const previous = getCookie(event, config.sessionCookie);
    if (previous) await authServiceRequest(event, { method: "DELETE", session: previous }).catch(() => {});
    setCookie(event, config.sessionCookie, result.session, {
      httpOnly: true, secure: config.secure, sameSite: "lax", path: "/", maxAge: result.max_age,
    });
    return sendRedirect(event, "/account", 303);
  } catch {
    return sendRedirect(event, "/account?login=failed", 303);
  }
});
