import { patreonAuthorizationUrl } from "../../../../utils/patreonOAuth";

export default defineEventHandler(async (event) => {
  privateAccountResponse(event);
  requireAccountOrigin(event);
  const session = await getAccountSession(event);
  if (!session) throw createError({ statusCode: 401, statusMessage: "Please sign in" });
  const config = patreonConnectionConfig(event);
  const account = accountConfig(event);
  const request = await authServiceRequest<{ state: string }>(event, {
    method: "POST", path: "/website/connections/patreon/start",
    session: getCookie(event, account.sessionCookie),
  });
  setCookie(event, patreonStateCookie(event), request.state, {
    httpOnly: true, secure: account.secure, sameSite: "lax", path: "/", maxAge: 600,
  });
  return { url: patreonAuthorizationUrl(config, request.state) };
});
