const verificationReasons = new Set([
  "Duplicate login parameter",
  "Unexpected Steam login response",
  "Invalid Steam identity",
  "Unsigned Steam login field",
  "Steam login expired",
  "Steam refused this login",
]);

// Never log the callback URL, assertion, session, credentials, or upstream body.
export function steamLoginFailure(stage: string, error: unknown) {
  const failure = error as {
    message?: string;
    statusCode?: number;
    response?: { status?: number };
  };
  const status = failure?.statusCode ?? failure?.response?.status;
  return {
    stage,
    ...(typeof status === "number" ? { status } : {}),
    reason: verificationReasons.has(failure?.message ?? "")
      ? failure.message
      : "Upstream request failed",
  };
}
