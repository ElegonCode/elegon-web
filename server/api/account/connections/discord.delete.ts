export default defineEventHandler(async (event) => {
  privateAccountResponse(event);
  requireAccountOrigin(event);
  const session = await getAccountSession(event);
  if (!session) throw createError({ statusCode: 401, statusMessage: "Please sign in" });
  const body = await readBody(event);
  if (typeof body?.discord_id !== "string" || !/^\d{17,20}$/.test(body.discord_id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid Discord connection" });
  }
  await authServiceRequest(event, { method: "DELETE", path: "/website/connections/discord",
    session: getCookie(event, accountConfig(event).sessionCookie), body: { discord_id: body.discord_id } });
  return { ok: true };
});
