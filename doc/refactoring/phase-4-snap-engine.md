# Phase 4 — Snap to Guideline

## Current State (as of audit)

Snap already works for **move operations**. The existing architecture:

```
Redux globals (snapToObject/Margin/Document + thresholds)
  ↓
ToolsProvider.tsx — builds snapBounds[] from page objects + margin + document
  ↓
processMoveChangeEvent() in move-handler.ts
  ↓
renderSnapLines() → renderSnapLine() → isNear() → snapDelta {x, y}
  ↓
Imperative DOM update + inject guide divs into .StagePanel-SnapHolder
```

### What's working

| Feature | Status | Location |
|---------|--------|----------|
| Snap-to-object (edges + center) | ✅ Working | `move-handler.ts:renderSnapLines()` |
| Snap-to-margin (breakpoint insets) | ✅ Working | `ToolsProvider.tsx:useEffect` |
| Snap-to-document (page edges + center) | ✅ Working | `ToolsProvider.tsx:useEffect` |
| Visual guide lines | ✅ Working | `renderSnapLine()` → `.StagePanel-SnapHolder` |
| Object highlight on snap | ✅ Working | `.snap-highlight-object` class |
| Per-type threshold config | ✅ Working | `globals.snapToObjectThreshold` etc. |
| Toggle per snap type | ✅ Working | `globals.snapToObject` etc. |

### What's missing / broken

| Feature | Status | Notes |
|---------|--------|-------|
| Snap during **resize** | ❌ Missing | `renderSnapLines()` never called from resize handler |
| `snap-layout-input` UI | ❌ Incomplete | TODOs throughout; not wired to any settings |
| Multi-object snap detection | ⚠️ Partial | Only primary dragged object is checked; others follow via global offset |
| Distribution/spacing guides | ❌ Missing | Not in current architecture |
| Snap on rotate | ❌ Missing | Not planned |

---

## Current vs Proposed

The **original plan** proposed creating `src/utils/snap/snap-engine.ts` as a new centralized engine and said guide lines were "currently missing entirely." The audit shows both claims are outdated — a capable snap engine and guide line rendering already exist in `move-handler.ts`.

The correct scope for Phase 4 is therefore **two targeted additions**, not a ground-up rewrite:

| Original plan said | Actual situation | Revised scope |
|---|---|---|
| Create snap engine from scratch | Engine exists in move-handler.ts | Extract + extend, don't recreate |
| "No visual snap guide lines" | Lines exist (#ce58d1, .StagePanel-SnapHolder) | Fix snap-layout-input UI instead |
| Edge-to-edge + center-to-center | Already implemented | Verified working |
| Configurable threshold | Already in Redux | Per-type thresholds already work |
| Wire into drag handler | Already wired | Add resize handler |

---

## Proposed Work

### 4A — Extract snap engine (low risk, enables 4B)

Extract the snap logic from `move-handler.ts` into `src/utils/snap/snap-engine.ts` so it can be called from both the move handler and the new resize handler without duplication.

**Files:**
- New: `src/utils/snap/snap-engine.ts`
- Edit: `src/panels/stage-panel-new/handlers/move-handler.ts` — replace inline functions with imports

Functions to extract (currently in `move-handler.ts`):
```typescript
export function isNear(value: number, ref: number, threshold: number): boolean
export function renderSnapLines(newBounds, snapBounds, skipIds, stageScale, objectScale): {x,y}
export function clearSnapHolder(): HTMLElement
// renderSnapLine() stays internal to snap-engine — called only by renderSnapLines
```

**Risk:** Low — pure refactor, same logic, same callers.

---

### 4B — Snap during resize

Call `renderSnapLines()` (now from `snap-engine.ts`) inside the resize change/stop handlers, mirroring the existing move integration.

**Files to read first:**
- `src/panels/stage-panel-new/handlers/resize-handler.ts` — find `processResizeChangeEvent` and `processResizeStopEvent`
- `src/panels/stage-panel-new/StageManagerProvider.tsx` — find RESIZE event wiring

**Integration pattern** (mirror of move-handler.ts):
```typescript
// In processResizeChangeEvent:
const snapDelta = renderSnapLines(newObjectBounds, snapBounds, skipIds, stageScale, objectScale);
// Apply snapDelta to resize delta (edge-specific: only snap the edge being dragged)
```

Note: For resize, only the dragged edge snaps — not all 6 sides simultaneously. Need to pass `resizeHandle` (top/right/bottom/left/corner) so `renderSnapLines` only checks the relevant sides.

**Risk:** Medium — resize handler is complex; snapping the wrong edge causes jitter.

---

### 4C — Fix snap-layout-input UI

The `snap-layout-input` component has TODOs and is not wired to any Redux state. It appears to be a standalone UI panel for setting guideline offsets (margin padding).

**Files:**
- `src/inputs/snap-layout-input/snap-layout-input.tsx` — complete the UI
- Verify what state it should bind to (likely `snapToMarginThreshold` or a new `marginGuides` config in globals)
- Wire to Redux via the existing `SET_GLOBALS` action

**Risk:** Low — isolated UI component.

---

## Key Files Reference

| File | Role |
|------|------|
| `src/panels/stage-panel-new/handlers/move-handler.ts` | Current snap engine (extract from here) |
| `src/panels/stage-panel-new/handlers/resize-handler.ts` | Add snap calls here (4B) |
| `src/panels/stage-panel-new/StageManagerProvider.tsx` | Event wiring — passes snapBounds to handlers |
| `src/panels/stage-panel-new/ToolsProvider.tsx` | Builds snapBounds[] from Redux state |
| `src/panels/stage-panel-new/StagePanelCanvas.tsx` | Contains `.StagePanel-SnapHolder` div |
| `src/panels/stage-panel-new/StagePanelNew.module.scss` | `.snap-highlight-object` styles |
| `src/store/reducers/globals.ts` | `IAppSettings` — snap toggle + threshold fields |
| `src/utils/transform/transform-utils.ts` | `getObjectBounds()` — reuse for computing new bounds |
| `src/inputs/snap-layout-input/snap-layout-input.tsx` | Incomplete UI (fix in 4C) |
| New: `src/utils/snap/snap-engine.ts` | Extracted engine (create in 4A) |

---

## Execution Order

1. **4A** — Extract snap engine (prerequisite for 4B, no user-visible change)
2. **4C** — Fix snap-layout-input UI (isolated, can be done in parallel)
3. **4B** — Add resize snap (depends on 4A)

## Verification

- **4A:** `yarn build:app:saas` passes; drag an object and confirm snap still fires (no regression)
- **4B:** Resize an object near a page edge or another object → snaps cleanly to edge; guide line appears
- **4C:** Open snap settings panel → margin inputs are editable and update snap behavior
