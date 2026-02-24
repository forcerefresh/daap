# Stage Panel — Architecture & Refactoring Reference

> **Purpose:** Deep technical reference for AI agents and developers working on the stage panel system.
> Last reviewed: 2026-02-24

---

## 1. What Is This?

The `stage-panel-new/` directory is the **visual canvas** of the DAAP design editor. It is responsible for:

- Rendering all objects on the current slide (page), organized into layers
- Providing interactive controls: drag/move, resize, rotate
- Zoom and pan of the canvas viewport
- Object selection model (single, multi, group-enter, group-child)
- Preview mode (switching to the player/animation engine)
- Keyboard shortcuts for common operations

The entry point is `StagePanelNewWrapper.tsx`, which wraps three providers around the root canvas component.

---

## 2. Component Tree

```
StagePanelNewWrapper
├── StageManagerProvider          (interaction event bus + Redux bridge)
├── CursorProvider                (custom cursor overlay for tools)
└── StagePanelNew                 (root canvas component)
    └── [layer in active slide] →
        StageLayer                (renders one layer)
        └── [object in layer] →
            StageObject (StageObjectInternal)
            ├── WithResizeHandle  (HOC: attaches resize handle DOM nodes)
            ├── WithRotationHandle (HOC: attaches rotation handle DOM node)
            ├── object-holder div  (position + transform target)
            │   ├── rotation-handle div
            │   ├── object content (dangerouslySetInnerHTML via getObjectHtml)
            │   ├── hit-test transparent div (pointer capture for selection)
            │   ├── resize-handle-holder div (anchor for corner handles)
            │   └── object-selection div (selection/hover box-shadow overlay)
            └── clipping-mask-daap div (SVG clip mask when applicable)
    StageToolsCanvas              (scale handle overlay — see §6.3)
```

### Files at a glance

| File | Role |
|---|---|
| `StagePanelNewWrapper.tsx` | Entry point; composes providers |
| `StagePanelNew.tsx` | Root canvas, Redux-connected, zoom sync, hotkeys |
| `StageLayer.tsx` | Renders a layer div + maps objects to `StageObject` |
| `StageObject.tsx` | Renders a single object with all interactive layers |
| `StageManagerProvider.tsx` | Owns `StageManager`, handles interaction events, updates Redux |
| `StageToolsCanvas.tsx` | Legacy overlay component (partially superseded — see §6.3) |
| `WithResizeHandle.tsx` | HOC: imperatively creates/destroys resize handle DOM elements |
| `WithRotationHandle.tsx` | HOC: imperatively attaches rotation handle to `.rotation-handle` |
| `stage-panel-utils.ts` | Matrix math, DOM helpers, transform utilities |
| `zoom-pan/useZoomPan.ts` | Zoom/pan hook using CSS custom properties |
| `CursorProvider.tsx` | Custom cursor overlay for tool-specific cursors |
| `utils.ts` | Global window property helpers (`window.DAAP`) |
| `normalize-group-utils.ts` | (see file) |

---

## 3. Data Model

```
Project
└── pages (slides): IPage[]
    └── layerIds: string[]
        → layers: ILayer[]
            └── objectIds: string[]
                → objects: IObject[]
                    └── objectIds?: string[]   ← groups recurse here
```

**Key types:**

- `IPage` — a slide (page in the project)
- `ILayer` — a layer within a slide; has `properties.hasLayoutChildren` (flex/grid)
- `IObject` — a design object with `left`, `top`, `width`, `height`, `rotation`, `scale`, `type`, `objectIds?` (group), `mask?`, `parentId`
- `BreakpointConfiguration` — device breakpoint (desktop/tablet/mobile); controls canvas size and object sizing

Only the **active slide** is rendered. `selection.activeSlideId` drives which layers render.

---

## 4. Redux Store Slices Used

Every component in this module is connected to Redux. The relevant slices:

