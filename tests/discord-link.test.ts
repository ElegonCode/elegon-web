import { test } from "node:test";
import assert from "node:assert/strict";
import { discordAuthorizationUrl, parseDiscordUser, verifyDiscordCode } from "../server/utils/discordOAuth.ts";
import { verifiedDiscordCallback } from "../server/utils/discordConnection.ts";

const config = { clientId: "123456789012345678", clientSecret: "fixture-client-secret", redirectUri: "https://elegon.app/auth/discord/callback" };
const state = "a".repeat(64);
const user = { id: "234567890123456789", username: "adventurer", global_name: "The Adventurer", avatar: "b".repeat(32), discriminator: "0" };

test("Discord linking requests only identity at the exact configured callback", () => {
  const url = new URL(discordAuthorizationUrl(config, state));
  assert.equal(url.origin, "https://discord.com");
  assert.equal(url.pathname, "/oauth2/authorize");
  assert.equal(url.searchParams.get("scope"), "identify");
  assert.equal(url.searchParams.get("response_type"), "code");
  assert.equal(url.searchParams.get("redirect_uri"), config.redirectUri);
  assert.equal(url.searchParams.get("state"), state);
  assert.equal(url.searchParams.get("prompt"), "consent");
  assert.equal(url.toString().includes(config.clientSecret), false);
});

test("Discord callbacks must match the browser state and reject duplicates", () => {
  assert.deepEqual(verifiedDiscordCallback(new URLSearchParams({ state, code: "code" }), state), { state, code: "code", cancelled: false });
  assert.equal(verifiedDiscordCallback(new URLSearchParams({ state, error: "access_denied" }), state).cancelled, true);
  assert.throws(() => verifiedDiscordCallback(new URLSearchParams({ state, code: "code" }), "b".repeat(64)));
  assert.throws(() => verifiedDiscordCallback(new URLSearchParams({ state }), undefined));
  assert.throws(() => verifiedDiscordCallback(new URLSearchParams(`state=${state}&state=${state}`), state));
  assert.throws(() => verifiedDiscordCallback(new URLSearchParams(`state=${state}&code=a&code=b`), state));
});

test("verified Discord identity comes from the provider and contains no OAuth credentials", async () => {
  const calls: string[] = [];
  const fetcher: typeof fetch = async (url, options) => {
    calls.push(String(url));
    assert.equal(options?.redirect, "error");
    if (url === "https://discord.com/api/oauth2/token") {
      const body = options?.body as URLSearchParams;
      assert.equal(body.get("client_secret"), config.clientSecret);
      assert.equal(body.get("code"), "provider-code");
      assert.equal(body.get("redirect_uri"), config.redirectUri);
      return Response.json({ token_type: "Bearer", access_token: "private-access", refresh_token: "private-refresh", scope: "identify" });
    }
    if (url === "https://discord.com/api/v10/users/@me") {
      assert.equal((options?.headers as Record<string, string>).Authorization, "Bearer private-access");
      return Response.json(user);
    }
    assert.fail("Unexpected Discord endpoint");
  };
  const identity = await verifyDiscordCode("provider-code", config, fetcher);
  assert.deepEqual(identity, { id: user.id, display_name: user.global_name, avatar_url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128` });
  assert.equal(JSON.stringify(identity).includes("private-"), false);
  assert.equal(calls.length, 2);
});

test("Discord refuses failed authorization and invalid users", async () => {
  await assert.rejects(verifyDiscordCode("code", config, async () => new Response(null, { status: 401 })));
  await assert.rejects(verifyDiscordCode("code", config, async () => Response.json({ token_type: "Bearer", access_token: "token", scope: "email" })));
  for (const invalid of [{ ...user, id: "evil" }, { ...user, username: "" }, { ...user, bot: true }]) assert.throws(() => parseDiscordUser(invalid));
  assert.equal(parseDiscordUser({ ...user, avatar: "https://evil.example/avatar" }).avatar_url, "");
  assert.equal(parseDiscordUser({ ...user, global_name: null, discriminator: "1234" }).display_name, "adventurer#1234");
});
