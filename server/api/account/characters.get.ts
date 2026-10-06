import { CHARACTER_QUERY, parseAccountCharacters } from "../../utils/accountCharacters";

export default defineEventHandler(async (event) => {
  const session = await getAccountSession(event);
  if (!session) throw createError({ statusCode: 401, statusMessage: "Please sign in" });
  if (session.account.deletion_pending) throw createError({ statusCode: 409, statusMessage: "Account deletion is in progress" });
  const config = useRuntimeConfig(event);
  const realms = [{ name: "EU", url: config.accountEuRealmUrl }, { name: "US", url: config.accountUsRealmUrl }];
  return { realms: await Promise.all(realms.map(async (realm) => {
    try {
      // HTTP SQL has no WebSocket connection lifecycle: no login queue,
      // ownership takeover, logout, or gameplay reducers are invoked here.
      const results = await $fetch<any>(`${realm.url.replace(/\/+$/, "")}/v1/database/${encodeURIComponent(config.accountRealmDatabase)}/sql`, {
        method: "POST", body: CHARACTER_QUERY,
        headers: { Authorization: `Bearer ${session.realm_token}`, "Content-Type": "text/plain" },
        timeout: 10_000, retry: 0,
      });
      return { name: realm.name, available: true, characters: parseAccountCharacters(results), error: null };
    } catch {
      return { name: realm.name, available: false, characters: [], error: "This realm could not be loaded. Please try again." };
    }
  })) };
});
