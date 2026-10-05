import { test } from "node:test";
import assert from "node:assert/strict";
import { patreonAuthorizationUrl, parsePatreonUser, verifyPatreonCode } from "../server/utils/patreonOAuth.ts";
import { fetchPatreonMembers, parsePatreonMembers } from "../server/utils/patreonSupport.ts";
import { patreonSupportDuration } from "../app/utils/patreonStats.ts";

const config = { clientId: "fixture-client", clientSecret: "fixture-secret", redirectUri: "https://elegon.app/auth/patreon/callback" };
const user = { data: { type: "user", id: "12345", attributes: { full_name: "Adventurer", image_url: "https://c10.patreonusercontent.com/avatar.png" } } };
const member = { type: "member", id: "member-id", attributes: { patron_status: "active_patron", pledge_relationship_start: "2026-05-14T12:00:00Z", lifetime_support_cents: 99999 }, relationships: { campaign: { data: { type: "campaign", id: "42" } }, user: { data: { type: "user", id: "12345" } }, currently_entitled_tiers: { data: [{ type: "tier", id: "7" }] } } };
const payload = { data: [member], included: [{ type: "tier", id: "7", attributes: { title: "Legendary Supporter" } }] };
const now = "2026-10-06T12:00:00Z";

test("Patreon authorization requests only profile identity with exact callback and private code exchange", async () => {
  const url = new URL(patreonAuthorizationUrl(config, "a".repeat(64)));
  assert.equal(url.origin, "https://www.patreon.com");
  assert.equal(url.searchParams.get("scope"), "identity");
  assert.equal(url.searchParams.get("redirect_uri"), config.redirectUri);
  assert.equal(url.toString().includes(config.clientSecret), false);
  let calls = 0;
  const identity = await verifyPatreonCode("code", config, async (input, options) => {
    calls++;
    assert.equal(options?.redirect, "error");
    if (String(input).endsWith("/token")) {
      assert.equal((options?.body as URLSearchParams).get("client_secret"), config.clientSecret);
      assert.equal((options?.body as URLSearchParams).get("redirect_uri"), config.redirectUri);
      return Response.json({ token_type: "Bearer", access_token: "private-token", refresh_token: "private-refresh" });
    }
    const identityUrl = new URL(String(input));
    assert.equal(identityUrl.pathname, "/api/oauth2/v2/identity");
    assert.equal(identityUrl.searchParams.get("fields[user]"), "full_name,image_url");
    assert.equal((options?.headers as any).Authorization, "Bearer private-token");
    return Response.json(user);
  });
  assert.equal(calls, 2);
  assert.deepEqual(identity, { id: "12345", display_name: "Adventurer", avatar_url: user.data.attributes.image_url });
  assert.equal(JSON.stringify(identity).includes("private-"), false);
});
test("Patreon profile rejects invalid identity, provider failure and foreign avatar hosts", async () => {
  assert.throws(() => parsePatreonUser({ data: { ...user.data, id: "invalid" } }));
  assert.throws(() => parsePatreonUser({ data: { ...user.data, type: "member" } }));
  assert.equal(parsePatreonUser({ data: { ...user.data, attributes: { image_url: "https://evil.example/avatar" } } }).avatar_url, "");
  await assert.rejects(verifyPatreonCode("code", config, async () => new Response(null, { status: 401 })));
});
test("Support summary includes only Elegon membership and omits monetary and private fields", () => {
  const summary = parsePatreonMembers(payload, "42", now).get("12345");
  assert.deepEqual(summary, { status: "active", tiers: ["Legendary Supporter"], since: "2026-05-14T12:00:00.000Z", checked_at: now });
  assert.equal(JSON.stringify(summary).includes("99999"), false);
  assert.throws(() => parsePatreonMembers(payload, "other-campaign", now));
  assert.throws(() => parsePatreonMembers({ data: [{ ...member, attributes: {} }] }, "42", now));
  assert.throws(() => parsePatreonMembers({ ...payload, included: [] }, "42", now));
  assert.equal(parsePatreonMembers({ ...payload, data: [{ ...member, attributes: { patron_status: "former_patron" } }] }, "42", now).get("12345")?.since, null);
  assert.equal(parsePatreonMembers({ ...payload, data: [{ ...member, attributes: { patron_status: null } }] }, "42", now).get("12345")?.status, "free");
});
test("Creator membership fetch paginates fixed campaign URLs and rejects failed or looping responses", async () => {
  let calls = 0;
  const creator = { campaignId: "42", accessToken: "creator-secret", userAgent: "Elegon" };
  const snapshot = await fetchPatreonMembers(creator, async (input, options) => {
    const url = new URL(String(input));
    assert.equal(url.origin, "https://www.patreon.com");
    assert.equal(url.pathname, "/api/oauth2/v2/campaigns/42/members");
    assert.equal(url.searchParams.get("fields[member]"), "patron_status,pledge_relationship_start");
    assert.equal((options?.headers as any).Authorization, "Bearer creator-secret");
    assert.equal(options?.redirect, "error");
    calls++;
    return Response.json(calls === 1 ? { ...payload, meta: { pagination: { cursors: { next: "next" } } } } : { data: [] });
  });
  assert.equal(calls, 2);
  assert.equal(snapshot.members.size, 1);
  await assert.rejects(fetchPatreonMembers(creator, async () => new Response(null, { status: 401 })));
  await assert.rejects(fetchPatreonMembers(creator, async () => Response.json({ ...payload, meta: { pagination: { cursors: { next: "repeated" } } } })));
});
test("Support duration counts elapsed calendar months without claiming payments", () => {
  assert.equal(patreonSupportDuration("2026-05-14T12:00:00Z", new Date(now)), "4 months in this support period");
  assert.equal(patreonSupportDuration("2026-09-20T12:00:00Z", new Date(now)), "Less than 1 month in this support period");
  assert.equal(patreonSupportDuration("2026-09-01T12:00:00Z", new Date(now)), "1 month in this support period");
  assert.equal(patreonSupportDuration("invalid"), "");
  assert.equal(patreonSupportDuration("2099-01-01T12:00:00Z"), "");
});
