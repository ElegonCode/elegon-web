import { test } from "node:test";
import assert from "node:assert/strict";
import { verifySteamOpenId, steamLoginUrl } from "../server/utils/steamOpenId.ts";
import { parseAccountCharacters, CHARACTER_QUERY } from "../server/utils/accountCharacters.ts";
import { summarizeAccountRealms, formatAccountDate } from "../app/utils/accountStats.ts";

const returnTo = "https://elegon.app/auth/steam/callback?state=abc";
function assertion() {
  return new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0", "openid.mode": "id_res",
    "openid.op_endpoint": "https://steamcommunity.com/openid/login", "openid.return_to": returnTo,
    "openid.claimed_id": "https://steamcommunity.com/openid/id/76561198000000001",
    "openid.identity": "https://steamcommunity.com/openid/id/76561198000000001",
    "openid.signed": "op_endpoint,claimed_id,identity,return_to,response_nonce,assoc_handle",
    "openid.response_nonce": "2026-10-05T12:00:00Zrandom", "openid.assoc_handle": "steam", "openid.sig": "signature",
  });
}
const now = Date.parse("2026-10-05T12:01:00Z");
const valid: typeof fetch = async (url, options) => {
  assert.equal(url, "https://steamcommunity.com/openid/login");
  assert.equal(options?.method, "POST");
  assert.equal((options?.body as URLSearchParams).get("openid.mode"), "check_authentication");
  return new Response("ns:http://specs.openid.net/auth/2.0\nis_valid:true\n");
};

test("Steam browser login binds its return URL to the website", () => {
  const url = new URL(steamLoginUrl(returnTo, "https://elegon.app/"));
  assert.equal(url.hostname, "steamcommunity.com");
  assert.equal(url.searchParams.get("openid.return_to"), returnTo);
});
test("verified Steam response returns the existing Steam subject", async () => {
  assert.deepEqual(await verifySteamOpenId(assertion(), returnTo, valid, now), { steamId: "76561198000000001", nonce: "2026-10-05T12:00:00Zrandom" });
});
test("tampered, duplicate, unsigned, expired and foreign assertions are rejected before contacting Steam", async () => {
  const badFetch: typeof fetch = async () => { assert.fail("Invalid assertion reached Steam"); };
  for (const mutate of [
    (p: URLSearchParams) => p.set("openid.return_to", "https://evil.example/"),
    (p: URLSearchParams) => p.set("openid.op_endpoint", "https://evil.example/"),
    (p: URLSearchParams) => p.append("openid.identity", "another"),
    (p: URLSearchParams) => p.set("openid.signed", "claimed_id,identity"),
    (p: URLSearchParams) => p.set("openid.response_nonce", "2026-10-04T12:00:00Zrandom"),
    (p: URLSearchParams) => p.set("openid.identity", "https://steamcommunity.com/openid/id/76561198000000002"),
    (p: URLSearchParams) => p.set("openid.claimed_id", "https://steamcommunity.com.evil.example/openid/id/76561198000000001"),
  ]) {
    const params = assertion(); mutate(params);
    await assert.rejects(verifySteamOpenId(params, returnTo, badFetch, now));
  }
});
test("Steam refusal and HTTP failure cannot create a website login", async () => {
  await assert.rejects(verifySteamOpenId(assertion(), returnTo, async () => new Response("is_valid:false"), now));
  await assert.rejects(verifySteamOpenId(assertion(), returnTo, async () => new Response("is_valid:true", { status: 502 }), now));
});
test("roster uses only the account-scoped view and hides deleted characters", () => {
  assert.equal(CHARACTER_QUERY.includes("FROM account_characters"), true);
  const schema = { elements: ["id", "name", "class_selection", "level", "zone_name", "deleted_at", "created_at", "last_played"].map(name => ({ name: { some: name } })) };
  const created = String(BigInt(Date.parse("2025-10-02T12:00:00Z")) * 1000n);
  const played = String(BigInt(Date.parse("2026-10-05T12:00:00Z")) * 1000n);
  assert.deepEqual(parseAccountCharacters([{ schema, rows: [["43", "Talla", 1, 12, "Pinewatch", ["0"], [created], [played]], ["44", "Deleted", 2, 4, "Pinewatch", ["1791200000000000"], ["0"], ["0"]]] }]),
    [{ id: "43", name: "Talla", classSelection: 1, level: 12, zone: "Pinewatch", createdAt: "2025-10-02T12:00:00.000Z", lastPlayed: "2026-10-05T12:00:00.000Z" }]);
  const unknown = parseAccountCharacters([{ schema, rows: [["45", "New", 2, 1, "Pinewatch", ["0"], ["0"], ["0"]]] }])[0]!;
  assert.equal(unknown.createdAt, null);
  assert.equal(unknown.lastPlayed, null);
  assert.deepEqual(parseAccountCharacters([{ schema, rows: [] }]), []);
  assert.throws(() => parseAccountCharacters([{ schema: { elements: [] }, rows: [] }]));
});

test("account stats combine realms and mark incomplete totals", () => {
  const character = { id: "1", name: "Talla", classSelection: 1, level: 12, zone: "Pinewatch", createdAt: "2025-10-02T12:00:00.000Z", lastPlayed: "2026-10-04T12:00:00.000Z" };
  const realms = [{ available: true, characters: [character] }, { available: true, characters: [{ ...character, id: "2", level: 24, createdAt: "2026-01-01T00:00:00.000Z", lastPlayed: "2026-10-05T12:00:00.000Z" }] }];
  assert.deepEqual(summarizeAccountRealms(realms), { characters: 2, highestLevel: 24, realms: 2, firstCharacter: character.createdAt, lastPlayed: "2026-10-05T12:00:00.000Z", partial: false, available: true });
  const partial = summarizeAccountRealms([realms[0]!, { available: false, characters: [] }]);
  assert.equal(partial.partial, true);
  assert.equal(partial.characters, 1);
  const empty = summarizeAccountRealms([{ available: true, characters: [] }]);
  assert.equal(empty.highestLevel, null);
  assert.equal(empty.lastPlayed, null);
  assert.equal(summarizeAccountRealms([{ available: false, characters: [] }]).available, false);
  assert.equal(formatAccountDate(null), "Not recorded");
  assert.equal(formatAccountDate("invalid"), "Not recorded");
  assert.equal(formatAccountDate(character.createdAt), "2 Oct 2025");
});
