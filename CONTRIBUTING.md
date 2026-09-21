# Contributing to G’day Bay

Open an issue to discuss changes, then fork this repository and submit a pull request. Small contributions are welcome: suburb coverage, accessibility, mobile usability, moderation and profile integrations.

## Development

Use Node 22.13 or newer. Run `npm run install:ci`, then `npm run dev`. The local development preview supplies a mock identity; never enable mock identity in production. Shared data uses Cloudflare D1. Run `npm run db:generate` after schema edits. Build with `npm run build`, then apply pending generated SQL locally using the Wrangler command described in README.md. Production migrations are deployed with the app.

## Review checklist

- Never collect or plot street addresses, precise coordinates or GPS locations for people.
- Enforce profile ownership and unique reporters on the server.
- Keep credentials, databases, user submissions and personal information out of Git.
- Label fictional examples explicitly.
- Preserve visible imagery attribution. The MIT licence covers project code, not third-party map imagery.
- Test date boundaries, duplicate reports and suspended-profile updates when changing those flows.

## Current priorities

LinkedIn OIDC integration (name/photo; job title may require manual entry or additional access), user-uploaded profile photos, human moderation and appeals, contact visibility preferences, and cluster collision handling at low zoom. OAuth requires operator configuration; never scrape LinkedIn pages or claim URL pasting is automatic import.
