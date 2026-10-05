import { discordAuthorizationUrl } from "../../../../utils/discordOAuth";

export default defineEventHandler(async (event) => {
  privateAccountResponse(event);
  requireAccountOrigin(event);
  const session = await getAccountSession(event);
  if (!session) throw createError({ statusCode: 401, statusMessage: "Please sign in" });
  const config = discordConnectionConfig(event);
  const account = accountConfig(event);
  const request = await authServiceRequest<{ state: string }>(event, {
    method: "POST", path: "/website/connections/discord/start",
    session: getCookie(event, account.sessionCookie),
  });
  setCookie(event, discordStateCookie(event), request.state, {
    httpOnly: true, secure: account.secure, sameSite: "lax", path: "/", maxAge: 600,
  });
  return { url: discordAuthorizationUrl(config, request.state) };
});
