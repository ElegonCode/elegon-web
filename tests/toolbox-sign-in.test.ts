import { test, expect } from "vite-plus/test";
import { toolboxCallback, toolboxReturnPath } from "../server/utils/toolboxSignIn";
import { feedbackReturnPath } from "../server/utils/feedbackSignIn";

test("Toolbox sign-in only returns to its literal loopback callback", () => {
  const callback = "http://127.0.0.1:43123/callback";
  expect(toolboxCallback(callback)).toBe(callback);
  const path = `/toolbox/sign-in?${new URLSearchParams({ callback, state: "a".repeat(64) })}`;
  expect(toolboxReturnPath(path)).toBe(path);
  expect(feedbackReturnPath(path)).toBe(path);
  for (const value of [
    "https://evil.example/callback",
    "http://localhost:1234/callback",
    "http://127.0.0.1:1234/other",
    "http://127.0.0.1:1234/callback?next=evil",
    "http://evil@127.0.0.1:1234/callback",
    "http://127.0.0.1/callback",
    "http://127.0.0.1:1234/callback#token",
    "file:///callback",
    undefined,
  ])
    expect(toolboxCallback(value), String(value)).toBe(null);
  for (const value of [
    "/toolbox/sign-in",
    path + "#fragment",
    path.replace("a".repeat(64), "bad"),
    "https://evil.example" + path,
  ]) {
    expect(toolboxReturnPath(value)).toBe(null);
  }
});
