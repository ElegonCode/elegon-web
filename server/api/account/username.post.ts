export default defineEventHandler(async (event) => {
  privateAccountResponse(event);
  requireAccountOrigin(event);
  const session = await getAccountSession(event);
  if (!session) throw createError({ statusCode: 401, statusMessage: "Please sign in" });
  const body = await readBody(event);
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  if ([...username].length < 2 || [...username].length > 32 || !/^[\p{L}\p{N} ._-]+$/u.test(username)) throw createError({ statusCode: 400, statusMessage: "Use 2–32 letters, numbers, spaces, dots, underscores or hyphens" });
  if (session.account.deletion_pending) throw createError({ statusCode: 409, statusMessage: "Account deletion is in progress" });
  await authServiceRequest(event, { path: "/website/account/username", method: "POST", session: getCookie(event, accountConfig(event).sessionCookie), body: { username } });
  return { ok: true };
});
