# Stage Panel Analysis (v2)

Fresh analysis of `StagePanelNew` and all related files for refactoring.

---

## Directory Structure

```
src/panels/stage-panel-new/
├── StagePanelNewWrapper.tsx        (17 lines)   Entry point / context composition
├── StagePanelNew.tsx               (1046 lines) Main canvas engine
├── StageManagerProvider.tsx        (51KB+)      Event handling / tool lifecycle
├── CursorProvider.tsx              (109 lines)  Custom cursor overlay
├── StageLayer.tsx                  (176 lines)  Layer renderer
├── StageObject.tsx                 (561 lines)  Object renderer (leaf + group)
├── StageObjectMinimap.tsx          (348 lines)  Minimap renderer (WIP / dormant)
├── StageToolsCanvas.tsx            (488 lines)  Selection handles & overlays
├── WithResizeHandle.tsx            (18 lines)   Pass-through (non-functional)
├── WithRotationHandle.tsx          (47 lines)   Pass-through + debug util
├── normalize-group-utils.ts        (79 lines)   Group normalization math
├── stage-panel-utils.ts            (655 lines)  Matrix / transform utilities
├── utils.ts                        (18 lines)   window.DAAP global helpers
└── zoom-pan/
    └── useZoomPan.ts               (326 lines)  Zoom & pan hook
```

---

## Component Hierarchy

```
StagePanelNewWrapper
  └── StageManagerProvider  (Redux-connected, provides StageManagerContext)
        └── CursorProvider  (renders custom cursor div, no context)
              └── StagePanelNew  (Redux-connected, main canvas)
                    ├── StageLayer  (Redux-connected, one per layer)
                    │     └── StageObject  (Redux-connected, one per object)
                    │           ├── WithResizeHandle  (pass-through)
                    │           └── WithRotationHandle  (pass-through)
                    │                 └── object-holder-{id} (DOM node)
                    └── StageToolsCanvas  (Redux-connected, handles overlay)
```

---

## File-by-File Analysis

### StagePanelNewWrapper.tsx

Thin composition shell. Wraps StagePanelNew with `StageManagerProvider` and `CursorProvider`. No state, no props.

```tsx
<StageManagerProvider>
  <CursorProvider>
    <StagePanelNew />
  </CursorProvider>
</StageManagerProvider>
```

**Refactor note:** Fine as-is. Could accept an optional `className` prop if embedding is ever needed.

---

### StagePanelNew.tsx

The god component. ~1046 lines.

**Redux state consumed (mapStateToProps):**
```
appZoom, pages, layers, objects, stageZoom, stagePan, previewState,
layerArr, objectById, activeObjectId, selectedObjectIds, selectionParentId,
activeLayerId, viewPortSize, activeStageTool, stageTool, breakpointConfig,
settings, selectedDevice, breakpoints, showGrid, zoomFit, clipboard,
outlineColor, showSimplifiedLayerPanel, showSimplifiedPagesPanel, forceRefreshRand
```

**Redux actions dispatched:**
```
_setStagePreview, _updateObject, _activateObject, _selectObjects,
_overrideStageTool, _cancelOverrideStageTool, _setViewPortSize,
_selectForProperties, _setStageZoom, _setStagePan, _ungroupObject,
_groupObjects, _duplicateObjects, _deleteObjects, _cutToClipboard,
_copyToClipboard, _pasteObjectsFromClipboard, _setZoomFit, _forceRefresh,
_clearClipboard
```

**Hooks:**
- `useKeyDown()` — detects Space key for pan mode
- `useZoomPan({ spaceDown })` — CSS variable-based zoom/pan
- `useWindowSize()` — triggers viewport update on resize
- `useHotkeys()` — Blueprint.js keyboard shortcuts

**Local state:**
```typescript
customBPWidth: number | undefined
manualProgress: number          // preview playback position
isLocalPan: boolean
disableZoomUpdateRef: useRef<boolean>
stagePanelElementRef: useRef<HTMLDivElement>
stageElementRef: useRef<HTMLDivElement>
```

**Keyboard shortcuts registered:**
| Key | Action |
|-----|--------|
| Cmd+G | Group / ungroup selected |
| Cmd+D | Duplicate selected |
| Del / Backspace | Delete selected |
| Cmd+X | Cut |
| Cmd+C | Copy |
| Cmd+V | Paste |
| Esc | Clear clipboard |

