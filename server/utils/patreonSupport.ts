import { createHash } from "node:crypto";

export type PatreonSupport = { status: "active" | "declined" | "former" | "free" | "none";
  tiers: string[]; since: string | null; checked_at: string };
type CreatorConfig = { campaignId: string; accessToken: string; userAgent: string };
type Snapshot = { members: Map<string, PatreonSupport>; checkedAt: string };
let cache: { key: string; expires: number; value: Promise<Snapshot> } | undefined;

export function parsePatreonMembers(response: any, campaignId: string, checkedAt: string) {
  if (!Array.isArray(response?.data) || !response.data.every((item: any) => item?.type === "member")) throw new Error("Invalid Patreon members");
  const tiers = new Map<string, string>();
  for (const tier of response.included ?? []) {
    if (tier?.type === "tier" && typeof tier.attributes?.title === "string") tiers.set(tier.id, tier.attributes.title.slice(0, 128));
  }
  const members = new Map<string, PatreonSupport>();
  for (const member of response.data) {
    const related = member.relationships;
    if (related?.campaign?.data?.id !== campaignId || related?.campaign?.data?.type !== "campaign") throw new Error("Unexpected Patreon campaign");
    const user = related?.user?.data;
    if (user?.type !== "user" || !/^\d{1,32}$/.test(user.id ?? "")) throw new Error("Missing Patreon member identity");
    const attrs = member.attributes ?? {};
    const rawStatus = attrs.patron_status;
    if (![null, "active_patron", "declined_patron", "former_patron"].includes(rawStatus)) throw new Error("Unknown Patreon member status");
    const status = rawStatus === "active_patron" ? "active" : rawStatus === "declined_patron" ? "declined"
      : rawStatus === "former_patron" ? "former" : "free";
    const date = typeof attrs.pledge_relationship_start === "string" && /^\d{4}-\d\d-\d\dT/.test(attrs.pledge_relationship_start)
      ? Date.parse(attrs.pledge_relationship_start) : NaN;
    const entitled = related.currently_entitled_tiers?.data;
    if (!Array.isArray(entitled)) throw new Error("Missing Patreon tier relationship");
    const titles = entitled.map((tier: any) => {
      if (tier.type !== "tier" || !tiers.has(tier.id)) throw new Error("Missing Patreon tier");
      return tiers.get(tier.id)!;
    });
    members.set(user.id, { status, tiers: [...new Set(titles)],
      since: status === "active" && Number.isFinite(date) && date <= Date.parse(checkedAt) ? new Date(date).toISOString() : null,
      checked_at: checkedAt });
  }
  return members;
}

export async function fetchPatreonMembers(config: CreatorConfig, fetcher: typeof fetch = fetch): Promise<Snapshot> {
  if (!/^\d{1,32}$/.test(config.campaignId) || !config.accessToken) throw new Error("Patreon creator access unavailable");
  const checkedAt = new Date().toISOString();
  const members = new Map<string, PatreonSupport>();
  let cursor: string | undefined;
  const seen = new Set<string>();
  for (let page = 0; page < 100; page++) {
    const url = new URL(`https://www.patreon.com/api/oauth2/v2/campaigns/${config.campaignId}/members`);
    url.search = new URLSearchParams({ include: "user,currently_entitled_tiers,campaign", "fields[member]": "patron_status,pledge_relationship_start",
      "fields[tier]": "title", "page[count]": "100" }).toString();
    if (cursor) url.searchParams.set("page[cursor]", cursor);
    const response = await fetcher(url, { redirect: "error", signal: AbortSignal.timeout(10_000),
      headers: { Authorization: `Bearer ${config.accessToken}`, "User-Agent": config.userAgent || "Elegon Website" } });
    if (!response.ok) throw new Error("Patreon creator API unavailable");
    const data = await response.json();
    for (const [id, support] of parsePatreonMembers(data, config.campaignId, checkedAt)) members.set(id, support);
    cursor = data.meta?.pagination?.cursors?.next;
    if (!cursor) return { members, checkedAt };
    if (typeof cursor !== "string" || seen.has(cursor)) throw new Error("Invalid Patreon pagination");
    seen.add(cursor);
  }
  throw new Error("Patreon member page limit reached");
}

export async function getPatreonSupport(config: CreatorConfig, userId: string): Promise<PatreonSupport> {
  const key = createHash("sha256").update(`${config.campaignId}:${config.accessToken}`).digest("hex");
  if (!cache || cache.key !== key || cache.expires <= Date.now()) {
    const entry = { key, expires: Date.now() + 300_000, value: fetchPatreonMembers(config) };
    cache = entry;
    entry.value.catch(() => { if (cache === entry) cache = undefined; });
  }
  const snapshot = await cache.value;
  return snapshot.members.get(userId) ?? { status: "none", tiers: [], since: null, checked_at: snapshot.checkedAt };
}
