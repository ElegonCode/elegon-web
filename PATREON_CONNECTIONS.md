# Patreon connections and support details

Players sign in with Steam and can connect/disconnect Patreon on `/account`.
Connection requires a Patreon API v2 Client ID and Client Secret, configured privately
on Railway's Elegon Website service as `NUXT_PATREON_CLIENT_ID` and
`NUXT_PATREON_CLIENT_SECRET`. Register `https://elegon.app/auth/patreon/callback` exactly.

Only the `identity` OAuth scope is requested. The player's code is exchanged server-side;
only the proven Patreon user ID, display name, and optional avatar are saved. Player OAuth
tokens, email addresses, and financial amounts are not persisted or exposed in the browser.
IDs have unique ownership per provider and pending states are bound to provider and session.
Disconnect removes only the Patreon connection; it does not cancel a Patreon membership.

Support details use the existing `PATREON_ACCESS_TOKEN` creator token with `campaigns.members`
access and `PATREON_CAMPAIGN_ID` for Elegon. No change is made to the public supporter list.
The server fetches all pages from that fixed campaign, caching privately for five minutes.
The signed-in account's proven Patreon ID is the only identity used to select the returned
support summary. Other supporters' details never enter the account response.

The card shows active, declined, former, free, or no membership, current entitled tier titles,
and the start of the latest continuous support period when provided for active patrons.
Elapsed months are calendar duration in that period, not a payment count or lifetime total.
Unknown fields and API errors show unavailable, never an inferred non-supporter status.
Refresh support uses the same bounded cache; changes appear within five minutes.

Deploy auth before the website. Migration `003_patreon.sql` only expands the pending-state
provider allowlist; it does not modify existing Steam/Discord identities or account dates.
Take a native database backup and verify unchanged account, Steam, and Discord mappings.
Application rollback can retain additive connection rows and tables.

Validation: Rust website lifecycle/access-control/provider-isolation tests, Clippy,
PGlite migration/restart/cascade tests, `npm run test:account`, `npm run build`,
private creator API validation, and responsive browser fixtures. Complete a real
Patreon connect/disconnect from a user's signed-in browser after configuration.
