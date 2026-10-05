export default defineEventHandler(async (event) => {
  const session = await getAccountSession(event);
  return { enabled: !!accountConfig(event).key, discord_enabled: discordConnectionAvailable(event), account: session?.account ?? null };
});
