# Phase 5 — Player Extraction: `daap-player`

## Goal

Extract the presentation engine (Player) from the daap Editor into a standalone
GitHub repo (`daap-player`) that can be built, versioned, and embedded
independently. The Editor keeps a thin React adapter (`AppPlayer.tsx`) that
imports the engine from the package.

---

## Current State (as of audit)

### Player directory tree

```
src/
  player.tsx                  ← bundle entry point (window.WebSliderPlayer = Player)
  player/
    player/
      Player.ts               ← core engine class
      RootTimeline.ts         ← slide-level timeline manager
      Timeline.ts             ← per-object animation timeline
      BreakpointChecker.ts    ← responsive layout helper
      Ticker.ts               ← rAF-based tick loop
      timeline-utild.ts       ← pure timing utilities (no deps)
    AppPlayer.tsx             ← React wrapper; stays in daap
    AppPlayerUtils.ts         ← timeline factories; referenced by Player.ts
    image-generator-utils.ts  ← export/screenshot utilities; stays in daap
  export/
    i-export-html.ts          ← IPlayerData + ISources (needs splitting)
  player-dev/
    PlayerDev.tsx             ← dev harness; stays in daap
```

### Build pipeline (current)

```
build:player   → env-cmd -f env/player.env react-scripts build
bundle:player  → gulp (concat build/static/js/*.js → player-dist/wsplayer.js)
bb:player      → build:player && bundle:player
```

This uses legacy CRA (react-scripts), not Vite. The main app build (`vite.config.ts`)
has no player entry point.

---

## Dependency Analysis

### Files with **zero** daap-internal imports (cleanly extractable)

| File | External deps |
|---|---|
| `Ticker.ts` | browser globals only |
| `timeline-utild.ts` | none |
| `RootTimeline.ts` | `events` npm, siblings |
| `Timeline.ts` | `events` npm, webslider-sdk, siblings |
| `BreakpointChecker.ts` | webslider-sdk |

### Files blocked by daap-internal imports

`Player.ts` has 8 daap-internal imports that must be resolved before extraction:

| Import path in Player.ts | What it provides | Extraction strategy |
|---|---|---|
| `../../export/i-export-html` | `IPlayerData`, `ISlideData`, `IItemsData` | **Split** — move player types to webslider-sdk; keep `ISources` in daap |
| `../AppPlayerUtils` | Timeline factory functions | **Move** to new repo |
| `../../objects/external-object-player-utils` | `loadAndRegisterExternalComponentForPlayer` | **Move** to new repo (only dep: `getGlobals()` base URL helper → replace with a config option) |
| `../../objects/layer/layer` | `layerSizeUpdate` (DOM resize handler) | **Move** to new repo |
| `../../panels/stage-panel/StagePanelUtils` | `calculateObjectSize`, `getRelativeTo`, `unitValueToPx` | **Move** to new repo (pure math, no React) |
| `../../utils/doom-utils/common` | `addClass`, `removeClass` | **Move** to new repo (2 pure DOM helpers) |
| `../../utils/utils` | `convertRGBColor2CSSProperties`, `convertTimeUnitToMs`, `getBooleanValue` | **Copy** only the 3 needed functions; don't move full utils.ts (too coupled) |
| `../../animations/animation-utils` | `getLayerWrapperElementById`, `getObjectElementById`, `getObjectWrapperElementById` | **Move** to new repo (DOM element getters by data-attribute) |

`src/player.tsx` (the bundle entry) also imports:
- `./objects/register-object` — wires the SDK's object/animation registries (must stay in daap or be included in the player bundle via a separate registration call)
- `./objects/font-preloader` — uses `getGlobals()` (daap app config)

These two are **runtime setup** concerns, not engine concerns — the new package's
entry point will call a clean registration API instead.

---

## What Goes Where

### `daap-player` (new repo)

All files that form the embeddable engine:

