# DAAP — Design Studio Editor

A professional in-browser graphic design editor built for rapid design creation, powered by React, TypeScript, Redux, and Vite.

## Repository overview

`daap` is the platform-agnostic editor core. It contains no platform-specific business logic or secrets. Platform implementations (API calls, authentication, media storage, routing) live in separate integration repos checked out into `integration/` at build time.

```
daap/
├── src/                        # editor source
│   └── integration/
│       ├── core/               # shared TypeScript interfaces (no implementations)
│       ├── hooks/              # platform-specific hook implementations
│       └── utils/              # shared utilities
├── integration/                # gitignored — integration repos checked out here
│   ├── wp/                     # daap-wp-integration (WordPress)
│   └── standalone/             # example standalone integration
└── vite.shared.config.ts       # shared Vite factory used by all integration configs
```

## How platform switching works

The `@platform` Vite alias resolves to the active integration directory at build time. The editor core never imports platform-specific code directly — it always goes through `@platform/hooks/<hook-name>` and `@platform/platform-flags`.

Builds are always triggered **from the integration repo**, not from `daap/`:

| Command      | Where to run      | Result                                         |
| ------------ | ----------------- | ---------------------------------------------- |
| `yarn build` | `integration/wp/` | WP production bundle → `dist/index.js`         |
| `yarn dev`   | `integration/wp/` | WP watch mode (rebuild on save)                |
| `yarn serve` | `integration/wp/` | Serve `dist/` on port 8080 for local WordPress |

## Prerequisites

- Node.js 18+
- Yarn
- `yarn install` run from `daap/` root (integration repos share this `node_modules`)
- For WP dev: MAMP or any local WordPress instance

## Setup

```sh
# 1. Install dependencies (once, from daap root)
yarn install

# 2. Check out integration repos
git clone git@github.com:forcerefresh/daap-wp-integration.git integration/wp
```

## Running WP

```sh
cd integration/wp
yarn dev      # watch mode — rebuilds dist/index.js on every save
yarn serve    # second terminal — serves dist/ on http://127.0.0.1:8080
```

See [integration/wp/README.md](integration/wp/README.md) for the full WordPress local setup.

## TypeScript paths

`tsconfig.json` maps `@platform` to `integration/wp/` by default (used for IDE type-checking):

- `@platform/*` → `integration/wp/*`
- `@daap/*` → `src/*`

For a different integration, update the `@platform` path in `tsconfig.json` accordingly.

## Package scripts (daap root)

| Script                | Description                                      |
| --------------------- | ------------------------------------------------ |
| `yarn generate:types` | Regenerate OpenAPI types from daap-server schema |
| `yarn lint`           | Run ESLint on `src/`                             |
| `yarn lint:fix`       | Run ESLint with auto-fix                         |
| `yarn analyze`        | Bundle size analysis on `dist/`                  |
