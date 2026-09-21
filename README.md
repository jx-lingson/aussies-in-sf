# Aussies in SF

An open-source neighbourhood map for Australians living in or visiting the San Francisco Bay Area. MIT licensed; contributions welcome.

## Features

- Zoomable geographic map from San Francisco to Palo Alto, Berkeley and Oakland.
- Suburb counts, directory search, resident/visitor filters and arrival/departure dates.
- Shared Cloudflare D1 profiles, authenticated updates and deletion.
- Three distinct signed-in directory members trigger a seven-day suspension. Duplicate and self-reports are rejected. Updating a profile preserves suspension.
- Only real members appear on the map; no example profiles or personal data are seeded or committed.

## Current limits

Joining needs no account. An opaque private edit link and a persistent HttpOnly cookie authorize updates and deletion; only a SHA-256 hash is stored in D1. Existing ChatGPT-owned entries are migrated when their owner visits. Profiles and photos persist in D1 and R2 across deployments. Visitors appear during their travel dates in San Francisco time; the owner view also shows expired or future entries. An arbitrary LinkedIn URL cannot auto-import a profile: manual details and photo uploads are supported. LinkedIn OAuth and human moderation/appeals remain follow-up work. Automatic reports are not proof of nationality and are vulnerable to coordinated abuse. This is an early pilot, not a fully moderated public network.

The code can run on Cloudflare Workers with D1. Supabase is not required for this version. Deployments outside Sites must replace the trusted identity integration; never trust incoming identity headers on an unprotected origin.

## Local D1 migrations

For a D1-backed local preview, generate SQL with `npm run db:generate`. Build once through the Sites skill's build entrypoint (or `npm run build` for standalone use) to generate `dist/server/wrangler.json`, rebuilding if bindings change. From the project root, apply each pending migration in order:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_example.sql
```

Replace the filename with the pending migration and `DB` with your D1 binding name if different. Use `.wrangler/state`, not `.wrangler/state/v3`; Wrangler adds the versioned directories. Do not replay migrations already applied locally. This updates only the preview database; publishing applies production migrations separately.

## Diagnostic Commands

- `npm run install:ci`: perform the one locked dependency install
- `npm run dev`: start the Vite/Vinext development server
- `npm run build`: build the deployable Sites artifact
- `npm run start`: preview the built Worker locally with D1/R2 support
- `npm run db:generate`: generate Drizzle migrations after schema changes

When using the Sites plugin, follow its skill instructions for installation, builds, and publishing. These npm commands remain available for standalone use.

The portable build runs Vinext directly without a host `timeout` command. The managed-linux build uses `scripts/build-verified.sh` and its existing `SITES_BUILD_TIMEOUT` setting.

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