```
daap-player/
  src/
    Player.ts                  ← (moved, deps resolved)
    RootTimeline.ts            ← (moved as-is)
    Timeline.ts                ← (moved as-is)
    BreakpointChecker.ts       ← (moved as-is)
    Ticker.ts                  ← (moved as-is)
    timeline-utils.ts          ← (renamed from timeline-utild.ts)
    AppPlayerUtils.ts          ← (moved, deps resolved)
    utils/
      dom-utils.ts             ← addClass, removeClass, element getters
      convert-utils.ts         ← convertRGBColor2CSSProperties, convertTimeUnitToMs, getBooleanValue
    layer/
      layer.ts                 ← layerSizeUpdate (moved from src/objects/layer/layer)
    external-object/
      external-object-player-utils.ts ← loadAndRegisterExternalComponentForPlayer
                                          (getGlobals() replaced by config.baseUrl)
    layout/
      stage-utils.ts           ← calculateObjectSize, getRelativeTo, unitValueToPx
                                  (moved from src/panels/stage-panel/StagePanelUtils)
    index.ts                   ← public API: export { Player }
  package.json
  tsconfig.json
  vite.config.ts               ← library mode → wsplayer.esm.js + wsplayer.js
```

### `webslider-sdk` (interface changes)

Player data types move here so both the Editor and daap-player can import them without a circular dependency:

```
webslider-sdk/src/player/
  i-player-data.ts    ← IPlayerData, ISlideData, IItemsData, ItemVisibility
```

The existing `i-export-html.ts` in daap is kept but re-exports these types from webslider-sdk
for backwards compatibility within the Editor while old import paths are updated.

### `daap` (stays)

| File | Why it stays |
|---|---|
| `src/player/AppPlayer.tsx` | React component, uses `IPreviewState` from Redux and `PreviewTimelineContext` |
| `src/player/image-generator-utils.ts` | Deep store coupling (ILayer, IPages, IObjects, export pipeline) |
| `src/player-dev/PlayerDev.tsx` | Dev harness only |
| `src/export/i-export-html.ts` | Keeps `ISources` + re-exports player types from webslider-sdk |
| `src/objects/register-object.ts` | Object registration is app-wide; called from app entry, not player bundle |
| `src/objects/font-preloader.ts` | Uses app config (`getGlobals()`) |

---

## Proposed Work — Step by Step

### Step 0 — Move `IPlayerData` and related types to webslider-sdk

**Why first:** `IPlayerData` is used in 10+ files across daap. If we move it to the SDK first, all existing daap imports stay valid (they import from the SDK) and Player.ts in the new repo can also import from the SDK.

1. Create `webslider-sdk/src/player/i-player-data.ts`:
   - `IPlayerData`, `ISlideData`, `IItemsData`, `ItemVisibility`, `ISlideDuration`, `ISlideExitTime`
   - `PageType` enum (currently in `store/reducers/i-pages` but needed by `ISlideData`) — inline a copy
2. Export from `webslider-sdk/src/index.ts`
3. Update `daap/src/export/i-export-html.ts`: re-export everything from webslider-sdk; keep only `ISources` (editor-only)
4. All 10+ files in daap that import from `i-export-html` keep working unchanged

**Verification:** `yarn build:app:saas` passes in daap; `yarn build` passes in webslider-sdk.

---

### Step 1 — Create `daap-player` repo skeleton

1. Initialize repo: `package.json` (name: `daap-player`, peer deps: `webslider-sdk`, `events`, `animejs`)
2. `tsconfig.json`: strict, moduleResolution NodeNext
3. `vite.config.ts`: library mode, entry `src/index.ts`, output `dist/wsplayer.js` (UMD) + `dist/wsplayer.esm.js`
4. `src/index.ts`: `export { Player } from './Player'`

---

### Step 2 — Move clean files (no daap deps)

Copy unchanged:
- `Ticker.ts`
- `timeline-utils.ts` (rename from `timeline-utild.ts`)
- `RootTimeline.ts`
- `Timeline.ts`
- `BreakpointChecker.ts`

These need zero changes. Adjust relative import paths only.

---

### Step 3 — Extract supporting utilities

Create these files in `daap-player/src/`:

**`utils/dom-utils.ts`** — copy from:
- `daap/src/utils/doom-utils/common.ts` → `addClass`, `removeClass`
- `daap/src/animations/animation-utils.ts` → `getLayerWrapperElementById`, `getObjectElementById`, `getObjectWrapperElementById`

**`utils/convert-utils.ts`** — copy only 3 functions from `daap/src/utils/utils.ts`:
- `convertRGBColor2CSSProperties`
- `convertTimeUnitToMs`
- `getBooleanValue`

**`layer/layer.ts`** — copy `layerSizeUpdate` from `daap/src/objects/layer/layer.ts`.
Verify it has no daap imports beyond webslider-sdk types.

**`layout/stage-utils.ts`** — copy from `daap/src/panels/stage-panel/StagePanelUtils.ts`:
- `calculateObjectSize`, `getRelativeTo`, `unitValueToPx`
These are pure math functions — verify no React imports.

