import {
  Button,
  Icon,
  Popover,
  PopoverInteractionKind,
  Portal,
  Text,
} from "@blueprintjs/core";
import cx from "classnames";
import React, { useContext, useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import AddPanel from "../add-panel/AddPanel";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import SettingsPanel from "../settings-panel/SettingsPanel";

import {
  decreaseStageZoom,
  increaseStageZoom,
  doUndo,
  doRedo,
  setZoomFit,
} from "../../store/actions/actions";
import FontPreviewPanel from "../font-preview-panel/FontPreviewPanel";
import MediaLibraryPanel from "../media-library/MediaLibraryPanel";
import { getZoom } from "../../store/helpers/calculateZoom";
import { IntegrationContext } from "../../integration";
import { FREE_DRAW } from "../../objects/free-draw/free-draw";
import { ToolsContext } from "../../utils/tools/ToolsProvider";
import { HelpMenu } from "./HelpMenu";

import AddObjectIcon from "./assets/add-object-icon.svg?react";
import MediaLibraryIcon from "./assets/media-library-icon.svg?react";
import TextIcon from "./assets/text-icon.svg?react";
import FontPairingIcon from "./assets/font-pairing-icon.svg?react";

import FreeDrawIcon from "./assets/free-draw-icon.svg?react";
import HelpIcon from "./assets/help-icon.svg?react";
import BulbIcon from "./assets/new-version-icon.svg?react";
import ZoomInIcon from "./assets/zoom-in-icon.svg?react";
import ZoomOutIcon from "./assets/zoom-out-icon.svg?react";
import UndoIcon from "./assets/undo-icon.svg?react";
import RedoIcon from "./assets/redo-icon.svg?react";
import SettingsIcon from "./assets/settings-icon.svg?react";

import css from "./ToolbarPanel.module.scss";
import { round } from "lodash-es";
import CreatePanel from "../create-panel/CreatePanel";
import SavePanel from "../save-panel/SavePanel";
import ProjectsPanel from "../projects-panel/ProjectsPanel";
import MyTemplatesPanel from "../my-templates-panel/MyTemplatesPanel";
import ExportPanel from "../export-panel/ExportPanel";
import ShapePreviewPanel from "../shape-preview-panel/ShapePreviewPanel";
import { GlobalEventsContext } from "../../utils/global-events/GlobalEvents";
import FontPairingPanel from "../font-pairing-panel/FontPairingPanel";
import ExtensionsPanel from "../extensions-panel/ExtensionsPanel";
import LayoutsPanel from "../layouts-panel/LayoutsPanel";
import PluginsPanel from "../plugins-panel/PluginsPanel";
import { getPlugins } from "webslider-sdk/lib/plugins/plugins-register";
import { IPlugin } from "webslider-sdk/lib/plugins/i-plugin";
import PluginDrawer from "../plugin-drawer/PluginDrawer";

enum VisiblePanel {
  None = "none",
  Create = "create",
  Save = "save",
  Add = "add",
  Settings = "settings",
  Draw = "draw",
  History = "history",
  FontPreview = "font-preview",
  FontPairing = "font-pairing",
  MediaLibrary = "media-library",
  Projects = "projects",
  Templates = "templates",
  Layouts = "layouts",
  Extensions = "extensions",
  Plugins = "plugins",

  Export = "export",
  ShapePreview = "shape-preview",
  ColorPanel = "color-preview",
}

const ICON_SIZE = 32;

type IToolbarPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const ToolbarPanel: React.FC<IToolbarPanel> = (props) => {
  const {
    zoom,
    zoomFit,
    increaseStageZoom,
    decreaseStageZoom,
    doUndo,
    doRedo,
    hasUndoItem,
    hasRedoItem,
    setZoomFit,
    appVersion = "1.0.2",
    availableVersion,
    globals,
  } = props;

  const { setReplaceItem } = useContext(GlobalEventsContext);

  const globalContext = useContext(IntegrationContext);
  const { platform } = globalContext;

  const { loadPlugins } = globalContext.usePluginsHook();
  const [plugins, setPlugins] = useState<IPlugin[]>([]);
  const [activePlugin, setActivePlugin] = useState<IPlugin | null>(null);

  useEffect(() => {
    loadPlugins().then(() => setPlugins(getPlugins()));
  }, []);

  const [defaultSettingsSelectedTabId, setDefaultSettingsSelectedTabId] =
    useState<string | undefined>();

  const [
    defaultSettingsMediaLibraryTabId,
    setDefaultSettingsMediaLibraryTabId,
  ] = useState<"myFonts" | "myImages" | undefined>();

  useEffect(() => {
    const openAccountCallback = () => {
      setDefaultSettingsSelectedTabId("account");
      setShowPanel(VisiblePanel.Settings);
    };
    const openProjectsCallback = () => {
      setShowPanel(VisiblePanel.Projects);
    };

    const openTemplatesCallback = () => {
      setShowPanel(VisiblePanel.Templates);
    };

    const openLayoutsCallback = () => {
      setShowPanel(VisiblePanel.Layouts);
    };

    const openExtensionsCallback = () => {
      setShowPanel(VisiblePanel.Extensions);
    };

    const openPluginsCallback = () => {
      setShowPanel(VisiblePanel.Plugins);
    };

    const openMediaFontsCallback = () => {
      setDefaultSettingsMediaLibraryTabId("myFonts");
      setShowPanel(VisiblePanel.MediaLibrary);
    };

    const openMediaImagesCallback = () => {
      setDefaultSettingsMediaLibraryTabId("myImages");
      setShowPanel(VisiblePanel.MediaLibrary);
    };

    const openShapesPanelCallback = () => {
      setShowPanel(VisiblePanel.ShapePreview);
    };

    const openCreateNewCallback = () => {
      setShowPanel(VisiblePanel.Create);
    };

    const openSaveCallback = () => {
      setShowPanel(VisiblePanel.Save);
    };

    const openExportCallback = () => {
      setShowPanel(VisiblePanel.Export);
    };

    const openTextCallback = () => {
      setShowPanel(VisiblePanel.FontPreview);
    };

    window.addEventListener("OPEN_ACCOUNT_SETTINGS", openAccountCallback);
    window.addEventListener("OPEN_PROJECTS", openProjectsCallback);
    window.addEventListener("OPEN_TEMPLATES", openTemplatesCallback);
    window.addEventListener("OPEN_LAYOUTS", openLayoutsCallback);

    window.addEventListener("OPEN_MEDIA_IMAGES_PANEL", openMediaImagesCallback);
    window.addEventListener("OPEN_SHAPES_PANEL", openShapesPanelCallback);

    window.addEventListener("OPEN_TEXT_PANEL", openTextCallback);

    window.addEventListener("OPEN_MEDIA_FONTS_PANEL", openMediaFontsCallback);
    window.addEventListener("OPEN_CREATE_NEW", openCreateNewCallback);
    window.addEventListener("OPEN_SAVE", openSaveCallback);

    window.addEventListener("OPEN_EXPORT", openExportCallback);

    window.addEventListener("OPEN_EXTENSIONS", openExtensionsCallback);
    window.addEventListener("OPEN_PLUGINS", openPluginsCallback);

    return () => {
      window.removeEventListener("OPEN_ACCOUNT_SETTINGS", openAccountCallback);
      window.removeEventListener("OPEN_PROJECTS", openProjectsCallback);
      window.removeEventListener("OPEN_TEMPLATES", openTemplatesCallback);
      window.removeEventListener("OPEN_LAYOUTS", openLayoutsCallback);

      window.removeEventListener(
        "OPEN_MEDIA_IMAGES_PANEL",
        openMediaImagesCallback,
      );

      window.removeEventListener(
        "OPEN_MEDIA_FONTS_PANEL",
        openMediaFontsCallback,
      );
      window.removeEventListener("OPEN_CREATE_NEW", openCreateNewCallback);
      window.removeEventListener("OPEN_SAVE", openSaveCallback);

      window.removeEventListener("OPEN_SAVE", openExportCallback);

      window.removeEventListener("OPEN_SHAPES_PANEL", openShapesPanelCallback);

      window.removeEventListener("OPEN_TEXT_PANEL", openTextCallback);

      window.removeEventListener("OPEN_EXTENSIONS", openExtensionsCallback);
      window.removeEventListener("OPEN_PLUGINS", openPluginsCallback);
    };
  }, []);

  const [showPanel, setShowPanel] = useState<VisiblePanel>(VisiblePanel.None);
  const { activateTool, activeTool } = useContext(ToolsContext);

  const sharedRef = useRef(null);
  const handleClickOutside = () => {
    setShowPanel(VisiblePanel.None);
  };
  useOnClickOutside(sharedRef, handleClickOutside, [
    "media-modal",
    "image-preview-popover",
    "color-picker-holder",
    "bp5-overlay-scroll-container", // alert
    "bp5-toast",
    "multiselect-tags",
    "confirm-button-dialog",
    "bp5-dialog",
    "bp5-popover",
    "image-review-panel",
  ]);

  useEffect(() => {
    if (showPanel === VisiblePanel.None) {
      setDefaultSettingsMediaLibraryTabId("myImages");
    }
  }, [showPanel]);

  const displayZoom = round(zoom * 100);

  return (
    <div className={css.toolbar}>
      <div>
        <div>
          <div style={{ height: "0px" }}></div>

          {platform.hasLayoutsButton &&
          globals.publishSettings?.enabled ? (
            <>
              <Button
                className={css.largeButton}
                minimal
                active={showPanel === VisiblePanel.Add}
                onClick={() => {
                  setShowPanel(VisiblePanel.Add);
                }}
              >
                <AddObjectIcon />
              </Button>
              <Portal>
                {showPanel === VisiblePanel.Add && (
                  <div ref={sharedRef}>
                    <AddPanel
                      onRequestClose={() => setShowPanel(VisiblePanel.None)}
                      onRequestFontPreview={() =>
                        setShowPanel(VisiblePanel.FontPreview)
                      }
                    />
                  </div>
                )}
              </Portal>
            </>
          ) : (
            <div style={{ height: "55px" }}></div>
          )}

          <Portal>
            {showPanel === VisiblePanel.Create && (
              <div ref={sharedRef}>
                <CreatePanel
                  onRequestClose={() => setShowPanel(VisiblePanel.None)}
                />
              </div>
            )}
          </Portal>
        </div>

        <div>
          <Portal>
            {showPanel === VisiblePanel.Save && (
              <div ref={sharedRef}>
                <SavePanel
                  onRequestClose={() => setShowPanel(VisiblePanel.None)}
                />
              </div>
            )}
          </Portal>
        </div>
        <div>
          <Button
            className={css.largeButton}
            minimal
            active={showPanel === VisiblePanel.MediaLibrary}
            onClick={() => {
              setShowPanel(VisiblePanel.MediaLibrary);
            }}
          >
            <MediaLibraryIcon />
          </Button>
          <Portal>
            {showPanel === VisiblePanel.MediaLibrary && (
              <div ref={sharedRef}>
                <MediaLibraryPanel
                  defaultSelectedTabId={defaultSettingsMediaLibraryTabId as "myFonts" | undefined}
                  onRequestClose={() => {
                    setReplaceItem(undefined);
                    setShowPanel(VisiblePanel.None);
                  }}
                />
              </div>
            )}
          </Portal>
        </div>

        <div>
          <Button
            className={css.largeButton}
            minimal
            active={showPanel === VisiblePanel.FontPreview}
            onClick={() => {
              setShowPanel(VisiblePanel.FontPreview);
            }}
          >
            <TextIcon />
          </Button>
          <Portal>
            {showPanel === VisiblePanel.FontPreview && (
              <div ref={sharedRef}>
                <FontPreviewPanel
                  onRequestClose={() => {
                    setReplaceItem(undefined);
                    setShowPanel(VisiblePanel.None);
                  }}
                />
              </div>
            )}
          </Portal>
        </div>

        <div>
          <Button
            className={css.largeButton}
            minimal
            active={showPanel === VisiblePanel.FontPairing}
            onClick={() => {
              setShowPanel(VisiblePanel.FontPairing);
            }}
          >
            <FontPairingIcon />
          </Button>
          <Portal>
            {showPanel === VisiblePanel.FontPairing && (
              <div ref={sharedRef}>
                <FontPairingPanel
                  onRequestClose={() => {
                    setReplaceItem(undefined);
                    setShowPanel(VisiblePanel.None);
                  }}
                />
              </div>
            )}
          </Portal>
        </div>

        <div>
          <Button
            className={css.largeButton}
            minimal
            active={activeTool?.tool === FREE_DRAW}
            onClick={() => {
              setShowPanel(VisiblePanel.None);
              activateTool(FREE_DRAW, "latest");
            }}
          >
            <FreeDrawIcon />
          </Button>
        </div>

        <div>
          <Button
            className={css.largeButton}
            minimal
            active={showPanel === VisiblePanel.ShapePreview}
            onClick={() => {
              setShowPanel(VisiblePanel.ShapePreview);
            }}
          >
            <Icon icon="shapes" size={32} />
          </Button>
          <Portal>
            {showPanel === VisiblePanel.ShapePreview && (
              <div ref={sharedRef}>
                <ShapePreviewPanel
                  onRequestClose={() => {
                    setReplaceItem(undefined);
                    setShowPanel(VisiblePanel.None);
                  }}
                />
              </div>
            )}
          </Portal>
        </div>

        <div className={css.delimiter}></div>
        <div>
          <Text>{displayZoom} %</Text>
          <div>
            <Button
              className={css.smallButton}
              minimal
              onClick={() => {
                increaseStageZoom(zoom);
                setZoomFit(false);
              }}
            >
              <ZoomInIcon />
            </Button>
            <Button
              className={css.smallButton}
              minimal
              onClick={() => {
                decreaseStageZoom(zoom);
                setZoomFit(false);
              }}
            >
              <ZoomOutIcon />
            </Button>
          </div>
          <div>
            <Button
              minimal
              small
              onClick={() => setZoomFit(!zoomFit)}
              style={{ width: "100%" }}
            >
              FIT
            </Button>
          </div>
          <div className={css.delimiter}></div>
        </div>
        <div>
          <Button
            className={css.smallButton}
            disabled={!hasUndoItem}
            minimal
            onClick={() => doUndo()}
          >
            <UndoIcon />
          </Button>
          <Button
            className={css.smallButton}
            disabled={!hasRedoItem}
            minimal
            onClick={() => doRedo()}
          >
            <RedoIcon />
          </Button>
        </div>
        <div className={css.delimiter}></div>
        <div>
          <Button
            minimal
            className={css.largeButton}
            active={showPanel === VisiblePanel.Settings}
            onClick={() => {
              setShowPanel(VisiblePanel.Settings);
            }}
          >
            <SettingsIcon />
          </Button>
          <Portal>
            {showPanel === VisiblePanel.Settings && (
              <div ref={sharedRef}>
                <SettingsPanel
                  defaultSelectedTabId={defaultSettingsSelectedTabId}
                  onRequestClose={() => {
                    setReplaceItem(undefined);
                    setShowPanel(VisiblePanel.None);
                  }}
                />
              </div>
            )}
          </Portal>
        </div>

        <div>
          <Portal>
            {showPanel === VisiblePanel.Projects && (
              <div ref={sharedRef}>
                <ProjectsPanel
                  onRequestClose={() => {
                    setReplaceItem(undefined);
                    setShowPanel(VisiblePanel.None);
                  }}
                />
              </div>
            )}
          </Portal>

          <Portal>
            {showPanel === VisiblePanel.Templates && (
              <div ref={sharedRef}>
                <MyTemplatesPanel
                  onRequestClose={() => {
                    setReplaceItem(undefined);
                    setShowPanel(VisiblePanel.None);
                  }}
                />
              </div>
            )}
          </Portal>

          <Portal>
            {showPanel === VisiblePanel.Layouts && (
              <div ref={sharedRef}>
                <LayoutsPanel
                  onRequestClose={() => {
                    setReplaceItem(undefined);
                    setShowPanel(VisiblePanel.None);
                  }}
                />
              </div>
            )}
          </Portal>

          <Portal>
            {showPanel === VisiblePanel.Extensions && (
              <div ref={sharedRef}>
                <ExtensionsPanel
                  onRequestClose={() => {
                    setReplaceItem(undefined);
                    setShowPanel(VisiblePanel.None);
                  }}
                />
              </div>
            )}
          </Portal>

          {globals.userRole === "ADMIN" && (
            <Button
              className={css.largeButton}
              minimal
              active={showPanel === VisiblePanel.Plugins}
              title="Plugins"
              onClick={() => setShowPanel(showPanel === VisiblePanel.Plugins ? VisiblePanel.None : VisiblePanel.Plugins)}
            >
              <Icon icon="cube" size={ICON_SIZE} />
            </Button>
          )}
          <Portal>
            {globals.userRole === "ADMIN" && showPanel === VisiblePanel.Plugins && (
              <div ref={sharedRef}>
                <PluginsPanel
                  onRequestClose={() => {
                    setReplaceItem(undefined);
                    setShowPanel(VisiblePanel.None);
                  }}
                />
              </div>
            )}
          </Portal>

          {plugins.map((plugin) => (
            <Button
              key={plugin.id}
              className={css.largeButton}
              minimal
              active={activePlugin?.id === plugin.id}
              title={plugin.buttonConfig.tooltip ?? plugin.buttonConfig.label}
              onClick={() =>
                setActivePlugin(activePlugin?.id === plugin.id ? null : plugin)
              }
            >
              <Icon icon={plugin.buttonConfig.icon as any} />
            </Button>
          ))}

          {activePlugin && (
            <PluginDrawer
              plugin={activePlugin}
              onClose={() => setActivePlugin(null)}
            />
          )}

          <Portal>
            {showPanel === VisiblePanel.Export && (
              <div ref={sharedRef}>
                <ExportPanel
                  onRequestClose={() => {
                    setReplaceItem(undefined);
                    setShowPanel(VisiblePanel.None);
                  }}
                />
              </div>
            )}
          </Portal>
        </div>
      </div>

      <div>
        <div
          style={{
            position: "absolute",
            bottom: "0px",
            width: "68px",
            fontSize: "12px",
            padding: "10px 0px",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          {appVersion}
        </div>

        <div>
          {availableVersion && (
            <Popover
              content={
                <div style={{ background: "#282828", padding: "20px" }}>
                  New version {availableVersion} is available and will be
                  installer after application restart.
                </div>
              }
              shouldReturnFocusOnClose={false}
              interactionKind={PopoverInteractionKind.CLICK}
              hoverCloseDelay={10}
              hoverOpenDelay={15}
            >
              <Button
                className={cx(css.largeButton, css.newVersionButton)}
                minimal
              >
                <BulbIcon />
                <div style={{ fontSize: "10px" }}>NEW VERSION AVAILABLE</div>
              </Button>
            </Popover>
          )}
          <Popover
            content={<HelpMenu appVersion={appVersion} />}
            // placement="left-end"
            interactionKind={PopoverInteractionKind.CLICK}
            hoverCloseDelay={100}
            hoverOpenDelay={150}
          >
            <Button minimal className={css.largeButton}>
              <HelpIcon />
            </Button>
          </Popover>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { stage, project, globals } = state;
  const { settings } = project;

  const zoom = getZoom(stage, settings);

  return {
    globals: globals,
    appVersion: globals.appVersion,
    availableVersion: globals.availableVersion,
    zoom: zoom,
    zoomFit: state.stage.zoomFit,
    hasUndoItem: state.project.diff.prev.length !== 0,
    hasRedoItem: state.project.diff.next.length !== 0,
  };
};

const mapDispatchToProps = {
  increaseStageZoom: increaseStageZoom,
  decreaseStageZoom: decreaseStageZoom,
  setZoomFit: setZoomFit,
  doUndo: () => doUndo(),
  doRedo: () => doRedo(),
};

export default connect(mapStateToProps, mapDispatchToProps)(ToolbarPanel);
