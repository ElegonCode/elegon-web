export default defineEventHandler(async (event) => {
  privateAccountResponse(event);
  const request = feedbackRequestId(getQuery(event).request);
  if (!request) return { live: false };
  try {
    await authServiceRequest(event, { path: `/website/oauth/request?request=${request}` });
    return { live: true };
  } catch (error: any) {
    if ((error?.statusCode ?? error?.response?.status) === 404) return { live: false };
    authServiceFailure(error);
  }
});
