import {
  Button,
  Popover,
  PopoverInteractionKind,
  Portal,
  Tag,
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
  setStageTool,
  setZoomFit,
  addNewObject,
  setTheme,
} from "../../store/actions/actions";
import HistoryPanel from "../history-panel/HistoryPanel";
import { StageTools } from "../../store/reducers/stage";
import FontPreviewPanel from "../font-preview-panel/FontPreviewPanel";
import MediaLibraryPanel from "../media-library/MediaLibraryPanel";
import ProjectsLibraryPanel from "../projects-library-panel/ProjectsLibraryPanel";
import { getZoom } from "../../store/helpers/calculateZoom";
import { IntegrationContext } from "../../integration";
import { Popover2, Popover2InteractionKind } from "@blueprintjs/popover2";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { FREE_DRAW } from "../../objects/free-draw/free-draw";
import { ToolsContext } from "../../utils/tools/ToolsProvider";
import { HelpMenu } from "./HelpMenu";
import { ITheme } from "../../store/reducers/i-settings";

import { ReactComponent as AddObjectIcon } from "./assets/add-object-icon.svg";
import { ReactComponent as MediaLibraryIcon } from "./assets/media-library-icon.svg";
import { ReactComponent as TextIcon } from "./assets/text-icon.svg";
import { ReactComponent as FreeDrawIcon } from "./assets/free-draw-icon.svg";
import { ReactComponent as SelectToolIcon } from "./assets/select-tool-icon.svg";
import { ReactComponent as HandToolIcon } from "./assets/hand-tool-icon.svg";
import { ReactComponent as HistoryToolIcon } from "./assets/history-icon.svg";
import { ReactComponent as HelpIcon } from "./assets/help-icon.svg";
import { ReactComponent as BulbIcon } from "./assets/new-version-icon.svg";
import { ReactComponent as ZoomInIcon } from "./assets/zoom-in-icon.svg";
import { ReactComponent as ZoomOutIcon } from "./assets/zoom-out-icon.svg";
import { ReactComponent as UndoIcon } from "./assets/undo-icon.svg";
import { ReactComponent as RedoIcon } from "./assets/redo-icon.svg";
import { ReactComponent as LibraryIcon } from "./assets/library-icon.svg";
import { ReactComponent as SettingsIcon } from "./assets/settings-icon.svg";

import css from "./ToolbarPanel.module.scss";
import { round } from "lodash-es";
import { BLOB } from "../../objects/blob/blob";
enum VisiblePanel {
  None = "none",
  Add = "add",
  Settings = "settings",
  Draw = "draw",
  History = "history",
  FontPreview = "font-preview",
  MediaLibrary = "media-library",
  ProjectsLibrary = "projects-library",
}

