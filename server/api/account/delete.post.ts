export default defineEventHandler(async (event) => {
  privateAccountResponse(event);
  requireAccountOrigin(event);
  const current = await getAccountSession(event);
  if (!current) throw createError({ statusCode: 401, statusMessage: "Please sign in" });
  const body = await readBody(event);
  if (body?.confirmation !== "DELETE" || body?.account_id !== current.account.id) throw createError({ statusCode: 400, statusMessage: "Confirm the account you want to delete" });
  const cookies = accountConfig(event);
  const session = getCookie(event, cookies.sessionCookie)!;
  const config = useRuntimeConfig(event);
  try {
    const deletion = await authServiceRequest<{ job: { deletion_id: string; eu_done: boolean; us_done: boolean }; realm_token: string }>(event, {
      path: "/website/account/delete", method: "POST", session, body: { account_id: current.account.id, confirmation: "DELETE" },
    });
    for (const realm of [{ name: "EU", url: config.accountEuRealmUrl, done: deletion.job.eu_done }, { name: "US", url: config.accountUsRealmUrl, done: deletion.job.us_done }]) {
      if (realm.done) continue;
      await $fetch(`${realm.url.replace(/\/+$/, "")}/v1/database/${encodeURIComponent(config.accountRealmDatabase)}/call/delete_elegon_account`, {
        method: "POST", body: ["DELETE"], headers: { Authorization: `Bearer ${deletion.realm_token}` }, timeout: 30_000, retry: 0,
      });
      await authServiceRequest(event, { path: "/website/account/delete/realm", method: "POST", session, body: { deletion_id: deletion.job.deletion_id, realm: realm.name } });
    }
    await authServiceRequest(event, { path: "/website/account/delete", method: "DELETE", session, body: { deletion_id: deletion.job.deletion_id } });
  } catch {
    throw createError({ statusCode: 503, statusMessage: "Deletion could not finish. Your account is locked while cleanup is in progress. Please resume deletion here to finish." });
  }
  deleteCookie(event, cookies.sessionCookie, { path: "/", secure: cookies.secure });
  deleteCookie(event, cookies.stateCookie, { path: "/", secure: cookies.secure });
  deleteCookie(event, discordStateCookie(event), { path: "/", secure: cookies.secure });
  deleteCookie(event, patreonStateCookie(event), { path: "/", secure: cookies.secure });
  return { ok: true };
});
