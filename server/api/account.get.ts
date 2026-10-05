export default defineEventHandler(async (event) => {
  const session = await getAccountSession(event);
  return { enabled: !!accountConfig(event).key, account: session?.account ?? null };
});
