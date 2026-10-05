export default defineEventHandler(async (event) => {
  const session = await getAccountSession(event);
  return { enabled: !!accountConfig(event).key, discord_enabled: discordConnectionAvailable(event), patreon_enabled: patreonConnectionAvailable(event), account: session?.account ?? null };
});
