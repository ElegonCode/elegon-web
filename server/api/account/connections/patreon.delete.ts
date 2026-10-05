export default defineEventHandler(async (event) => {
  privateAccountResponse(event);
  requireAccountOrigin(event);
  const session = await getAccountSession(event);
  if (!session) throw createError({ statusCode: 401, statusMessage: "Please sign in" });
  const body = await readBody(event);
  if (typeof body?.patreon_id !== "string" || !/^\d{1,32}$/.test(body.patreon_id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid Patreon connection" });
  }
  await authServiceRequest(event, { method: "DELETE", path: "/website/connections/patreon",
    session: getCookie(event, accountConfig(event).sessionCookie), body: { patreon_id: body.patreon_id } });
  return { ok: true };
});
