export default defineEventHandler(async (event) => {
  privateAccountResponse(event);
  const session = await getAccountSession(event);
  if (!session) throw createError({ statusCode: 401, statusMessage: "Please sign in" });
  const linked = session.account.connections.find(connection => connection.provider === "patreon");
  if (!linked) return { support: null };
  const config = useRuntimeConfig(event);
  try {
    const support = await getPatreonSupport({ campaignId: config.patreonCampaignId,
      accessToken: config.patreonAccessToken, userAgent: config.patreonUserAgent }, linked.provider_subject);
    return { support };
  } catch { throw createError({ statusCode: 503, statusMessage: "Your Patreon support details are temporarily unavailable." }); }
});
