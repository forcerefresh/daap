# DAAP Open Source Preparation — Refactoring Plan

## Context

The daap project is a web-based design editor (rich interactive presentations/sliders). The goal is to prepare it for open source:
- The **Editor** remains in daap and becomes the open source core
- The **Player** is extracted to a separate GitHub repo (`daap-player`)
- The **AI template generator** is extracted and the Editor gets a generic plugin slot
- The codebase must be clean, typed, and well-structured before these architectural moves

**Priority order:** TypeScript & dead code → library audit → style guide → snap improvement → architecture separation (Player, then AI plugin)

---

## Phase 1 — TypeScript & Dead Code Cleanup ✅ COMPLETE

**Goal:** Get the codebase to a state where the type checker can be trusted and the code is auditable before extraction.

### What was done

- Set up ESLint with `@typescript-eslint`, `react-hooks`, `no-warning-comments` rules
- Removed `@ts-nocheck` from `StagePanelUtils.tsx`; deleted the entire dead `StagePanel.tsx` (1838 lines, never imported)
- Fixed 63+ `any` types in `src/panels/stage-panel-new/` — `BreakpointConfiguration`, `ICalculatedObjectSize`, `Record<string, IObject>`, etc.
- Typed Redux middleware and thunk returns in `src/store/store.ts`
- Replaced all `window as any` and `WebSlider_GlobalScope as any` usages with typed `getGlobals()` helper and `IWebSliderGlobalScope` interface
- Created `src/types/window.d.ts` for global Window augmentations (`WSFontPreloader`, `animejs`, `DAAP_isDirty`, etc.)
- Removed dead commented-out blocks: `LayoutProperties.tsx`, `snap-layout-input.tsx`, `StagePanelUtils.tsx` preview mocks
- Fixed `onChange` call bug in `snap-layout-input.tsx` (spurious second argument)

**Verified:** `yarn build:app:saas` passes, smoke test passed.

---

## Phase 2 — Library License Audit & Remediation ✅ COMPLETE

### What was done