**Rendered DOM shape:**
```jsx
<ContextMenuBP>
  <div.StagePanel>
    <div.pan-and-zoom>          ← zoom/pan container (CSS vars)
      <div.scrollableHolder>
        <div.canvas>            ← actual stage area
          {isPreview ? <AppPlayer /> : layerArr.map(StageLayer)}
        </div>
        <div.outline />         ← stage border
        <div.stage-tools-canvas>
          <StageToolsCanvas />  ← selection handles
        </div>
      </div>
      <div.MainToolCanvas />    ← editing canvas (hidden)
    </div>
    {showMarginsDiv && <div.marginBorder />}
  </div>
</ContextMenuBP>
```

**Responsibilities (mixed concerns):**
1. Viewport sizing + zoom-fit initialization
2. Space key → PAN tool override
3. Zoom/pan via `useZoomPan` + Redux sync
4. Stage click → object deselection
5. Hotkeys: group, duplicate, delete, cut/copy/paste
6. Preview mode toggle (renders AppPlayer)
7. Breakpoint/device preview width

**Refactor opportunities:**
- [x] Extract hotkeys block into `useStageHotkeys(dispatch, ...)`
- [x] Extract zoom-fit logic into `useZoomFit(stageElementRef, viewPortSize, breakpointConfig, zoomFit)`
- [x] Extract preview mode branching into a `StagePanelCanvas` sub-component
- Reduce mapStateToProps — several selectors (`layerArr`, `objectById`) should be memoized in separate selector files

---

### StageManagerProvider.tsx

Central event hub for all tool interactions (move, scale, rotate, pan). Bridges the `StageManager` class (external event emitter) with Redux state updates.

**Context provided:**
```typescript
StageManagerContext: {
  stageManager: StageManager;
  afterDomUpdateRef: React.MutableRefObject<(() => void) | null>;
}
```

**Tool event lifecycle per tool:**
Each tool fires: `start → change* → stop`

```
MOVE:   processMoveStartEvent   → processMoveChangeEvent   → (stop cleans up)
SCALE:  processScaleStartEvent  → processScaleChangeEvent  → (stop cleans up)
ROTATE: processRotateStartEvent → processRotateChangeEvent → (stop cleans up)
PAN:    —                       → processPanChangeEvent    → (stop cleans up)
```

**Key patterns:**
- `selectedObjectIdsRef` — mutable ref always tracking current selection
- `recentlySelectedRef` — distinguishes first-click-select from second-click-drag
- `afterDomUpdateRef` — callback invoked synchronously after DOM mutations so `StageToolsCanvas` can reposition handles in the same event loop

**Utilities called internally:**
- `getGroupMatrixFromSelectionPath()` — combined parent transform matrix
- `getLayerIdRec()` — walks object hierarchy to find layer
- `degrees_to_radians()` — angle conversion
- `cloneDeep()` (lodash) — deep-clones objects before mutation

**Refactor opportunities:**
- [x] The file is very large; each `process*Event` family could move to its own module, e.g. `move-handler.ts`, `scale-handler.ts`, `rotate-handler.ts`
- `afterDomUpdateRef` pattern is clever but fragile — document the timing contract clearly
- Replace `cloneDeep` with structured clones or immer for predictable mutations

---

### CursorProvider.tsx

Renders a custom cursor `<ins>` element that follows the mouse, sized and styled per the active tool.

**Reads from `ToolsContext`:**
- `cursorStyle: { size: number; style: CSSProperties } | null`
- `appZoom: number`
- `activeTool: boolean`

**State:**
```typescript
mousePosition: { x, y }
cursor: string | undefined       // shape name
visible: boolean
stageRect: { x, y }             // stage element origin
```

**Logic:**
1. `mousemove` listener tracks `mousePosition`
2. Hides cursor when over `.no-custom-cursor` elements
3. Sizes cursor: `appZoom * cursorStyle.size`
4. Offsets position by `stageRect` to stay relative to stage

**Refactor note:** ~~`CursorContext` was removed~~ — `CursorProvider` now renders the cursor div directly without a context wrapper. `ICursorContext` and `CursorContext` exports deleted; dead imports cleaned from `ToolsProvider.tsx`.

