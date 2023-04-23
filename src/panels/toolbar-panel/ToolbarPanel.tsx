import {
  Button,
  Icon,
  Menu,
  MenuDivider,
  MenuItem,
  Portal,
  Tag,
  Text,
} from "@blueprintjs/core";
import React, { useContext, useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { IStore } from "../../store/store";

import { ReactComponent as SelectToolIcon } from "../../assets/icons/select-tool.svg";
import { ReactComponent as ZoomToolIcon } from "../../assets/icons/zoom-tool.svg";
import { ReactComponent as HistoryToolIcon } from "../../assets/icons/history-tool.svg";
import { ReactComponent as AddTextboxIcon } from "../../assets/icons/add-textbox2.svg";
import { ReactComponent as HelpIcon } from "../../assets/icons/help-icon.svg";
import { ReactComponent as BulbIcon } from "../../assets/icons/bulb-icon.svg";
import { ReactComponent as LinkOut } from "../../assets/icons/link-out.svg";

import AddPanel from "../add-panel/AddPanel";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import SettingsPanel from "../settings-panel/SettingsPanel";

import css from "./ToolbarPanel.module.scss";
import {
  decreaseStageZoom,
  increaseStageZoom,
  doUndo,
  doRedo,
  setStageTool,
  setZoomFit,
} from "../../store/actions/actions";
import HistoryPanel from "../history-panel/HistoryPanel";
import { StageTools } from "../../store/reducers/stage";
import FontPreviewPanel from "../font-preview-panel/FontPreviewPanel";
import MediaLibraryPanel from "../media-library/MediaLibraryPanel";
import ProjectsLibraryPanel from "../projects-library-panel/ProjectsLibraryPanel";
import { getZoom } from "../../store/helpers/calculateZoom";
import { IntegrationContext } from "../../integration";
import { Popover2, Popover2InteractionKind } from "@blueprintjs/popover2";

enum VisiblePanel {
  None = "none",
  Add = "add",
  Settings = "settings",
  History = "history",
  FontPreview = "font-preview",
  MediaLibrary = "media-library",
  ProjectsLibrary = "projects-library",
}

const ICON_SIZE = 36;
const SMALL_ICON_SIZE = 18;

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
  } = props;
  const globalContext = useContext(IntegrationContext);
  const { getLicenseDetails } = globalContext.useLicenseHook();

  useEffect(() => {
    // getLicenseDetails().then((data) => {
    //   if (data?.status === "OK" || data?.status === "EXPIRED") {
    //   } else {
    //     setShowPanel(VisiblePanel.Settings);
    //   }
    // });
  }, []);

  const [showPanel, setShowPanel] = useState<VisiblePanel>(VisiblePanel.None);

  // logic for handling click outside
  const sharedRef = useRef(null);
  const handleClickOutside = () => {
    setShowPanel(VisiblePanel.None);
  };
  useOnClickOutside(sharedRef, handleClickOutside, [
    "image-preview-popover",
    "color-picker-holder",
    "bp3-overlay-scroll-container", // alert
    "bp3-toast",
  ]);

  const displayZoom = Number.isInteger(zoom * 100)
    ? zoom * 100
    : (zoom * 100).toFixed(2);

  const openExternalLink = (url: string) => {
    const { shell } = window.require("electron");
    shell.openExternal(url);
  };

  const helpMenu = (
    <Menu>
      <MenuDivider title={`WebSlider v${appVersion}`} />
      <MenuItem
        icon={<LinkOut style={{ opacity: 0, width: "15px", height: "19px" }} />}
        text="Documentation"
        onClick={() => {
          // TODO: this is only for Electron
          const { ipcRenderer } = window.require("electron");
          ipcRenderer.invoke("System::OpenDocs").then(() => {});
        }}
      />
      <MenuItem
        icon={<LinkOut style={{ width: "15px", height: "19px" }} />}
        text="Live Documentation"
        onClick={() => {
          openExternalLink("https://webslider.io/docs/introduction");
        }}
      />
      <MenuItem
        icon={<LinkOut style={{ width: "15px", height: "19px" }} />}
        text="Support Forum"
        onClick={() => {
          openExternalLink("https://support.webslider.io");
        }}
      />
      <MenuDivider />
      <MenuItem
        icon={<LinkOut style={{ width: "15px", height: "19px" }} />}
        text="Leave a Feedback"
        onClick={() => {
          openExternalLink("https://support.webslider.io/viewforum.php?f=12");
        }}
      />
    </Menu>
  );

  return (
    <div className={css.toolbar}>
      <div className={css.buttonGroupsHolder}>
        <div>
          <Button
            minimal
            active={showPanel === VisiblePanel.Add}
            onClick={() => {
              setShowPanel(VisiblePanel.Add);
            }}
          >
            <Icon icon="add" iconSize={ICON_SIZE} color={"gray"} />
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
            minimal
            active={showPanel === VisiblePanel.MediaLibrary}
            onClick={() => {
              setShowPanel(VisiblePanel.MediaLibrary);
            }}
          >
            <Icon icon="media" iconSize={ICON_SIZE} color={"gray"} />
          </Button>
          <Portal>
            {showPanel === VisiblePanel.MediaLibrary && (
              <div ref={sharedRef}>
                <MediaLibraryPanel
                  onRequestClose={() => setShowPanel(VisiblePanel.None)}
                />
              </div>
            )}
          </Portal>
        </div>

        <div>
          <Button
            minimal
            active={showPanel === VisiblePanel.FontPreview}
            onClick={() => {
              setShowPanel(VisiblePanel.FontPreview);
            }}
          >
            <AddTextboxIcon
              style={{ width: "36px", height: ICON_SIZE + "px", fill: "gray" }}
            />{" "}
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

        <div className={css.delimiter}></div>
        <div>
          <Button
            small
            minimal
            onClick={() => _setStageTool(StageTools.SELECT)}
            active={stageTool === StageTools.SELECT}
          >
            <SelectToolIcon
              style={{
                width: SMALL_ICON_SIZE + "px",
                height: SMALL_ICON_SIZE + "px",
                fill: "gray",
              }}
            />
          </Button>
          <Button
            minimal
            small
            onClick={() => _setStageTool(StageTools.PAN)}
            active={stageTool === StageTools.PAN}
          >
            <Icon icon="hand" iconSize={SMALL_ICON_SIZE} color={"gray"} />
          </Button>
        </div>
        <div>
          <Text>{displayZoom} %</Text>
          <div>
            <Button
              minimal
              small
              onClick={() => {
                increaseStageZoom(zoom);
                setZoomFit(false);
              }}
            >
              <Icon icon="zoom-in" iconSize={SMALL_ICON_SIZE} color={"gray"} />
            </Button>
            <Button
              minimal
              small
              onClick={() => {
                decreaseStageZoom(zoom);
                setZoomFit(false);
              }}
            >
              <Icon icon="zoom-out" iconSize={SMALL_ICON_SIZE} color={"gray"} />
            </Button>
          </div>
          <div>
            <Button
              active={zoomFit}
              minimal
              small
              onClick={() => setZoomFit(!zoomFit)}
              style={{ width: "100%" }}
            >
              FIT
            </Button>
          </div>
          <Button
            minimal
            active={showPanel === VisiblePanel.History}
            onClick={() => {
              setShowPanel(VisiblePanel.History);
            }}
          >
            <HistoryToolIcon
              style={{ width: "36px", height: ICON_SIZE + "px", fill: "gray" }}
            />
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
            disabled={!hasUndoItem}
            minimal
            small
            onClick={() => doUndo()}
          >
            <Icon
              icon="undo"
              iconSize={SMALL_ICON_SIZE}
              color={hasUndoItem ? "gray" : "#555"}
            />
          </Button>
          <Button
            disabled={!hasRedoItem}
            minimal
            small
            onClick={() => doRedo()}
          >
            <Icon
              icon="redo"
              iconSize={SMALL_ICON_SIZE}
              color={hasRedoItem ? "gray" : "#555"}
            />
          </Button>
        </div>
        <div className={css.delimiter}></div>
        <div>
          <Button
            minimal
            active={showPanel === VisiblePanel.Settings}
            onClick={() => {
              setShowPanel(VisiblePanel.Settings);
            }}
          >
            <Icon icon="cog" iconSize={ICON_SIZE} color={"gray"} />
          </Button>
          <Portal>
            {showPanel === VisiblePanel.Settings && (
              <div ref={sharedRef}>
                <SettingsPanel
                  onRequestClose={() => setShowPanel(VisiblePanel.None)}
                />
              </div>
            )}
          </Portal>
        </div>

        <div>
          <Button
            minimal
            className={css.tbButton}
            active={showPanel === VisiblePanel.ProjectsLibrary}
            onClick={() => {
              setShowPanel(VisiblePanel.ProjectsLibrary);
            }}
          >
            {missingExtensions?.length > 0 && (
              <Tag intent={"danger"} round className={css.tbTag}>
                {missingExtensions.length}
              </Tag>
            )}
            <Icon icon="projects" iconSize={ICON_SIZE} color={"gray"} />
          </Button>

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
            <Popover2
              content={
                <div style={{ background: "#282828", padding: "20px" }}>
                  New version {availableVersion} is available and will be
                  installer after application restart.
                </div>
              }
              shouldReturnFocusOnClose={false}
              interactionKind={Popover2InteractionKind.CLICK}
              hoverCloseDelay={10}
              hoverOpenDelay={15}
            >
              <Button
                minimal
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <BulbIcon
                  style={{
                    color: "#17ffe0",
                    width: "26px",
                    height: 26 + "px",
                    fill: "gray",
                  }}
                />
                <div style={{ fontSize: "10px" }}>NEW VERSION AVAILABLE</div>
              </Button>
            </Popover2>
          )}
          <Popover2
            content={helpMenu}
            placement="left-end"
            interactionKind={Popover2InteractionKind.CLICK}
            hoverCloseDelay={100}
            hoverOpenDelay={150}
          >
            <Button minimal>
              <HelpIcon
                style={{
                  width: "36px",
                  height: ICON_SIZE + "px",
                  fill: "gray",
                }}
              />
            </Button>
          </Popover2>
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
    appVersion: globals.appVersion,
    availableVersion: globals.availableVersion,
    missingExtensions: state.editor.missingExtensions,
    zoom: zoom,
    zoomFit: state.stage.zoomFit,
    hasUndoItem: state.project.diff.prev.length !== 0,
    hasRedoItem: state.project.diff.next.length !== 0,
    stageTool: state.stage.stageTool.tool,
  };
};

const mapDispatchToProps = {
  increaseStageZoom: increaseStageZoom,
  decreaseStageZoom: decreaseStageZoom,
  setZoomFit: setZoomFit,
  doUndo: () => doUndo(),
  doRedo: () => doRedo(),
  _setStageTool: (tool: StageTools) => setStageTool(tool),
};

export default connect(mapStateToProps, mapDispatchToProps)(ToolbarPanel);
