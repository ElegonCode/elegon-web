export function patreonSupportDuration(since: string | null | undefined, now = new Date()) {
  if (!since) return "";
  const start = new Date(since);
  if (!Number.isFinite(start.getTime()) || start > now) return "";
  let months = (now.getUTCFullYear() - start.getUTCFullYear()) * 12 + now.getUTCMonth() - start.getUTCMonth();
  if (now.getUTCDate() < start.getUTCDate()) months--;
  return months <= 0 ? "Less than 1 month in this support period" : `${months} ${months === 1 ? "month" : "months"} in this support period`;
}