---

### StageLayer.tsx

Renders one layer — a container holding all objects in `layer.objectIds`.

**Key props:**
```typescript
layer: ILayer
objectById: { [id: string]: IObject }   // from Redux
forceShowLayerId: string | null          // from Redux (forces visibility)
breakpointConfig: BreakpointConfiguration
```

**Layout support:**
- Detects `layer.properties.hasLayoutChildren`
- Supports `row` / `column` flex layouts
- Injects dynamic `<style>` for gap CSS (Blueprint limitation workaround)
- Alignment: `align-items`, `justify-content`, `flex-wrap`

**Perspective support:**
```typescript
if (layer.transform?.hasPerspective) {
  layerHolderStyle.perspective = layer.transform.transformPerspective;
}
```

**Render:**
```tsx
<div style={layerHolderStyle}>
  <style>{layerCss}</style>
  <div className={`layer-${layer.id}`} style={layerStyle}>
    {layer.objectIds.map(objectId => (
      <StageObject key={objectId} object={objectById[objectId]} layer={layer} ... />
    ))}
  </div>
</div>
```

**Refactor note:** The injected `<style>` block for flex gap is a workaround. If migrating to a newer CSS approach is possible, this can be removed. `calculateObjectSize` is called inside render — candidate for memoization.

---

### StageObject.tsx

Renders individual objects (leaves and recursive groups). Most complex component after `StagePanelNew`.

**Props:**
```typescript
object: IObject
layer: ILayer
layoutChildren?: ILayoutChildrenValue
objectZoom: number
parentGroup?: IObject
```

**Redux state consumed:**
```
selectedObjectIds, selectionPath, activeEditObjectId, objectById, layerById,
stageZoom, appZoom, activeStageTool, breakpointConfig
```

**Internal refs:**
```typescript
childRef: HTMLDivElement          // object-holder DOM node
objectRef: useRef                 // cached object for rotation/scale ops
transformArrayRef: useRef         // cached parent group transforms
mouseInitialPos: useRef<Point>
mouseDiffPos: useRef<Point>
```

**Selection logic:**

Five conditions determine if this object is interactable:
| Condition | Meaning |
|-----------|---------|
| `rootObjectSelection` | No selection, object is top-level in layer |
| `childObjectInGroupSelection` | One selected parent that contains this object |
| `siblingObjectSelection` | Object is selected, its parent is the current selection parent |
| `isSelected` | Object is in `selectedObjectIds` |
| `isInSelectionPath` | Object is an ancestor of the selected object |

`allowObjectSelection = OR of above`

**Critical transform application (useLayoutEffect):**
```typescript
// Runs after every render affecting rotation/scale/id
const objectHolder = document.querySelector(`.object-holder-${object.id}`);
objectHolder.style.transform = getObjectTransform(object);   // "rotate(Xdeg) scale(X)"
objectHolder.style.visibility = activeEditObjectId === objectId ? "hidden" : "visible";
```

This runs imperatively on the DOM node rather than via React style props — intentional for animation performance.

**Mouse interaction (onMouseDown):**
```typescript
1. Build object path: populateObjectThreeIds(path, object.id, objectById, layerById)
2. Get parent matrix: getGroupMatrixFromSelectionPath([...path, object.id], objectById)
3. Start tool: stageManager.start(StageToolEnum.MOVE, {
     boundingClientRects: [childRef.current.getBoundingClientRect()],
     mousePosition: getMousePosition(e),
     contextMatrix: groupsMatrix,
     objectRotation, objectScale, objectId, isLocked
   })
```

**Group rendering (recursive):**
```tsx
if (object.type === "group") {
  return (
    <div className={`group-object ...`} style={groupStyle}>
      {object.objectIds.map(childId => (
        <StageObject key={childId} object={objectById[childId]}
          layer={layer} parentGroup={object} ... />
      ))}
    </div>
  );
}
```

**Mask support:**
- SVG clip-path: `url(#${clipMaskId})`
- Calls `getClipMaskFromSvg()` to render `<defs>` block
- Hard-coded `c123` check for image clip (technical debt)

