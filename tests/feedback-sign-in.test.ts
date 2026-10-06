import { test } from "node:test";
import assert from "node:assert/strict";
import { feedbackReturnPath, feedbackRequestId, gameLoginTarget } from "../server/utils/feedbackSignIn.ts";

const request = "a".repeat(64);

test("Steam sign-in only returns to the feedback sign-in page", () => {
  assert.equal(feedbackReturnPath(`/feedback/sign-in?request=${request}`), `/feedback/sign-in?request=${request}`);
  for (const value of [
    undefined, "", "/account", "https://evil.example/", "//evil.example/feedback/sign-in",
    `/feedback/sign-in?request=${request}&next=https://evil.example`, `/feedback/sign-in?request=${"A".repeat(64)}`,
    `/feedback/sign-in?request=${request.slice(1)}`, ["/feedback/sign-in"],
  ]) assert.equal(feedbackReturnPath(value), null, String(value));
});

test("sign-in request ids are 64 lowercase hex characters", () => {
  assert.equal(feedbackRequestId(request), request);
  for (const value of [undefined, 42, "", "z".repeat(64), request + "0"]) assert.equal(feedbackRequestId(value), null);
});

test("game sign-in links only go to the account page or the feedback site", () => {
  assert.equal(gameLoginTarget("feedback"), "feedback");
  for (const value of ["account", undefined, "", "https://evil.example/", ["feedback"]]) assert.equal(gameLoginTarget(value), "account");
});
