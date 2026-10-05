import { verifiedDiscordCallback } from "../../../utils/discordConnection";
import { verifyPatreonCode } from "../../../utils/patreonOAuth";

export default defineEventHandler(async (event) => {
  privateAccountResponse(event);
  const account = accountConfig(event);
  const expected = getCookie(event, patreonStateCookie(event));
  deleteCookie(event, patreonStateCookie(event), { path: "/", secure: account.secure });
  let callback;
  try { callback = verifiedDiscordCallback(getRequestURL(event).searchParams, expected); }
  catch { return sendRedirect(event, "/account?connection=patreon-expired", 303); }
  if (callback.cancelled) return sendRedirect(event, "/account?connection=patreon-cancelled", 303);
  try {
    if (!await getAccountSession(event)) return sendRedirect(event, "/account?connection=patreon-expired", 303);
    const patreon = await verifyPatreonCode(callback.code, patreonConnectionConfig(event));
    await authServiceRequest(event, { method: "POST", path: "/website/connections/patreon",
      session: getCookie(event, account.sessionCookie), body: { state: callback.state, patreon } });
    return sendRedirect(event, "/account?connection=patreon-linked", 303);
  } catch (error: any) {
    const code = error.data?.error ?? error.data?.data?.error;
    const result = code === "patreon_in_use" ? "patreon-in-use" : code === "discord_already_linked" ? "patreon-already-linked" : "patreon-failed";
    return sendRedirect(event, `/account?connection=${result}`, 303);
  }
});
