export default defineEventHandler(async (event) => {
  privateAccountResponse(event);
  requireAccountOrigin(event);
  const config = accountConfig(event);
  const session = getCookie(event, config.sessionCookie);
  if (session) {
    try { await authServiceRequest(event, { method: "DELETE", session }); }
    catch {
      throw createError({ statusCode: 503, statusMessage: "Sign-out could not be completed. Please try again." });
    }
  }
  deleteCookie(event, config.sessionCookie, { path: "/", secure: config.secure });
  return { ok: true };
});
