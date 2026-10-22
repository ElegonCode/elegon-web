import { expect, test } from "vite-plus/test";
import { verifySteamOpenId } from "../server/utils/steamOpenId.ts";

const returnTo = "https://elegon.app/auth/steam/callback?state=test";
const now = Date.parse("2026-10-22T16:00:30Z");
function assertion() {
  return new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "id_res",
    "openid.op_endpoint": "https://steamcommunity.com/openid/login",
    "openid.return_to": returnTo,
    "openid.claimed_id": "https://steamcommunity.com/openid/id/76561198000000001",
    "openid.identity": "https://steamcommunity.com/openid/id/76561198000000001",
    "openid.signed": "op_endpoint,claimed_id,identity,return_to,response_nonce,assoc_handle",
    "openid.response_nonce": "2026-10-22T16:00:00Zrandom",
    "openid.assoc_handle": "steam",
    "openid.sig": "signature",
  });
}

test("Steam verification works with Workers redirect modes and still refuses redirects", async () => {
  const workerFetch =
    (status: number): typeof fetch =>
    async (_url, options) => {
      // Match workerd: error mode throws before sending the request.
      if (options?.redirect === "error") throw new TypeError("Invalid redirect value");
      expect(options?.redirect).toBe("manual");
      return new Response("is_valid:true\n", {
        status,
        ...(status === 302 ? { headers: { Location: "https://evil.example/" } } : {}),
      });
    };
  await expect(
    verifySteamOpenId(assertion(), returnTo, workerFetch(200), now),
  ).resolves.toMatchObject({
    steamId: "76561198000000001",
  });
  await expect(
    verifySteamOpenId(assertion(), returnTo, workerFetch(302), now),
  ).rejects.toMatchObject({
    message: "Steam refused this login",
    statusCode: 302,
  });
});