**`external-object/external-object-player-utils.ts`** — move `loadAndRegisterExternalComponentForPlayer`.
Replace the `getGlobals().extensionsBaseUrl` call with a config option passed into `Player`:
```ts
// new Player constructor signature:
new Player(data: IPlayerData, options?: { extensionsBaseUrl?: string })
```

---

### Step 4 — Move `AppPlayerUtils.ts`

Copy `AppPlayerUtils.ts` to `daap-player/src/AppPlayerUtils.ts`.
Update its 3 daap-internal imports:
- `../export/i-export-html` → `webslider-sdk` (after Step 0)
- `../objects/exec-code-animation` → create a minimal `IExecCodeConfig` type in the new repo
- `../utils/utils` → `./utils/convert-utils`

---

### Step 5 — Move and fix `Player.ts`

Copy to `daap-player/src/Player.ts`. Update all 8 imports:

| Old import | New import |
|---|---|
| `../../export/i-export-html` | `webslider-sdk` |
| `../AppPlayerUtils` | `./AppPlayerUtils` |
| `../../objects/external-object-player-utils` | `./external-object/external-object-player-utils` |
| `../../objects/layer/layer` | `./layer/layer` |
| `../../panels/stage-panel/StagePanelUtils` | `./layout/stage-utils` |
| `../../utils/doom-utils/common` | `./utils/dom-utils` |
| `../../utils/utils` | `./utils/convert-utils` |
| `../../animations/animation-utils` | `./utils/dom-utils` |

Add `extensionsBaseUrl` to `PlayerOptions` and thread it through to `loadAndRegisterExternalComponentForPlayer`.

---

### Step 6 — Update daap to use the package

1. `daap/package.json`: add `"daap-player": "link:../daap-player"` (local during dev; npm ref later)
2. `daap/src/player/AppPlayer.tsx`: change `import { Player } from '../player/Player'` → `import { Player } from 'daap-player'`
3. `daap/src/player.tsx`: replace with a one-liner that calls `daap-player`'s bundle entry (or delete entirely if the editor no longer ships a standalone player bundle from this repo)
4. `daap/src/types/window.d.ts`: update `WebSliderPlayer: typeof Player` import source

Build scripts `build:player`, `bundle:player`, `bb:player` in `daap/package.json` are removed — the player is now built in the `daap-player` repo.

---

### Step 7 — Verify

1. `daap-player` repo: `npx yarn build` → `dist/wsplayer.js` produced, no errors
2. `daap` repo: `nvm use 22 && npx yarn build:app:saas` → passes, no Player-related errors
3. In-editor preview (`AppPlayer.tsx`) renders correctly in the browser
4. Embeddable player bundle (`wsplayer.js`) can be loaded standalone in a plain HTML page

---

## Open Questions / Decisions

| # | Question | Options |
|---|---|---|
| 1 | **`register-object` in the player bundle?** | Current bundle wires up all built-in objects at startup. New repo could call `registerObjects()` lazily or require the consumer to call it. | 
| 2 | **`font-preloader` in new repo?** | Font preloading uses app config (`getGlobals()`). Simplest: pass a `fontPreloaderFn` option to Player similar to `extensionsBaseUrl`. |
| 3 | **CRA → Vite for player build?** | The current player build uses `react-scripts`. New repo should use Vite library mode — simpler and consistent with main app. |
| 4 | **npm publish vs local link?** | During development, use `"daap-player": "link:../daap-player"`. For open source, publish to npm (or GitHub Packages). |
| 5 | **`IExecCodeConfig`** | Currently from `daap/src/objects/exec-code-animation`. Is this a pure type? If so, move to webslider-sdk. If it references daap code, keep a copy in daap-player. |

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|---|---|---|
| StagePanelUtils has hidden React imports | Low | Functions are math-only but the file is in `panels/` — verify before moving |
| `layerSizeUpdate` has deeper store deps | Low | The function is a DOM operation; verify by reading `src/objects/layer/layer.ts` fully |
| Animation timelines break after move | Medium | Cover with a browser smoke test of slide playback (advance, reverse, auto-play) |
| `IExecCodeConfig` is coupled to daap object types | Medium | Read `src/objects/exec-code-animation.ts` before Step 4 |
| `PageType` mismatch after SDK move | Low | Inline copy in SDK, add `@deprecated` alias in daap's `i-pages.ts` |