**Object HTML render:**
```tsx
<div dangerouslySetInnerHTML={{
  __html: getObjectHtml(object, size, false, false, type) || getObjectPlaceholder(message)
}}/>
```

**Refactor opportunities:**
- [x] Split group vs leaf rendering into `StageGroupObject` / `StageLeafObject`
- Remove the `c123` hardcoded clip check
- Replace global `document.querySelector` with a callback ref or `useImperativeHandle`
- The 5-condition `allowObjectSelection` logic deserves its own selector or utility function
- `transformArrayRef` / `useDeepCompareEffect` combo is complex; consider deriving transforms purely in render

---

### StageToolsCanvas.tsx

Renders the selection overlay (resize handles, rotation handle, selection outline) on top of the canvas. Does not affect layout.

**Constants:**
```typescript
HANDLE_SIZE = 15
ROTATION_HANDLE_GAP = 4
handleColor = "#48aff0"
```

**Refs:**
```typescript
holderRef: useRef<HTMLDivElement>               // primary selection overlay
secondaryRefs: useRef<Map<string, HTMLDivElement>> // secondary selections
positionAllRef: useRef<() => void>              // stable ref to positionAll()
```

**Core function — `positionOverlay(objectId, overlayEl)`:**
1. Find `.object-holder-{id}` in DOM
2. Find `.stage-tools-canvas` in DOM
3. Build selection path → get parent group matrix (no translation)
4. Get object's computed CSS transform (rotate/scale)
5. Multiply: `parentMatrix * objectDOMMatrix`
6. Calculate bounding rect relative to canvas
7. Apply overlay position + set CSS vars:
   - `--hs`: handle size, scaled by zoom
   - `--hw`: handle border width, scaled by zoom

**Handle rendering (primary selection only):**
```
[rotation handle]   ← top center, circular
[tl] ──────── [tr]
 │               │
[bl] ──────── [br]
+ conditional edge handles (width / height) when not rotated
```

**Handle mouse handlers:**
```typescript
handleScaleMouseDown(e, handle: "tl"|"tr"|"bl"|"br"|"width"|"height")
  → stageManager.start(StageToolEnum.SCALE, { handle, ... })

handleRotateMouseDown(e)
  → stageManager.start(StageToolEnum.ROTATE, { ... })
```

**Timing contract (important):**

```
StageObject.useLayoutEffect runs
  → applies CSS transform to .object-holder-{id}
  → StageManagerProvider sets afterDomUpdateRef.current = positionAll
  → positionOverlay reads DOM bounding box
  → All in same microtask — no race condition
```

For non-drag updates (e.g., zoom change):
```typescript
useLayoutEffect(() => {
  const timerId = setTimeout(() => positionAllRef.current(), 1);
  return () => clearTimeout(timerId);
}, [selectedObjectIds, objectById, ...]);
```
1ms delay ensures `StageObject.useLayoutEffect` has already applied transforms.

**Secondary selection cleanup:**
```typescript
useEffect(() => {
  const currentIds = new Set(selectedObjectIds.slice(1));
  for (const id of secondaryRefs.current.keys()) {
    if (!currentIds.has(id)) secondaryRefs.current.delete(id);
  }
}, [selectedObjectIds]);
```

**Refactor opportunities:**
- Extract handle rendering into `<SelectionHandles>` sub-component
- Extract `positionOverlay` math into a pure utility function (easier to test)
- The 1ms `setTimeout` is fragile — investigate replacing with `useLayoutEffect` dependency ordering or `flushSync`

---

### StageObjectMinimap.tsx

Renders objects for minimap. Currently minimal, heavy commented sections. Status: dormant / WIP.

**Refactor note:** Either complete the implementation or delete and recreate from scratch when minimap is prioritized.

---

### WithResizeHandle.tsx / WithRotationHandle.tsx

Both are pure pass-through wrappers:
```tsx
export function WithResizeHandle({ children }) { return <>{children}</>; }
export function WithRotationHandle({ children }) { return <>{children}</>; }
```

`WithRotationHandle` also exports `getAbsEl()` — a debug utility that creates a red positioned div for visualizing rotation points.

**Refactor note:** Both files can be deleted. The handles are fully implemented in `StageToolsCanvas`. If `getAbsEl` is still used for debugging, move it to a `debug-utils.ts`.

---

### useZoomPan.ts