- Confirmed `src/3rd-party-libs/undo-redo/` is a vendored copy of [`redux-deep-diff`](https://github.com/wwilsman/redux-deep-diff) (MIT, © 2017 Wil Wilsman)
- Added MIT attribution header to all 6 files: `actions.js`, `reducer.js`, `accumulator.js`, `deducer.js`, `util.js`, `index.js`
- Confirmed `src/objects/free-draw/utils.ts` bezier math is original implementation — no attribution needed

---

## Phase 3 — Style Guide & UI Component Unification 🔄 IN PROGRESS

**Goal:** Consistent visual language and component patterns across all panels and inputs.

### 3A: Design Token Formalization

- `src/theme.scss` has DAAP-specific variables and Blueprint.js overrides — extract into a formal token file (`src/tokens.scss`) with documented categories: color, spacing, typography, borders
- Establish naming convention: `--daap-color-primary`, `--daap-spacing-md`, etc.

### 3B: Input Component Standardization

Current state: 58+ input component directories in `src/inputs/`, many with duplicated patterns.

- Define a standard `IInputProps<T>` interface that all inputs implement
- Audit `src/inputs/input-utils.tsx` and `src/inputs/input-factory.tsx` — document what each factory function produces
- Identify and merge duplicate inputs (e.g., multiple numeric input variants)
- Ensure every input uses the token system from 3A

### 3C: Panel Layout Pattern

- Define a standard panel shell component: `<PanelShell header={...} />` with consistent header height, padding, divider style
- 45+ panels in `src/panels/` — audit each against the standard; create a migration checklist

---

## Phase 4 — Feature Improvement: Snap to Guideline

**Goal:** Replace the current broken snap implementation with a proper snap engine.

### Current state (poor)

- `src/inputs/snap-layout-input/snap-layout-input.tsx` — UI incomplete, TODOs throughout
- "Guidelines" are only padding offsets (top/bottom/left/right insets), not real snap lines
- No centralized snap engine — no edge-to-edge or center-to-center calculation
- No visual snap guide lines rendered on the stage

### Plan

1. Create `src/utils/snap/snap-engine.ts` — centralized snap calculation:
   - Input: moving object bounds + all candidate snap targets
   - Output: snapped position + visual guide lines to render
   - Support: edge-to-edge, center-to-center, equidistant spacing
2. Define snap targets from: page edges, stage edges, guideline padding, other objects
3. Configurable snap threshold (pixels)
4. Wire into the stage drag handler (`stage-panel-new/`)
5. Render snap guide lines on the stage canvas (currently missing entirely)
6. Fix the snap-layout-input UI — complete the offset/gap inputs

---

## Phase 5 — Architecture Separation: Player → Separate Repo

**Goal:** Extract the Player into its own GitHub repo (`daap-player`) so it can be versioned, bundled, and embedded independently of the Editor.

### What moves out

- `src/player/player/Player.ts` (core engine)
- `src/player/player/RootTimeline.ts`
- `src/player/player/Timeline.ts`
- `src/player/player/BreakpointChecker.ts`
- `src/player/player/Ticker.ts`
- `src/player.tsx` → becomes the package entry point

The `IPlayerData` interface in `src/export/i-export-html.ts` is the public contract between Editor and Player — it moves to `webslider-sdk` so both repos can import it without circular dependency.

### What stays in daap

- `src/player/AppPlayer.tsx` — React wrapper for in-editor preview; becomes an adapter importing from `daap-player`
- `src/player/AppPlayerUtils.ts` — editor-specific utilities (image generator, timeline display)
- `src/player/image-generator-utils.ts` — editor export utility

### New repo structure (`daap-player`)

```
daap-player/
├── src/
│   ├── Player.ts
│   ├── RootTimeline.ts
│   ├── Timeline.ts
│   ├── BreakpointChecker.ts
│   ├── Ticker.ts
│   └── index.ts          (public API: export { Player, IPlayerData })
├── package.json          (peer deps: webslider-sdk)
├── tsconfig.json
└── vite.config.ts        (library mode → wsplayer.js bundle + ESM exports)
```

### daap changes after extraction

- `package.json`: add `daap-player` as dependency
- `src/player/AppPlayer.tsx`: `import { Player } from 'daap-player'`
- `src/player.tsx`: delete (entry point moves to daap-player repo)
- Build scripts `build:player`, `bundle:player`, `bb:player`: remove or redirect

---

## Phase 6 — Architecture Separation: AI Plugin System

**Goal:** Remove all AI/template-generator code from the Editor core. The Editor gets a generic plugin slot; the AI implementation becomes a separate installable package.

### Plugin interface (goes into `webslider-sdk`)

```typescript
// webslider-sdk/src/plugins/generator-plugin.ts

export interface IGeneratorPlugin {
  id: string;
  name: string;
  version: string;
  buttonConfig: {
    icon: React.ReactNode;
    label: string;
    tooltip?: string;
  };
  DrawerComponent: React.ComponentType<IGeneratorDrawerProps>;
}

export interface IGeneratorDrawerProps {
  onInsert: (objects: IObject[]) => void;
  onClose: () => void;
  editorContext: IEditorContext;   // read-only snapshot of current project
}

export function registerGeneratorPlugin(plugin: IGeneratorPlugin): void;
export function getGeneratorPlugins(): IGeneratorPlugin[];
```

### Editor changes

- Add a "Generator Plugins" button area in the toolbar
- Each registered plugin gets a button using its `buttonConfig`
- Clicking opens a `<Drawer>` containing the plugin's `DrawerComponent`
- `onInsert(objects)` dispatches `ADD_OBJECT` actions to the store
- The editor has **no direct AI imports** — all AI is behind this interface

### New package: `daap-plugin-ai-generator`

Move here:
- `src/template-generator/`
- `src/integration/hooks/ai-hook/`

```
daap-plugin-ai-generator/
├── src/
│   ├── index.ts           (exports: AiGeneratorPlugin)
│   ├── components/
│   ├── hooks/
│   └── types/
├── package.json           (peer deps: webslider-sdk, react)
└── tsconfig.json
```

---

## Execution Order

| Phase | Work | Status | Prerequisite |
|-------|------|--------|--------------|
| 1 | TypeScript error resolution + dead code removal + ESLint | ✅ Done | — |
| 2 | Library license audit | ✅ Done | — |
| 3 | Style guide + UI unification | 🔄 In progress | Phase 1 |
| 4 | Snap to guideline rewrite | Pending | Phase 1 |
| 5 | Player extraction | Pending | Phase 1 + 2 |
| 6 | AI plugin system | Pending | Phase 5 |

---

## Verification Per Phase

- **Phase 1:** `yarn build:app:saas` passes ✅; smoke test passed ✅
- **Phase 2:** All files in `src/3rd-party-libs/` have license headers ✅
- **Phase 3:** All panels use token variables; all inputs implement `IInputProps<T>`; visual review in browser
- **Phase 4:** Drag object near page edge → snap line appears; object snaps cleanly; snap can be disabled
- **Phase 5:** `daap-player` repo builds independently; `wsplayer.js` produced; Editor imports Player from package
- **Phase 6:** Editor builds with no `template-generator` imports; registering AI plugin shows its button; clicking opens drawer; generating inserts objects into canvas

---

## Key File Reference

| Purpose | Path |
|---------|------|
| Store root | `src/store/store.ts` |
| Stage panel new (active) | `src/panels/stage-panel-new/` |
| Player core | `src/player/player/Player.ts` |
| Player React adapter | `src/player/AppPlayer.tsx` |
| IPlayerData contract | `src/export/i-export-html.ts` |
| AI template generator | `src/template-generator/` |
| AI integration hooks | `src/integration/hooks/ai-hook/` |
| Undo/redo library | `src/3rd-party-libs/undo-redo/` |
| Snap layout input | `src/inputs/snap-layout-input/snap-layout-input.tsx` |
| Object registration | `src/objects/register-object.ts` |
| External object loader | `src/objects/external-object-utils.ts` |
| Global scope types | `src/globals.ts`, `src/types/window.d.ts` |
| Theme tokens | `src/theme.scss` |
| Input factory | `src/inputs/input-factory.tsx` |
| webslider-sdk | `/Users/srdjanarsic/Projects/webslider-sdk/` |
