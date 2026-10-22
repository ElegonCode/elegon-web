import { expect, test } from "vite-plus/test";
import { steamLoginFailure } from "../server/utils/steamLoginFailure.ts";

test("Steam diagnostics identify the stage without exposing credentials or assertions", () => {
  expect(
    steamLoginFailure("account-session", {
      message: "secret upstream URL, token and response body",
      response: { status: 401 },
    }),
  ).toEqual({ stage: "account-session", status: 401, reason: "Upstream request failed" });
  expect(steamLoginFailure("steam-verification", new Error("Unsigned Steam login field"))).toEqual({
    stage: "steam-verification",
    reason: "Unsigned Steam login field",
  });
  expect(steamLoginFailure("steam-verification", null).reason).toBe("Upstream request failed");
});
