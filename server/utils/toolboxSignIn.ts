export function toolboxCallback(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (
      url.protocol !== "http:" ||
      url.hostname !== "127.0.0.1" ||
      !url.port ||
      url.username ||
      url.password ||
      url.pathname !== "/callback" ||
      url.search ||
      url.hash
    )
      return null;
    return url.href;
  } catch {
    return null;
  }
}

export function toolboxReturnPath(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/toolbox/sign-in?")) return null;
  const url = new URL(value, "https://elegon.app");
  const callback = toolboxCallback(url.searchParams.get("callback"));
  const state = url.searchParams.get("state");
  if (!callback || !state || !/^[a-f0-9]{64}$/.test(state) || url.hash) return null;
  return `/toolbox/sign-in?${new URLSearchParams({ callback, state })}`;
}
