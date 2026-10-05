# Discord connections

Players sign in through Steam, then connect or disconnect Discord on `/account`.
The account name and avatar continue to come from Steam. Steam cannot be disconnected.
Discord linking does not enable Discord sign-in, merge accounts, or change the game identity.

## Production configuration

In the existing Discord application, add this OAuth2 redirect URL exactly:

`https://elegon.app/auth/discord/callback`

Set these private Railway variables on **Elegon Website**:

- `NUXT_DISCORD_CLIENT_ID`: the application Client ID
- `NUXT_DISCORD_CLIENT_SECRET`: the application Client Secret

Deploy the website after changing variables. No bot token is needed. Until both variables are
configured, the account page displays Discord as unavailable and keeps Steam login working.

## Identity and security

The authorization-code flow requests only `identify`. The website exchanges the code server-side
and reads the authenticated Discord profile. OAuth tokens and the client secret never enter the
browser or account database. Disconnect removes the Elegon connection; it does not revoke other
OAuth grants associated with this Discord application.

Link requests have a ten-minute, single-use state bound to the active Elegon session. The
website also validates an HttpOnly state cookie. Mutations require the canonical website origin.
The auth service allows a Discord ID to belong to one account, and one Discord connection per
account. Disconnect includes the expected Discord ID to protect against stale browser tabs.

## Deployment and rollback

Deploy elegon-auth first; migration `002_connections.sql` adds profile and pending-request tables.
It does not rewrite Steam links, account IDs, auth subjects, or creation dates. Verify existing
Steam mappings and creation dates against a database-local snapshot before publishing the website.
Take a native Railway PostgreSQL backup before deploying.

For application rollback, redeploy the previous auth and website deployments. Leave the additive
tables in place so recorded connections are preserved for a subsequent deployment. A database
restore is unnecessary unless data corruption is independently confirmed.

## Verification

Run `npm run test:account` and `npm run build` in the website; run `cargo test --locked`,
`cargo clippy --locked --all-targets -- -D warnings`, and `node tests/migration.mjs` in auth.
After configuration, verify a real connect/disconnect from a signed-in Steam browser. Confirm
the same characters and creation date remain visible. Never use a game client to test this change.