Hook that manages the canvas zoom and pan state, applying values as CSS custom properties on the parent element.

**Signature:**
```typescript
useZoomPan({ spaceDown: boolean }) → {
  setRefs(parentElementRef, targetElementRef): void,
  transformRef: MutableRefObject<TransformType>,
  canvasTransform: TransformType,
  setTransform(transform: Partial<TransformType>): void,
  handleScaleChange(scale: number): void,
}
```

**State shape:**
```typescript
type TransformType = {
  scale: number;
  translateX: number;
  translateY: number;
};
```

**CSS variables set on parent element:**
```css
--scale: {scale}
--translateX: {translateX}px
--translateY: {translateY}px
```

**Event handling:**
| Trigger | Behavior |
|---------|----------|
| Ctrl + wheel | Zoom toward cursor |
| Wheel (no Ctrl) | Pan (X/Y scroll) |
| Space + mousedown/move | Pan drag |
| Two-finger touch | Pan detection (zoom not yet implemented) |

**Core algorithm — `calculateNewTransform()`:**
```typescript
new DOMMatrix()
  .translate(panX, panY)
  .translate(x, y)
  .translate(currentTranslateX, currentTranslateY)
  .scale(scaleDiff)
  .translate(-x, -y)
  .scale(currentScale)
```
Zoom-toward-cursor is achieved by translating to the cursor point, scaling, then translating back.

**Scale limits:** `MIN_SCALE = 0.1`, `MAX_SCALE = 10`

**Refactor opportunities:**
- Touch pinch-to-zoom is detected but not implemented — add or remove the dead code
- `setRefs` pattern is non-standard; consider accepting refs as parameters to the hook instead
- Sync to Redux (`_setStageZoom`, `_setStagePan`) happens inside `StagePanelNew` as a `useEffect` watching `canvasTransform` — the boundary of responsibility is unclear; document or consolidate

---

### stage-panel-utils.ts

Pure math/transform utilities. 655 lines.

**Key exports:**

| Function | Purpose |
|----------|---------|
| `decomposeMatrix2DW3(m)` | Decompose DOMMatrix → `{ translateX, translateY, rotateZ, scaleX, scaleY }` |
| `createTransformForPath(groupsPath, objectById, config)` | Build array of `"rotate(Xdeg) scale(X)"` strings for group hierarchy |
| `getFullMatrixFromTransformArr(arr)` | Multiply array of CSS transform strings → single DOMMatrix |
| `getGroupMatrixFromSelectionPath(selectionPath, objectById, opts)` | Combined parent matrix from selection path |
| `screenPointToLocal(diff, localMatrix, rotation, scale)` | Convert screen-space delta → local object space |
| `getObjectBBoxRelativeToParent(rotate, scale, left, top)` | Bounding box relative to parent |
| `getObjectTransform(object, override)` | CSS transform string: `"rotate(Xdeg) scale(X)"` |
| `getCorners(x, y, w, h, R, scale)` | 4 corner positions after rotation + scale |
| `getLeftTopFromCorners(corners)` | Min X/Y from corners |
| `getBottomRightFromCorners(corners)` | Max X/Y from corners |

**Debug utilities (should be removed or moved):**
- `tmpDrawNewGroup()` — renders a red debug rectangle
- `addCornerMarkers()` / `removeCornerMarkers()` — renders corner debug dots
- `removeElementByClass()`, `getElementByClass()`, `getElementBySelector()` — DOM helpers

**Refactor note:**
- Separate pure math functions from DOM debug utilities
- `decomposeMatrix2DW3` has a complex sign-flip branch — add inline comments explaining the math

---

### normalize-group-utils.ts

Single exported function: `normalizeGroup()`.

**Purpose:** After objects in a group are moved/rotated independently, this resets the group bounding box to match the visual bounds, and re-calculates child positions relative to the new group origin. Called on ungroup/regroup operations.

**Algorithm:**
1. Call `getUngroupObjectsCalculation()` — decomposes parent transforms into absolute child positions
2. Collect bounding box of all children
3. Re-set child `left`/`top` relative to new group origin
4. Set group `left`, `top`, `width`, `height` from bounding box
5. Reset group `rotation = 0`, `scale = 1`

**Returns:** `{ objects: IObject[]; group: IObject }`

