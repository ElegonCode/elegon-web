export default defineEventHandler(async (event) => {
  privateAccountResponse(event);
  requireAccountOrigin(event);
  const session = getCookie(event, accountConfig(event).sessionCookie);
  if (!session || !(await getAccountSession(event)))
    throw createError({ statusCode: 401, statusMessage: "Sign in first" });
  try {
    return await authServiceRequest<{ token: string; display_name: string }>(event, {
      path: "/website/toolbox/session",
      method: "POST",
      session,
    });
  } catch (cause) {
    authServiceFailure(cause);
  }
});