const ICON_SIZE = 32;
const SMALL_ICON_SIZE = 12;

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
    stageTool,
    _setStageTool,
    setZoomFit,
    missingExtensions,
    appVersion,
    availableVersion,
    activeLayerId,
    _addNewObject,
    _setTheme,
    theme,
  } = props;
  const globalContext = useContext(IntegrationContext);
  const { getLicenseDetails } = globalContext.useLicenseHook();

  const [defaultSettingsSelectedTabId, setDefaultSettingsSelectedTabId] =
    useState<string | undefined>();

  useEffect(() => {
    const openAccountCallback = () => {
      setDefaultSettingsSelectedTabId("account");
      setShowPanel(VisiblePanel.Settings);
    };
    const openProjectsCallback = () => {
      setShowPanel(
        showPanel === VisiblePanel.ProjectsLibrary
          ? VisiblePanel.None
          : VisiblePanel.ProjectsLibrary
      );
    };

    window.addEventListener("OPEN_ACCOUNT_SETTINGS", openAccountCallback);
    window.addEventListener("OPEN_PROJECTS", openProjectsCallback);

    return () => {
      window.removeEventListener("OPEN_ACCOUNT_SETTINGS", openAccountCallback);
      window.removeEventListener("OPEN_PROJECTS", openProjectsCallback);
    };
  }, []);

  useEffect(() => {
    // getLicenseDetails().then((data) => {
    //   if (data?.status === "OK" || data?.status === "EXPIRED") {
    //   } else {
    //     setShowPanel(VisiblePanel.Settings);
    //   }
    // });
  }, []);

  // function createInstance<A>(c: new () => A): A {
  //   return new c();
  // }

  const [showPanel, setShowPanel] = useState<VisiblePanel>(VisiblePanel.None);
  // const latestShowPanel = useRef<VisiblePanel>();

  // console.log(showPanel);
  // let inst = useRef<FreeHandDrawTool>();
  const { activateTool, deactivateTool, activeTool } = useContext(ToolsContext);
  //console.log(activeTool);
  // useEffect(() => {
  //   inst.current?.setToolState(toolState as any);
  // }, [toolState]);

  // useEffect(() => {
  //   if (showPanel !== VisiblePanel.Draw) {
  //     deactivateTool();
  //   }
  // }, [showPanel, deactivateTool]);

  // useEffect(() => {
  //   if (showPanel === VisiblePanel.Draw) {
  //     setTool("FREE_DRAW");
  //     const toolCanvasEl =
  //       document.getElementsByClassName("MainToolCanvas")[0]!;
  //     const toolDef = getObjectToolDefinitions("wewewe");
  //     const toolClazz = toolDef.toolHandlerClass;
  //     inst.current = new toolClazz();
  //     inst.current.setTool({
  //       stageZoom: zoom,
  //       canvas: toolCanvasEl as HTMLElement,
  //       updateValues: (values, pos) => {
  //         _addNewObject(
  //           activeLayerId!,
  //           FREE_DRAW,
  //           {
  //             layout: "absolute" as "absolute",
  //             absoluteLayout: {
  //               type: "common" as "common",
  //               perDevice: [],
  //               relativeTo: "stage",
  //               common: {
  //                 deviceType: "common" as "common",
  //                 left: pos.left + "px",
  //                 top: pos.top + "px",
  //                 width: "650px",
  //                 height: "650px",
  //               },
  //             },
  //           } as any,
  //           {
  //             strokeWidth: "10",
  //             ...values,
  //           }
  //         );

  //         console.log(values);
  //       },
  //       values: { paths: [], strokeWidth: "5", color: "black" } as any,
  //     });
  //   } else {
  //     setTool("NONE");
  //   }

  //   latestShowPanel.current = showPanel;
  // }, [showPanel]);

  // logic for handling click outside
  const sharedRef = useRef(null);
  const handleClickOutside = () => {
    setShowPanel(VisiblePanel.None);
  };
  useOnClickOutside(sharedRef, handleClickOutside, [
    "image-preview-popover",
    "color-picker-holder",
    "bp5-overlay-scroll-container", // alert
    "bp5-toast",
    "multiselect-tags",
    "confirm-button-dialog",
    "bp5-dialog",
    "bp5-popover",
  ]);

  // const displayZoom = Number.isInteger(zoom * 100)
  //   ? zoom * 100
  //   : (zoom * 100).toFixed(2);

  const displayZoom = round(zoom * 100);

  return (
    <div className={css.toolbar}>
      <div>
        <div>
          <div style={{ height: "54px" }}></div>
          {/* <Button
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
          </Portal> */}
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
                  onRequestClose={() => {
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
            active={activeTool === FREE_DRAW}
            onClick={() => {
              setShowPanel(VisiblePanel.None);
              activateTool(FREE_DRAW);
            }}
          >
            <FreeDrawIcon />
          </Button>
        </div>

        <div>
          <Button
            className={css.largeButton}
            minimal
            onClick={() => {
              if (activeLayerId) {
                _addNewObject(activeLayerId, BLOB, {
                  left: 100,
                  top: 100,
                  width: 400,
                  height: 400,
                });
              }
            }}
          >
            BLOB
          </Button>
        </div>

        <div className={css.delimiter}></div>
        <div>
          <Button
            className={css.smallButton}
            minimal
            onClick={() => {
              deactivateTool();
              setShowPanel(VisiblePanel.None);
              _setStageTool(StageTools.SELECT);
            }}
            active={stageTool === StageTools.SELECT}
          >
            <SelectToolIcon />
          </Button>
          <Button
            className={css.smallButton}
            minimal
            onClick={() => _setStageTool(StageTools.PAN)}
            active={stageTool === StageTools.PAN}
          >
            <HandToolIcon />
          </Button>
        </div>
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
              // active={zoomFit}
              minimal
              small
              onClick={() => setZoomFit(!zoomFit)}
              style={{ width: "100%" }}
            >
              FIT
            </Button>
          </div>
          <Button
            className={css.largeButton}
            minimal
            active={showPanel === VisiblePanel.History}
            onClick={() => {
              setShowPanel(VisiblePanel.History);
            }}
          >
            <HistoryToolIcon />
          </Button>
          <Portal>
            {showPanel === VisiblePanel.History && (
              <div ref={sharedRef}>
                <HistoryPanel
                  onRequestClose={() => setShowPanel(VisiblePanel.None)}
                />
              </div>
            )}
          </Portal>
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
                  onRequestClose={() => setShowPanel(VisiblePanel.None)}
                />
              </div>
            )}
          </Portal>
        </div>

        <div>
          {/* <Button
            minimal
            className={css.largeButton}
            active={showPanel === VisiblePanel.ProjectsLibrary}
            onClick={() => {
              setShowPanel(VisiblePanel.ProjectsLibrary);
            }}
          >
            {missingExtensions?.length > 0 && (
              <Tag intent={"danger"} round className={css.buttonTag}>
                {missingExtensions.length}
              </Tag>
            )}
            <LibraryIcon />
          </Button> */}

          <Portal>
            {showPanel === VisiblePanel.ProjectsLibrary && (
              <div ref={sharedRef}>
                <ProjectsLibraryPanel
                  onRequestClose={() => setShowPanel(VisiblePanel.None)}
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
            placement="left-end"
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
    activeLayerId: state.project.selection.activeLayerId,
    appVersion: globals.appVersion,
    availableVersion: globals.availableVersion,
    missingExtensions: state.editor.missingExtensions,
    zoom: zoom,
    zoomFit: state.stage.zoomFit,
    hasUndoItem: state.project.diff.prev.length !== 0,
    hasRedoItem: state.project.diff.next.length !== 0,
    stageTool: state.stage.stageTool.tool,
    theme: settings.theme,
  };
};

const mapDispatchToProps = {
  increaseStageZoom: increaseStageZoom,
  decreaseStageZoom: decreaseStageZoom,
  setZoomFit: setZoomFit,
  doUndo: () => doUndo(),
  doRedo: () => doRedo(),
  _setStageTool: (tool: StageTools) => setStageTool(tool),
  _addNewObject: (
    layerId: string,
    type: string,
    objectProps: Partial<IObject>,
    values?: { [key: string]: any }
  ) => addNewObject(layerId, type, objectProps, values),
  _setTheme: (theme: ITheme) => setTheme(theme),
};

export default connect(mapStateToProps, mapDispatchToProps)(ToolbarPanel);