**Refactor note:** Small and self-contained — keep as-is. Add JSDoc comments for the two-phase algorithm.

---

### utils.ts

```typescript
export function setGlobalProp<T>(
  prop: "rotationInProgress" | "mouseDownObjectId", value: T
): void

export function getGlobalProp<T>(
  prop: "rotationInProgress" | "mouseDownObjectId"
): T
```

Uses `window.DAAP` as a mutable global bag for cross-component state.

**Refactor note:** Both props should be moved to React context or a ref passed through `StageManagerContext`. `window.DAAP` is untestable and creates hidden coupling.

---

## Cross-Cutting Concerns

### Transform / Matrix Pipeline

Objects support nested groups. The effective screen position of any object requires composing all ancestor transforms:

```
effectiveMatrix = group1.matrix × group2.matrix × ... × object.matrix
```

This is assembled by:
1. `createTransformForPath()` — builds per-level `"rotate(X) scale(X)"` strings
2. `getFullMatrixFromTransformArr()` — multiplies them into a single `DOMMatrix`
3. `getGroupMatrixFromSelectionPath()` — the top-level entry point used throughout the codebase

### The `afterDomUpdateRef` Pattern

`StageToolsCanvas` must read object DOM positions **after** `StageObject` has applied CSS transforms. The mechanism:

1. `StageObject.useLayoutEffect` writes to `.object-holder-{id}.style.transform`
2. `StageManagerProvider` stores `positionAll` as `afterDomUpdateRef.current`
3. Tool stop handlers call `afterDomUpdateRef.current()` synchronously, so handles reposition in the same tick

This is a timing contract. Breaking it (e.g. moving transform application to `useEffect`) would cause handles to lag.

### Global State via `window.DAAP`

Two values are currently stored globally:
- `rotationInProgress` — prevents selection events during rotation
- `mouseDownObjectId` — tracks which object initiated a mousedown

Both are read/written from multiple components. This should be unified into `StageManagerContext`.

---

## Issues & Refactoring Priorities

### High Priority

1. **`StagePanelNew` is too large (~1046 lines)**
   - [x] Extract `useStageHotkeys(...)` hook
   - [x] Extract `useZoomFit(...)` hook
   - [x] Extract `StagePanelCanvas` sub-component
   - Reduce `mapStateToProps` with memoized selectors

2. **`window.DAAP` globals**
   - `rotationInProgress` and `mouseDownObjectId` should be in `StageManagerContext`

3. **`StageManagerProvider` is too large**
   - [x] Split event handlers into `move-handler.ts`, `scale-handler.ts`, `rotate-handler.ts`
   - [x] Each file: `processStart`, `processChange`, `processStop`

4. **`StageObject` selection conditions are implicit**
   - Extract `getObjectSelectionState(object, selectedObjectIds, selectionPath, ...)` into a selector
   - Returns a typed result instead of five separate booleans

### Medium Priority

5. **`WithResizeHandle` / `WithRotationHandle` are no-ops**
   - Delete both files (functionality lives in `StageToolsCanvas`)
   - Move `getAbsEl` debug util to `debug-utils.ts` if still needed

6. **`StageObject` group vs leaf rendering**
   - [x] Extract `StageGroupObject` component for group recursion
   - [x] Extract `StageLeafObject` component for leaf rendering
   - `StageObject` now delegates to one of the two via a simple ternary

7. **`positionOverlay` math in `StageToolsCanvas`**
   - Extract into a pure function in `stage-panel-utils.ts`
   - Makes it independently testable

8. **`c123` hardcoded clip check in `StageObject`**
   - Should be a proper type check or property flag on `IObject`

9. **`CursorContext` is empty**
   - [x] Remove the context — `CursorProvider` now renders the cursor div directly
   - [x] Keep `CursorProvider` as a rendering component only

### Low Priority

10. **Debug utilities in `stage-panel-utils.ts`**
    - Move `tmpDrawNewGroup`, `addCornerMarkers`, `removeCornerMarkers` to `debug-utils.ts` or delete

11. **`StageObjectMinimap.tsx`**
    - Complete or delete; currently dormant

12. **Touch zoom**
    - `useZoomPan` detects two-finger but does not implement pinch zoom — complete or remove dead code