```
state.project
  ├── pages.pageById
  ├── layers.layerById
  ├── objects.objectById
  ├── selection
  │     ├── activeSlideId
  │     ├── activeObjectId
  │     ├── activeLayerId
  │     ├── selectedObjectIds[]
  │     ├── selectionPath[]          ← group traversal path
  │     └── selectionForProperties
  ├── settings.breakpoints
  └── clipboard

state.stage
  ├── zoom
  ├── pan { x, y }
  ├── stageTool          ← base tool (SELECT, PAN, DRAW, …)
  ├── activeStageTool    ← effective tool (may be overridden by space key)
  ├── previewState
  ├── selectedDevice     ← active breakpoint type
  ├── stageViewportSize
  ├── zoomFit
  ├── showSimplifiedLayerPanel
  ├── showSimplifiedPagesPanel
  └── forceRefreshRand   ← hack trigger for re-render

state.globals
  ├── appZoom            ← UI zoom (separate from stage zoom)
  ├── outlineColor
  ├── showGrid
  └── enableDeveloper
```

**Every top-level component (`StagePanelNew`, `StageLayer`, `StageObject`, `StageToolsCanvas`) independently calls `connect(mapStateToProps, …)`**, which means the same large state slice is subscribed to three times, causing triple re-renders on most state changes.

---

## 5. Coordinate Systems

This is the **hardest part** to understand. There are four coordinate spaces:

