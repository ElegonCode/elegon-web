import { verifyDiscordCode } from "../../../utils/discordOAuth";

export default defineEventHandler(async (event) => {
  privateAccountResponse(event);
  const account = accountConfig(event);
  const expected = getCookie(event, discordStateCookie(event));
  deleteCookie(event, discordStateCookie(event), { path: "/", secure: account.secure });
  let callback;
  try { callback = verifiedDiscordCallback(getRequestURL(event).searchParams, expected); }
  catch { return sendRedirect(event, "/account?connection=discord-expired", 303); }
  if (callback.cancelled) return sendRedirect(event, "/account?connection=discord-cancelled", 303);
  try {
    if (!await getAccountSession(event)) return sendRedirect(event, "/account?connection=discord-expired", 303);
    const discord = await verifyDiscordCode(callback.code, discordConnectionConfig(event));
    await authServiceRequest(event, { method: "POST", path: "/website/connections/discord",
      session: getCookie(event, account.sessionCookie), body: { state: callback.state, discord } });
    return sendRedirect(event, "/account?connection=discord-linked", 303);
  } catch (error: any) {
    const code = error.data?.error ?? error.data?.data?.error;
    const result = code === "discord_in_use" ? "discord-in-use" : code === "discord_already_linked" ? "discord-already-linked" : "discord-failed";
    return sendRedirect(event, `/account?connection=${result}`, 303);
  }
});