13. **Memoize expensive selectors**
    - `layerArr`, `objectById` derived in `mapStateToProps` without `reselect`
    - Causes unnecessary re-renders on unrelated state changes

---

## Data Flow Summary

### Object Selection

```
User clicks .object-holder-{id}
  → StageObject.onMouseDown
    → populateObjectThreeIds() — builds ancestry path
    → getGroupMatrixFromSelectionPath() — parent transform matrix
    → stageManager.start(MOVE, { objectId, matrix, ... })
  → StageManagerProvider.processMoveStartEvent
    → _activateObject(objectId)
    → _selectObjects([objectId])
    → _selectForProperties(...)
  → Redux updates → components re-render
  → StageToolsCanvas.positionAll() via afterDomUpdateRef
```

### Object Drag (Move)

```
User moves mouse after mousedown
  → StageManager emits MOVE change event
  → StageManagerProvider.processMoveChangeEvent
    → screenPointToLocal(diff, localMatrix) — converts to object space
    → _updateObject({ ...object, left: newLeft, top: newTop })
  → Redux updates
  → StageObject re-renders → useLayoutEffect applies new CSS transform
  → afterDomUpdateRef.current() → StageToolsCanvas repositions handles
```

### Zoom / Pan

```
User Ctrl+scrolls
  → useZoomPan wheel handler
  → calculateNewTransform() — DOMMatrix multiply
  → setCanvasTransformInternal() — updates CSS vars immediately
  → useEffect in StagePanelNew syncs to Redux:
      _setStageZoom(scale), _setStagePan({ x, y })
  → StageToolsCanvas re-runs positionAll on next useLayoutEffect
```

---

## Dependency Map

### External packages used across these files

| Package | Usage |
|---------|-------|
| `react-redux` | `connect()` in StagePanelNew, StageLayer, StageObject, StageToolsCanvas |
| `@blueprintjs/core` | `useHotkeys`, `ContextMenu` in StagePanelNew |
| `classnames` | `cx()` in StageObject, StageToolsCanvas |
| `lodash-es` | `cloneDeep`, `remove`, `includes`, `last`, `forOwn` in StageManagerProvider |
| `use-deep-compare-effect` | `useDeepCompareEffect` in StageObject |
| `react-use-error-boundary` | `withErrorBoundary` wrapping StageObject |
| `webslider-sdk` | `IObject`, `ILayer`, `BreakpointConfiguration`, object definitions |

### Internal modules consumed

| Module | Consumers |
|--------|-----------|
| `utils/selection-manager/StageManager` | StageManagerProvider, StageObject, StageToolsCanvas |
| `utils/tools/ToolsProvider` (ToolsContext) | CursorProvider, StageManagerProvider |
| `player/AppPlayer` | StagePanelNew |
| `export/export-html` (generatePlayerData, getObjectHtml) | StagePanelNew, StageObject |
| `panels/context-menu/ContextMenu` | StagePanelNew |
| `stage-panel-utils.ts` | StageObject, StageToolsCanvas, StageManagerProvider, normalize-group-utils |

---

## Component Status Summary

| File | Status | Lines | Action |
|------|--------|-------|--------|
| StagePanelNewWrapper.tsx | Stable | 17 | No change |
| StagePanelNew.tsx | Needs split | 1046 | Extract hooks, reduce props |
| StageManagerProvider.tsx | Needs split | 51KB | Split by tool type |
| CursorProvider.tsx | OK | 109 | Remove empty context |
| StageLayer.tsx | OK | 176 | Memoize size calc |
| StageObject.tsx | Complex | 561 | Split group/leaf, extract selector |
| StageToolsCanvas.tsx | OK | 488 | Extract positionOverlay math |
| StageObjectMinimap.tsx | Dormant | 348 | Complete or delete |
| WithResizeHandle.tsx | Dead code | 18 | Delete |
| WithRotationHandle.tsx | Dead code | 47 | Delete (move getAbsEl if needed) |
| useZoomPan.ts | OK | 326 | Complete touch or remove dead code |
| stage-panel-utils.ts | Mixed | 655 | Separate math from debug utils |
| normalize-group-utils.ts | OK | 79 | Add JSDoc |
| utils.ts | Anti-pattern | 18 | Replace with context |
