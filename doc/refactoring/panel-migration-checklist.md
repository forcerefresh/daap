# Panel Layout Migration Checklist (Phase 3C)

## Standard Components

| Component | Path | When to use |
|-----------|------|-------------|
| `PanelShell` | `src/panels/common/panel-shell/PanelShell.tsx` | Left-side panels with fixed header + scrollable body; supports `title` and `actions` slots |
| `PanelHeader` | `src/panels/common/panel-header/PanelHeader.tsx` | Left-side panels that need a fully custom header (multiple child regions) |
| `RightPanelHeader` | `src/panels/common/panel-header/PanelHeader.tsx` | Right-side drawer panels (different background, same title slot) |

---

## Migration Status

### ✅ Migrated — title prop

These panels used `<RightPanelHeader><div>TEXT</div></RightPanelHeader>` and are now `<RightPanelHeader title="TEXT" />`:

| Panel | File |
|-------|------|
| LayoutsPanel | `src/panels/layouts-panel/LayoutsPanel.tsx` |
| MyTemplatesPanel | `src/panels/my-templates-panel/MyTemplatesPanel.tsx` |

---

### 🔲 Pending — trivial: title only, no actions

These still wrap a plain text node in `<RightPanelHeader>`. Safe to change to `title` prop.

| Panel | File | Current pattern |
|-------|------|----------------|
| CreatePanel | `src/panels/create-panel/CreatePanel.tsx` | `<RightPanelHeader><div>CREATE DOCUMENT</div></RightPanelHeader>` |
| ExportPanel | `src/panels/export-panel/ExportPanel.tsx` | `<RightPanelHeader><div>EXPORT DOCUMENT</div></RightPanelHeader>` |
| ExtensionsPanel | `src/panels/extensions-panel/ExtensionsPanel.tsx` | `<RightPanelHeader><div>EXTENSIONS</div></RightPanelHeader>` |
| ProjectsPanel | `src/panels/projects-panel/ProjectsPanel.tsx` | `<RightPanelHeader><div>DOCUMENTS</div></RightPanelHeader>` |
| SavePanel | `src/panels/save-panel/SavePanel.tsx` | `<RightPanelHeader><div>SAVE DOCUMENT</div></RightPanelHeader>` |

---

### 🔲 Pending — complex: title + action buttons (use PanelShell)

These panels have both a title and action buttons. They should migrate to `<PanelShell title="..." actions={...}>` rather than `PanelHeader`.

| Panel | File | Notes |
|-------|------|-------|
| SlidesPanel | `src/panels/slides-panel/SlidesPanel.tsx` | Title "PAGES" + add-page button + more-menu button |
| LayersPanel | `src/panels/layers-panel/LayersPanel.tsx` | Title + layer add/options buttons |
| ActionPanel | `src/panels/action-panel/ActionPanel.tsx` | Custom header with multiple regions |

---

### ⏭ Skip — commented-out or no header

| Panel | File | Reason |
|-------|------|--------|
| PropertiesPanelAll | `src/panels/properties-panel-all/PropertiesPanelAll.tsx` | Header commented out intentionally |

---

## How to migrate a simple title-only panel

Replace:
```tsx
<RightPanelHeader>
  <div>PANEL NAME</div>
</RightPanelHeader>
```

With:
```tsx
<RightPanelHeader title="PANEL NAME" />
```

## How to migrate a title + actions panel

Replace:
```tsx
<PanelHeader>
  <div>TITLE</div>
  <div>
    <Button ... />
  </div>
</PanelHeader>
```

With:
```tsx
<PanelShell title="TITLE" actions={<><Button ... /></>}>
  {/* scrollable body content */}
</PanelShell>
```

Note: `PanelShell` wraps the entire panel (header + body) — move body content inside it.
