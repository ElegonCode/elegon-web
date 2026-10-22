import { afterEach, expect, test, vi } from "vite-plus/test";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

test("supporters use request configuration and match numeric runtime tier IDs to Patreon strings", async () => {
  const event = { context: {} };
  const config = {
    patreonAccessToken: "fixture-token",
    patreonCampaignId: 123,
    patreonTier1Id: 10,
    patreonTier1Label: "Legendary Supporters",
    patreonTier2Id: 20,
    patreonTier2Label: "Epic Supporters",
    patreonTier3Id: 30,
    patreonTier3Label: "Rare Supporters",
  };
  vi.stubGlobal("useRuntimeConfig", (request: unknown) => (request === event ? config : {}));
  vi.stubGlobal("defineCachedEventHandler", (handler: unknown) => handler);
  vi.stubGlobal(
    "createError",
    (error: { statusMessage: string }) => new Error(error.statusMessage),
  );
  vi.stubGlobal("$fetch", async (url: string, options: { headers: { Authorization: string } }) => {
    expect(url).toMatch(/campaigns\/123\/members/);
    expect(options.headers.Authorization).toBe("Bearer fixture-token");
    return {
      data: [
        {
          id: "1",
          type: "member",
          attributes: { full_name: "Test Supporter", patron_status: "active_patron" },
          relationships: { currently_entitled_tiers: { data: [{ id: "10", type: "tier" }] } },
        },
        {
          id: "2",
          type: "member",
          attributes: { full_name: "Former Supporter", patron_status: "former_patron" },
          relationships: { currently_entitled_tiers: { data: [{ id: "10", type: "tier" }] } },
        },
      ],
    };
  });

  const { default: handler } = await import("../server/api/patreon-members.get.ts");
  const result = await handler(event as Parameters<typeof handler>[0]);

  expect(result.tiers[0]?.id).toBe("10");
  expect(result.tiers[0]?.members).toEqual(["Test Supporter"]);
  expect(result.tiers[0]?.memberCount).toBe(1);
  expect(result.tiers[1]?.memberCount).toBe(0);
  expect(result.tiers[2]?.memberCount).toBe(0);
});
