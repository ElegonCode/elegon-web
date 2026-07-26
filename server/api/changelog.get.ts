import changelog from "../generated/changelog.json";

export default defineEventHandler(async (event) => {
  setResponseHeader(
    event,
    "Cache-Control",
    "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
  );

  return changelog;
});
