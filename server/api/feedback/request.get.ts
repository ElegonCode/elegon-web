export default defineEventHandler(async (event) => {
  privateAccountResponse(event);
  const request = feedbackRequestId(getQuery(event).request);
  if (!request) return { live: false };
  try {
    await authServiceRequest(event, { path: `/website/oauth/request?request=${request}` });
    // Opened from the game moments ago: the page may continue without a click.
    const config = accountConfig(event);
    const auto = getCookie(event, feedbackAutoContinueCookie(event)) === "1";
    if (auto) deleteCookie(event, feedbackAutoContinueCookie(event), { path: "/", secure: config.secure });
    return { live: true, auto };
  } catch (error: any) {
    if ((error?.statusCode ?? error?.response?.status) === 404) return { live: false };
    authServiceFailure(error);
  }
});