| Space | Description |
|---|---|
| Screen space | Raw browser pixel coordinates (`e.clientX`, `e.clientY`) |
| Viewport/stage space | Stage container-relative (after zoom/pan transform) |
| Layer space | Inside a layer element (absolute positioned) |
| Group-local space | Inside a group object (relative to group's origin, rotation, scale) |

### The group matrix

When an object is inside one or more groups, each group adds a `rotate(Xdeg) scale(Y)` transform layer. The utility `getGroupMatrixFromSelectionPath(selectionPath, objectById)` computes the **cumulative DOMMatrix** for the entire group ancestry.

This matrix is passed to `StageManager.start()` so the interaction engine can convert screen-space mouse deltas into group-local coordinate changes.

Key math functions in `stage-panel-utils.ts`:

- `decomposeMatrix2DW3(matrix)` — extracts `{translateX, translateY, rotateZ, scaleX, scaleY}` from a DOMMatrix
- `getGroupMatrixFromSelectionPath()` — computes the parent group chain matrix
- `screenPointToLocal(diff, localMatrix, rotation, scale)` — converts a screen-space delta to local space
- `createTransformForPath()` — builds CSS transform strings for each group in the path
- `getCorners()` — computes bounding box corner points given position, rotation, scale

---

## 6. Key Subsystems

### 6.1 Zoom/Pan (`useZoomPan`)

The hook manages the canvas transform with a **dual-update** strategy:

1. **Imperative (fast path):** sets CSS custom properties `--scale`, `--translateX`, `--translateY` directly on the container DOM element. The canvas element reads these with `transform: scale(var(--scale)) translate(var(--translateX), var(--translateY))` in SCSS.
2. **React state (slow path):** updates `canvasTransform` state, which triggers effects that sync to Redux.

Zoom input sources:
- **Mouse wheel + Ctrl** → zoom centered on cursor
- **Mouse wheel (no Ctrl)** → pan
- **Space + drag** → pan
- **Redux `zoomFit`** → fit zoom via `getInitialStageTransform()`
- **Redux `stageZoom` change** → `handleScaleChange()` zooms toward center

**Known sync issue:** `StagePanelNew` has a `disableZoomUpdateRef` that blocks zoom re-initialization after 2 seconds using `setTimeout`. This is a timing hack to prevent the initial zoom calculation from stomping user-initiated zoom.

### 6.2 Selection Model

Selection state lives in Redux. The `StageObject` component computes three boolean flags to decide if a mousedown should initiate a move operation:

```typescript
rootObjectSelection          // no selection → any top-level object is selectable
childObjectInGroupSelection  // a group is selected → its direct children become selectable
siblingObjectSelection       // an object is selected → siblings at the same level become selectable
```

`allowObjectSelection = rootObjectSelection || childObjectInGroupSelection || siblingObjectSelection`

When `allowObjectSelection` is true, mousedown on the object triggers `stageManager.start(MOVE, …)`.

The `selectionPath` array tracks the full path from the root through group ancestry to the active object. This is used throughout to compute group matrices.

### 6.3 Handle System (Resize + Rotation)

Handles are **not React-rendered**. They are imperative DOM nodes:

**`WithResizeHandle`:**
- In `useLayoutEffect`, finds the `resize-handle-holder-${id}` div by className
- Creates `<div>` elements for tl, tr, bl, br corners and optional width/height edge handles
- Attaches `mousedown` listeners that call `stageManager.start(SCALE, …)`
- On cleanup, removes the elements from DOM
- Visibility toggled by `isSelected && !forceHide && !object.isLocked`

**`WithRotationHandle`:**
- Finds the `.rotation-handle` element inside `object-holder-${id}` by querySelector
- Attaches `mousedown` → `stageManager.start(ROTATE, …)`

**`StageToolsCanvas`:**
- A **legacy/parallel** system that also creates resize handles imperatively
- Currently creates a `selection-rect` div that mirrors the selected object's screen position
- It reads the object's screen position from DOM (`getBoundingClientRect`) and positions itself accordingly
- **This overlaps with `WithResizeHandle`** — both systems create handles for the same object. The `StageToolsCanvas` version appears to be superseded.

### 6.4 StageManagerProvider (Interaction Engine)

This is the largest and most complex component. It:

1. Instantiates `StageManager` (from `utils/selection-manager/StageManager`) which abstracts mouse gesture recognition
2. Subscribes to `StageToolEvent` events emitted by the manager
3. On each event type, applies the interaction logic:

**MOVE event:**
- Takes the raw mouse delta
- Applies the inverse of the group matrix to convert screen delta → local delta
- Updates object `left`/`top` in Redux
- During drag: updates DOM imperatively (moves `object-holder-${id}` style directly)
- On drop: dispatches `updateObject` to Redux

**SCALE event:**
- Complex anchor-point math to scale from the correct corner
- Group-aware: scales relative to parent group's transform
- Updates `width`/`height` (and optionally `left`/`top` for anchor correction)
- Edge handles (`width`, `height`, `left`, `top`) allow single-axis resize

**ROTATE event:**
- Computes angle from center of object to current mouse position
- Subtracts the parent group's cumulative rotation
- Updates `rotation` in Redux

**PAN event:**
- Updates `useZoomPan`'s transform (via `setStagePan` dispatched to Redux)

### 6.5 Preview Mode

When `previewState.isPreview` is true:
- `StageLayer` rendering is replaced by `<AppPlayer />`
- `generatePlayerData()` converts the Redux project state into player format
- The `AppPlayer` component handles animation playback

---

## 7. Object Rendering Pipeline

For non-group objects, the content is rendered as:

```typescript
getObjectHtml(object, calculatedSize, false, false, breakpointConfig?.type)
```

This is the **same function used for HTML export**. It generates the object's markup/styles by calling the object type's registered render function from `webslider-sdk`. The result is injected via `dangerouslySetInnerHTML`.

**Implication:** Stage rendering is tightly coupled to the export pipeline. Changes to object rendering for export also affect stage display.

For **group objects**, children are recursively rendered via `<StageObject>` components.

Object position is applied via `useLayoutEffect`:

```typescript
objectHolder.style.transform = getObjectTransform(object);  // rotate + scale
// left/top applied via commonObjectRect in objectHolderStyle
```

But `left`/`top` also have a `Math.random() / 100` addition to force React to re-render the DOM even when the value hasn't changed — bypassing React's optimization. This is noted with "NOTO" comment in the code.

---

## 8. Known Issues and Code Smells

### Critical

1. **Triple Redux subscriptions** — `StagePanelNew`, `StageLayer`, `StageObject`, and `StageToolsCanvas` each independently call `mapStateToProps` on nearly identical state slices. Every store update triggers 4+ re-renders before any memoization kicks in.

2. **`Math.random()` position hack** — `StageObject.tsx:244-249` adds a tiny random offset to `left`/`top` to force React re-renders. This means objects are re-rendered on every render cycle regardless of whether they moved.

3. **Dual handle systems** — `StageToolsCanvas` and `WithResizeHandle` both create resize handles. Their responsibilities overlap and it's unclear which is authoritative.

4. **`StageToolsCanvas` reads DOM positions** — Instead of receiving position data from React, it queries `getBoundingClientRect()` on DOM elements and uses a `setTimeout(fn, 1)` to trigger re-render after selection changes. Race-condition prone.

5. **DOM className-based coupling** — Components find each other's DOM nodes by querying class names like `object-holder-${id}`, `resize-handle-holder-${id}`, `stage-tools-canvas`. This is fragile and breaks encapsulation.

### Structural

6. **`eslint-disable` at top of `StagePanelNew.tsx`** — Entire file bypasses all lint rules.

7. **Massive commented-out code** — Large blocks of dead code throughout all files (old PAN logic, old onObjectClick handlers, old pageBorderStyle calculations, old grid code, etc.).

8. **`StageManagerProvider` does too much** — It manages React context, Redux state, DOM manipulation, and complex matrix math all in one component. Should be decomposed.

9. **`utils.ts` global window store** — `window.DAAP.rotationInProgress` and `window.DAAP.mouseDownObjectId` are set but the reader calls are mostly commented out.

10. **`disableZoomUpdateRef` setTimeout hack** — A 2-second `setTimeout` that locks out Redux → zoom-transform sync after initial render.

11. **Hardcoded `IMAGE` type** — `StageObject.tsx:222-226` has `if (object.type === IMAGE)` applying a hardcoded `clipPath: url(#c123)` with no explanation.

12. **`StageLayer.mapStateToProps` re-derives `layerArr` and `slide`** — This computation is already done in `StagePanelNew.mapStateToProps`. Both components independently query the same data from the store.

13. **`forceRefreshRand`** — A random number in Redux state that exists only to trigger re-renders. Used as a `key` on `React.Fragment` in `StageObject`.

14. **`getObjectHtml()` called in render** — Calling the export HTML generator on every render is expensive, especially for complex objects. No memoization.

### Minor

15. `WithRotationHandle` exports `getAbsEl()` — a debug utility that appends red dots to the document body. Should not be in production.
16. `stage-panel-utils.ts` contains `getUngroupObjectsCalculationOld()` — superseded old implementation still in the file.
17. `StageManagerProvider` exports `degrees_to_radians()` — math utility leaked from wrong module.
18. Touch gesture handlers in `useZoomPan` reference `document.getElementById("yourCanvas")` — placeholder code left in.

---

## 9. Data Flow Summary

### Render path
```
Redux store
  → StagePanelNew.mapStateToProps
    → StageLayer.mapStateToProps (per layer)
      → StageObject.mapStateToProps (per object)
        → calculateObjectSize() → CSS styles
        → getObjectHtml() → dangerouslySetInnerHTML
```

### Interaction path (move example)
```
User mousedown on object-holder
  → StageObject.onMouseDown (if allowObjectSelection)
    → stageManager.start(MOVE, { mousePosition, contextMatrix, objectId, … })
      → StageManager mouse tracking begins
        → emits StageToolEvent(MOVE) on each mousemove
          → StageManagerProvider event handler
            → imperative DOM update (object-holder style.left/top)
      → emits StageToolEvent(MOVE, done=true) on mouseup
        → Redux dispatch: updateObject({ id, left, top })
```

### Zoom/pan path
```
Mouse wheel
  → useZoomPan wheel handler (native event, passive:false)
    → calculateNewTransform()
      → CSS custom properties updated imperatively
        → React state update → canvasTransform
          → StagePanelNew useEffect
            → Redux: setStageZoom(), setStagePan()
```

---

## 10. Refactoring Plan

This plan is ordered by impact and risk. Each phase should be self-contained.

### Phase 1 — Code Cleanup (Low Risk)

**Goal:** Remove dead code, add lint coverage, fix obvious smells.

- [ ] Remove all commented-out code blocks in all files
- [ ] Remove `/* eslint-disable */` from `StagePanelNew.tsx` and fix remaining lint issues
- [ ] Delete `getUngroupObjectsCalculationOld()` from `stage-panel-utils.ts`
- [ ] Remove `getAbsEl()` debug utility from `WithRotationHandle.tsx` (or move to a dev-only file)
- [ ] Remove the hardcoded `if (object.type === IMAGE)` clip path hack in `StageObject.tsx`
- [ ] Move `degrees_to_radians()` out of `StageManagerProvider` to `stage-panel-utils.ts`
- [ ] Remove `window.DAAP` global store (`utils.ts`) — replace with proper React refs or context
- [ ] Fix the `touchstart` handler that references `document.getElementById("yourCanvas")`
- [ ] Replace `forceRefreshRand` Redux field with a proper render trigger mechanism

### Phase 2 — Eliminate Dual Handle Systems (Medium Risk)

**Goal:** One clear, authoritative system for resize and rotation handles.

- [ ] Decide: `WithResizeHandle` is the authoritative system (it has the most complete implementation)
- [ ] Remove all handle creation code from `StageToolsCanvas.tsx`
- [ ] Simplify `StageToolsCanvas` to only render the selection rect overlay (or eliminate it entirely)
- [ ] The selection rect can be rendered as a React component using the already-available `style` computation
- [ ] Remove `handleRef`, `handleMouseMove`, `handleMouseUp`, `handlesRef` from `StageToolsCanvas`

### Phase 3 — Fix Object Position (Medium Risk)

**Goal:** Remove the `Math.random()` hack and establish a clean rendering contract.

- [ ] Understand why `Math.random()` was needed — likely because object style is applied imperatively in `useLayoutEffect` and React won't re-run it if deps haven't changed
- [ ] Remove `Math.random()` additions at `StageObject.tsx:244-249`
- [ ] Instead: ensure `useLayoutEffect` deps are correctly specified so it always runs when `left`/`top` change
- [ ] Consider: should `left`/`top` be applied via React style prop or imperatively? Pick one approach consistently

### Phase 4 — Redux Re-render Optimization (High Impact)

**Goal:** Reduce triple/quadruple re-renders per state update.

- [ ] Move to `useSelector` hooks instead of `connect(mapStateToProps)` — allows more granular subscriptions
- [ ] In `StageObject`, use separate selectors for: object data, selection state, stageZoom, breakpointConfig
- [ ] Memoize expensive computations: `calculateObjectSize()`, `getObjectHtml()` per object
- [ ] `StageLayer.mapStateToProps` should not re-derive `layerArr` — receive only what it needs (its layer's data)
- [ ] Consider using `React.memo` on `StageLayer` and `StageObject` with custom comparison
- [ ] Use `createSelector` (Reselect) for `layerArr` and other derived data

### Phase 5 — Decouple Object Rendering from Export (Medium Risk)

**Goal:** Stage rendering should not use the export HTML generator.

- [ ] Object types should register a `renderForStage()` function separate from `getObjectHtml()`
- [ ] `renderForStage()` can return JSX (not HTML string) to allow React-managed updates
- [ ] Initially `renderForStage()` can delegate to `getObjectHtml()` for backward compatibility
- [ ] This enables future optimizations like incremental object updates without full HTML regeneration

### Phase 6 — Decompose StageManagerProvider (High Risk)

**Goal:** Split the monolithic interaction handler into focused units.

- [ ] Extract `useMoveInteraction(stageManager, objectById, selectionPath)` hook
- [ ] Extract `useScaleInteraction(stageManager, objectById, selectionPath)` hook
- [ ] Extract `useRotateInteraction(stageManager, objectById, selectionPath)` hook
- [ ] Extract `usePanInteraction(stageManager)` hook
- [ ] `StageManagerProvider` becomes a thin coordinator that composes these hooks
- [ ] Each hook handles its own DOM updates and Redux dispatches

### Phase 7 — Clean Up Zoom/Pan Sync (Low-Medium Risk)

**Goal:** Remove timing hacks from zoom initialization.

- [ ] Remove `disableZoomUpdateRef` and the `setTimeout(fn, 2000)` hack
- [ ] Establish a clear initialization flow: on mount, compute initial transform and set it once
- [ ] Use a `hasInitialized` ref that tracks whether the user has interacted (locks out Redux-driven zoom resets)
- [ ] The zoom sync effects in `StagePanelNew` (3 separate `useEffect` blocks for zoom) should be consolidated into one clear effect

---

## 11. Key Relationships to Other Modules

- **`utils/selection-manager/StageManager`** — The imperative mouse gesture engine. `StageManagerProvider` is its React adapter.
- **`export/export-html.ts` (`getObjectHtml`)** — Called in `StageObject` render. Tightly coupled.
- **`store/actions/actions.ts`** — All Redux action creators used by this module are imported from here.
- **`store/helpers/calculateZoom.ts`** — `getInitialStageTransform`, `getZoom`, `getZoom2` — zoom calculation utilities.
- **`panels/stage-panel/StagePanelUtils.ts`** (`calculateObjectSize`) — Computes object CSS dimensions from breakpoint config.
- **`utils/tools/ToolsProvider.tsx`** (`ToolsContext`) — Provides `activeTool`, `activeObjectId`, `snapBounds`, `cursorStyle`.
- **`player/AppPlayer.tsx`** — Renders in preview mode, replacing the layer/object tree.
- **`webslider-sdk`** — Object type registry, common/transform style generators, object helpers.