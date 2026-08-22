# Extensions vs Plugins

## Overview

Extensions and plugins are both mechanisms for adding functionality to daap at runtime without modifying the core app. They follow the same two-API pattern but serve different purposes and register into different systems.

---

## API Pattern (identical for both)

| | Extensions | Plugins |
|---|---|---|
| Catalog (what exists) | `GET /api/v1/available-extensions` | `GET /api/v1/available-plugins` |
| Installation record (what user installed) | `GET /api/v1/extensions` | `GET /api/v1/plugins` |
| Install | `POST /api/v1/extensions` | `POST /api/v1/plugins` |
| Uninstall | `DELETE /api/v1/extensions/:id` | `DELETE /api/v1/plugins/:id` |
| Serve bundle | `GET /api/v1/public/public-extensions/:type/:version/:filename` | `GET /api/v1/public/public-plugins/:type/:version/:filename` |
| Upload custom | via media system (`type=extension`) | `POST /api/v1/plugins/upload` |

### Source of truth split

**`/available-extensions` and `/available-plugins`** — the catalog. Hardcoded on the server (no DB). Describes what is available to install. Think of it as an app store listing.

**`/extensions` and `/plugins`** — the installation record. Stored in the DB, scoped to `userUid`. Describes what *this specific user* has installed. This is what gets loaded at app startup.

---

## Runtime flow

### App startup
1. `ToolbarPanel` mounts → calls `loadPlugins()` / extensions loading
2. Both call their respective `GET` installation-record endpoints
3. For each installed item, a `<script>` tag is injected into `<head>` with the bundle URL
4. The bundle self-registers on `window.WebSlider_GlobalScope`
5. `registerPlugin()` / `registerExternalObject()` picks it up

### Install flow (user clicks Install in the panel)
1. Client POSTs to `/api/v1/plugins` or `/api/v1/extensions` → creates DB row
2. Client immediately loads the script and registers it (no page reload needed)

### Uninstall flow
1. Client DELETEs the DB row
2. Client calls `unregisterPlugin(type)` / `unregisterObject(type)` to remove from the runtime registry
3. Toolbar button / object disappears

---

## Key differences

| | Extensions | Plugins |
|---|---|---|
| Purpose | Add new object types or animation effects | Add full UI features (drawer panel + toolbar button) |
| Bundles per item | Two: `-app.js` (editor) + `-player.js` (player) | One: single bundle |
| Registers into | Object registry / Animation registry | Plugin registry |
| Runtime surface | Canvas objects, property panels, animations | Toolbar button → full-screen drawer |
| Files stored | `uploads/extensions/:type/:version/` | `uploads/plugins/:type/:version/` |

---

## Self-registration contract

### Extension bundle (`-app.js`)
```ts
// called by the bundle on load
window.WebSlider_GlobalScope.registerExternalObject(appObjectDefinition);
```

### Plugin bundle
```ts
// called by the bundle on load
window.WebSlider_GlobalScope.plugins["type-version"] = pluginDefinition;
// daap then calls registerPlugin(def) after script load
```

---

## UI entry points

- **Extensions**: `ExtensionsPanel` opened via `OPEN_EXTENSIONS` window event or from the main header
- **Plugins**: `PluginsPanel` opened via the cube icon button in the left toolbar, or `OPEN_PLUGINS` window event

---

## File locations (daap)

```
src/integration/hooks/
  extensions-hook/saas-use-extensions-hook.tsx   ← extension API calls
  plugins-hook/saas-use-plugins-hook.tsx          ← plugin API calls

src/panels/
  extensions-panel/ExtensionsPanel.tsx            ← browse & install extensions
  my-extensions-panel/MyExtensionsPanel.tsx       ← upload local extension bundles
  plugins-panel/PluginsPanel.tsx                  ← browse, install & upload plugins
```

## File locations (daap-server)

```
src/api/paths/
  available-extensions.ts     ← hardcoded extension catalog
  available-plugins.ts        ← hardcoded plugin catalog
  extensions.ts               ← GET/POST installed extensions
  plugins.ts                  ← GET/POST installed plugins
  plugins/{id}.ts             ← DELETE plugin
  plugins/upload.ts           ← upload plugin .js bundle
  public/public-extensions/   ← serve extension bundles
  public/public-plugins/      ← serve plugin bundles

src/api/services/
  extension-service.ts
  plugin-service.ts
```
