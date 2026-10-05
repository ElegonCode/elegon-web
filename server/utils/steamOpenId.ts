const STEAM_ENDPOINT = "https://steamcommunity.com/openid/login";
const OPENID_NS = "http://specs.openid.net/auth/2.0";

export function steamLoginUrl(returnTo: string, realm: string) {
  const url = new URL(STEAM_ENDPOINT);
  url.search = new URLSearchParams({
    "openid.ns": OPENID_NS, "openid.mode": "checkid_setup",
    "openid.return_to": returnTo, "openid.realm": realm,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  }).toString();
  return url.toString();
}

export async function verifySteamOpenId(params: URLSearchParams, returnTo: string, fetcher: typeof fetch = fetch, now = Date.now()) {
  // Reject ambiguous duplicate parameters before comparing signed fields.
  for (const key of params.keys()) {
    if (params.getAll(key).length !== 1) throw new Error("Duplicate login parameter");
  }
  const get = (name: string) => params.get(`openid.${name}`) ?? "";
  if (get("ns") !== OPENID_NS || get("mode") !== "id_res" || get("op_endpoint") !== STEAM_ENDPOINT || get("return_to") !== returnTo) {
    throw new Error("Unexpected Steam login response");
  }
  const claimed = get("claimed_id");
  const match = /^https?:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/.exec(claimed);
  if (!match || get("identity") !== claimed) throw new Error("Invalid Steam identity");
  const signed = new Set(get("signed").split(","));
  for (const field of ["op_endpoint", "claimed_id", "identity", "return_to", "response_nonce", "assoc_handle"]) {
    if (!signed.has(field)) throw new Error("Unsigned Steam login field");
  }
  const nonce = get("response_nonce");
  const timestamp = Date.parse(nonce.slice(0, 20));
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z.+$/.test(nonce) || !Number.isFinite(timestamp) || now - timestamp > 300_000 || timestamp - now > 60_000 || nonce.length > 256) {
    throw new Error("Steam login expired");
  }
  const body = new URLSearchParams([...params].filter(([key]) => key.startsWith("openid.")));
  body.set("openid.mode", "check_authentication");
  // Always verify at the fixed Steam endpoint, never one supplied in a callback.
  const response = await fetcher(STEAM_ENDPOINT, {
    method: "POST", body, redirect: "error", signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok || !(await response.text()).split(/\r?\n/).includes("is_valid:true")) {
    throw new Error("Steam refused this login");
  }
  return { steamId: match[1]!, nonce };
}
