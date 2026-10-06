import type { PatreonSupport } from "../../utils/patreonSupport";

// The game's account panel on character select. The game sends its own sign-in
// token; the auth service checks it and names the account.
export default defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "private, no-store");
  const token = (getRequestHeader(event, "authorization") ?? "").replace(/^Bearer /, "");
  if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token) || token.length > 8192) {
    throw createError({ statusCode: 401, statusMessage: "Please sign in again." });
  }
  let account: { account_id: string; display_name: string; patreon_id: string | null };
  try {
    account = await authServiceRequest(event, { path: "/website/game-account", gameToken: token });
  } catch (error: any) {
    const status = error?.statusCode ?? error?.response?.status;
    if (status === 401) throw createError({ statusCode: 401, statusMessage: "Please sign in again." });
    throw createError({ statusCode: 503, statusMessage: "Your account could not be loaded right now." });
  }
  let patreon: PatreonSupport | null = null;
  if (account.patreon_id) {
    const config = useRuntimeConfig(event);
    // Support details are a decoration; Patreon being down must not hide the panel.
    patreon = await getPatreonSupport({ campaignId: config.patreonCampaignId,
      accessToken: config.patreonAccessToken, userAgent: config.patreonUserAgent }, account.patreon_id).catch(() => null);
  }
  return {
    display_name: account.display_name,
    account_url: `${accountConfig(event).origin}/account`,
    patreon_linked: !!account.patreon_id,
    patreon: patreon && { status: patreon.status, tiers: patreon.tiers, since: patreon.since },
  };
});
