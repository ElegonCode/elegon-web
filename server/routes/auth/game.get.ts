// The game opens this with a one-time code to show the website signed in, so
// players are not asked to sign in again. The game keeps its own sign-in; this
// only adds a website session, as signing in with Steam here would.
export default defineEventHandler(async (event) => {
  privateAccountResponse(event);
  const config = accountConfig(event);
  const query = getQuery(event);
  const code = typeof query.code === "string" && /^[a-f0-9]{64}$/.test(query.code) ? query.code : "";
  const target = gameLoginTarget(query.next);
  // Host-only cookies must be set on the canonical origin.
  if (getRequestURL(event).origin !== config.origin) {
    return sendRedirect(event, `${config.origin}/auth/game?code=${code}&next=${target}`, 302);
  }
  const feedbackUrl = `${useRuntimeConfig(event).feedbackSiteUrl.replace(/\/+$/, "")}/?auth=signin`;
  const destination = target === "feedback" ? feedbackUrl : "/account";
  if (!code || !config.key) return sendRedirect(event, target === "feedback" ? feedbackUrl : "/account?login=expired", 303);
  try {
    const result = await authServiceRequest<{ session: string; max_age: number }>(event, {
      method: "POST", path: "/website/session/game", body: { code },
    });
    // Replace and revoke any previous website session, without touching game login.
    const previous = getCookie(event, config.sessionCookie);
    if (previous) await authServiceRequest(event, { method: "DELETE", session: previous }).catch(() => {});
    setCookie(event, config.sessionCookie, result.session, {
      httpOnly: true, secure: config.secure, sameSite: "lax", path: "/", maxAge: result.max_age,
    });
    if (target === "feedback") {
      setCookie(event, feedbackAutoContinueCookie(event), "1", {
        httpOnly: true, secure: config.secure, sameSite: "lax", path: "/", maxAge: 120,
      });
    }
    return sendRedirect(event, destination, 303);
  } catch {
    // An expired or used link still gets the player where they were going;
    // they sign in the usual way there.
    return sendRedirect(event, target === "feedback" ? feedbackUrl : "/account?login=expired", 303);
  }
});
