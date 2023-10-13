import {
  Button,
  Icon,
  Intent,
  Menu,
  MenuDivider,
  MenuItem,
  NumericInput,
  Portal,
  Tag,
  Text,
} from "@blueprintjs/core";
import React, { useContext, useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import cx from "classnames";

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

import {
  decreaseStageZoom,
  increaseStageZoom,
  doUndo,
  doRedo,
  setStageTool,
  setZoomFit,
  addNewObject,
} from "../../store/actions/actions";
import HistoryPanel from "../history-panel/HistoryPanel";
import { StageTools } from "../../store/reducers/stage";
import FontPreviewPanel from "../font-preview-panel/FontPreviewPanel";
import MediaLibraryPanel from "../media-library/MediaLibraryPanel";
import ProjectsLibraryPanel from "../projects-library-panel/ProjectsLibraryPanel";
import { getZoom } from "../../store/helpers/calculateZoom";
import { IntegrationContext } from "../../integration";
import { Popover2, Popover2InteractionKind } from "@blueprintjs/popover2";
import { getObjectToolDefinitions } from "../../objects/objectToolFactory";
import { IObject, ObjectType } from "webslider-sdk/lib/objects/i-object";
import { FREE_DRAW } from "../../objects/free-draw/free-draw";

import css from "./QuickBarPanel.module.scss";
import { IToolConfig, ToolsContext } from "../../utils/tools/ToolsProvider";
import { ReactComponent as Pencil } from "./assets/pencil2.svg";
import { ReactComponent as PencilBold } from "./assets/pencil2-bold.svg";
import { ReactComponent as Eraser } from "./assets/eraser.svg";
import { IFreeDrawToolConfig } from "../../objects/free-draw/types";
import {
  getCheckboxField,
  getUnitNumericFiled,
} from "../../inputs/input-utils";
import { TEXT } from "../../objects/text/text";
import { cloneDeep } from "lodash-es";
import { object } from "yup";
import { ToolbarMode } from "../../objects/free-draw/FreeDrawToolbar";

// enum VisiblePanel {
//   None = "none",
//   Add = "add",
//   Settings = "settings",
//   Draw = "draw",
//   History = "history",
//   FontPreview = "font-preview",
//   MediaLibrary = "media-library",
//   ProjectsLibrary = "projects-library",
// }

// const ICON_SIZE = 36;
// const SMALL_ICON_SIZE = 18;

type IToolbarPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const ICON_WIDTH = 36;
const ICON_HEIGHT = 36;

const ToolbarPanel: React.FC<IToolbarPanel> = (props: IToolbarPanel) => {
  const { selectedObjectIds, activeObject } = props;
  const {
    toolConfig,
    updateToolConfig,
    activeTool,
    deleteCurrentObject,
    applyCurrentObject,
    updateObject,
    deleteObject,
  } = useContext(ToolsContext);
  const freeDrawToolState = toolConfig as IToolConfig<IFreeDrawToolConfig>;
  const updateFreeDrawToolConfig = updateToolConfig as (
    _state: IToolConfig<IFreeDrawToolConfig>
  ) => void;

  const currentStroke = freeDrawToolState.strokeWidth ?? "5";

  const [valid, setValue] = useState(true);

  const toolBarComponent = activeTool
    ? getObjectToolDefinitions(activeTool)
    : null;

  console.log(toolBarComponent?.toolBar, "OVDE");
  return (
    <div className={cx(css.quickBar)}>
      {toolBarComponent?.toolBar ? (
        <toolBarComponent.toolBar
          mode={ToolbarMode.Edit}
          object={activeObject}
          updateObject={() => {}}
          deleteObject={() => {}}
          updateFreeDrawToolConfig={() => {}}
          toolConfig={{}}
        />
      ) : null}
    </div>
  );

  // return (
  //   <div className={cx(css.quickBar)}>
  //     {!activeTool &&
  //       selectedObjectIds.length === 1 &&
  //       activeObject?.type === TEXT && (
  //         <>
  //           <div>
  //             <Button
  //               minimal
  //               icon={"bold"}
  //               active={activeObject.definition.values.bold}
  //               onClick={() => {
  //                 const newObject = cloneDeep(activeObject);
  //                 newObject.definition.values.bold =
  //                   !activeObject.definition.values.bold;
  //                 updateObject(newObject);
  //               }}
  //             ></Button>
  //           </div>
  //           <div>
  //             <Button
  //               minimal
  //               icon={"italic"}
  //               active={activeObject.definition.values.italic}
  //               onClick={() => {
  //                 const newObject = cloneDeep(activeObject);
  //                 newObject.definition.values.italic =
  //                   !activeObject.definition.values.italic;
  //                 updateObject(newObject);
  //               }}
  //             ></Button>
  //           </div>
  //           <div>
  //             <Button
  //               minimal
  //               icon={"underline"}
  //               active={activeObject.definition.values.underline}
  //               onClick={() => {
  //                 const newObject = cloneDeep(activeObject);
  //                 newObject.definition.values.underline =
  //                   !activeObject.definition.values.underline;
  //                 updateObject(newObject);
  //               }}
  //             ></Button>
  //           </div>
  //         </>
  //       )}

  //     {!activeTool &&
  //       selectedObjectIds.length === 1 &&
  //       activeObject?.type === FREE_DRAW && (
  //         <>
  //           {/* <div className={css.inputHolder} style={{ marginLeft: "10px" }}>
  //           <Button
  //             className={css.textButton}
  //             minimal
  //             onClick={() => {
  //               activateTool(FREE_DRAW, selectedObjectIds[0]);

  //               // updateFreeDrawToolConfig({
  //               //   ...freeDrawToolState,
  //               //   strokeWidth: "5",
  //               //   eraser: false,
  //               // });
  //             }}
  //             icon="edit"
  //           >
  //             Edit
  //           </Button>
  //         </div> */}

  //           <div className={css.inputHolder}>
  //             {getUnitNumericFiled(
  //               "",
  //               activeObject.definition.values.lines[0].strokeWidth + "px",
  //               (v: string) => {
  //                 const newObject = cloneDeep(activeObject);
  //                 newObject.definition.values.lines[0].strokeWidth =
  //                   parseInt(v).toString(); // + "px";
  //                 updateObject(newObject);
  //               },
  //               "",
  //               {
  //                 className: css.strokeInput,
  //               },
  //               ["px"]
  //             )}
  //           </div>

  //           <div>
  //             <input
  //               type="color"
  //               id="head"
  //               name="head"
  //               value={freeDrawToolState?.color ?? "white"}
  //               onChange={(evt) => {
  //                 const newObject = cloneDeep(activeObject);
  //                 newObject.definition.values.lines[0].color =
  //                   evt.currentTarget.value;

  //                 updateObject(newObject);
  //               }}
  //               style={{ width: "35px", height: "35px", margin: "10px" }}
  //             />
  //           </div>
  //           <div className={css.rightHolder}>
  //             <div>
  //               <Button
  //                 style={{ float: "right" }}
  //                 minimal
  //                 onClick={() => {
  //                   deleteCurrentObject();
  //                   deleteObject(selectedObjectIds[0]);
  //                 }}
  //                 icon={"trash"}
  //               ></Button>
  //             </div>
  //           </div>
  //         </>
  //       )}
  //     {activeTool === FREE_DRAW && (
  //       <>
  //         <div>
  //           <Button
  //             minimal
  //             active={currentStroke === "1" && !freeDrawToolState.eraser}
  //             onClick={() => {
  //               updateFreeDrawToolConfig({
  //                 ...freeDrawToolState,
  //                 strokeWidth: "1",
  //                 eraser: false,
  //               });
  //             }}
  //           >
  //             <Pencil
  //               style={{
  //                 width: "12px",
  //                 height: ICON_HEIGHT + "px",
  //               }}
  //             />
  //           </Button>
  //         </div>

  //         <div>
  //           <Button
  //             minimal
  //             active={currentStroke === "5" && !freeDrawToolState.eraser}
  //             onClick={() => {
  //               updateFreeDrawToolConfig({
  //                 ...freeDrawToolState,
  //                 strokeWidth: "5",
  //                 eraser: false,
  //               });
  //             }}
  //           >
  //             <Pencil
  //               style={{
  //                 width: "17px",
  //                 height: ICON_HEIGHT + "px",
  //               }}
  //             />
  //           </Button>
  //         </div>

  //         <div>
  //           <Button
  //             minimal
  //             active={currentStroke === "10" && !freeDrawToolState.eraser}
  //             onClick={() => {
  //               updateFreeDrawToolConfig({
  //                 ...freeDrawToolState,
  //                 strokeWidth: "10",
  //                 eraser: false,
  //               });
  //             }}
  //           >
  //             <Pencil
  //               style={{
  //                 width: "22px",
  //                 height: ICON_HEIGHT + "px",
  //               }}
  //             />
  //           </Button>
  //         </div>

  //         <div>
  //           <Button
  //             minimal
  //             active={currentStroke === "20" && !freeDrawToolState.eraser}
  //             onClick={() => {
  //               updateFreeDrawToolConfig({
  //                 ...freeDrawToolState,
  //                 strokeWidth: "20",
  //                 eraser: false,
  //               });
  //             }}
  //           >
  //             <Pencil
  //               style={{
  //                 width: "27px",
  //                 height: ICON_HEIGHT + "px",
  //               }}
  //             />
  //           </Button>
  //         </div>

  //         <div className={css.inputHolder}>
  //           {getUnitNumericFiled(
  //             "",
  //             currentStroke + "px",
  //             (v: string) => {
  //               updateFreeDrawToolConfig({
  //                 ...freeDrawToolState,
  //                 strokeWidth: parseInt(v).toString(),
  //                 eraser: false,
  //               });
  //             },
  //             "",
  //             {
  //               className: css.strokeInput,
  //             },
  //             ["px"]
  //           )}
  //         </div>

  //         <div>
  //           <input
  //             type="color"
  //             id="head"
  //             name="head"
  //             value={freeDrawToolState?.color ?? "white"}
  //             onChange={(evt) => {
  //               updateFreeDrawToolConfig({
  //                 ...freeDrawToolState,
  //                 color: evt.currentTarget.value,
  //                 eraser: false,
  //               });
  //             }}
  //             style={{ width: "35px", height: "35px", margin: "10px" }}
  //           />
  //         </div>

  //         <div>
  //           <Button
  //             minimal
  //             active={freeDrawToolState.eraser}
  //             onClick={() => {
  //               updateFreeDrawToolConfig({
  //                 ...freeDrawToolState,
  //                 eraser: true,
  //               });
  //             }}
  //           >
  //             <Eraser
  //               style={{
  //                 width: "27px",
  //                 height: ICON_HEIGHT + "px",
  //               }}
  //             />
  //           </Button>
  //         </div>

  //         {/* <div className={css.checkboxHolder}>
  //           {getCheckboxField("Multiple", freeDrawToolState.multiLines, onClick={() => {
  //               updateFreeDrawToolConfig({
  //                 ...freeDrawToolState,
  //                 eraser: true,
  //               });
  //             }})}
  //         </div> */}

  //         {/* <div className={css.rightHolder}>
  //           <div>
  //             <Button
  //               style={{ float: "right" }}
  //               minimal
  //               onClick={() => {
  //                 deleteCurrentObject();
  //               }}
  //               icon={"trash"}
  //             ></Button>
  //           </div>
  //           <div>
  //             <Button
  //               style={{ float: "right" }}
  //               minimal
  //               onClick={() => {
  //                 applyCurrentObject();
  //               }}
  //               icon={"tick"}
  //             ></Button>
  //           </div>
  //         </div> */}
  //       </>
  //     )}
  //   </div>
  // );
};

const mapStateToProps = (state: IStore) => {
  const { objects, selection } = state.project;

  const { activeObjectId } = selection;

  const activeObject = activeObjectId
    ? objects.objectById[activeObjectId]
    : null;

  return {
    activeObject,
    selectedObjectIds: selection.selectedObjectIds,
  };

  //   const { stage, project, globals } = state;
  //   const { settings } = project;
  //   const zoom = getZoom(stage, settings);
  //   return {
  //     activeLayerId: state.project.selection.activeLayerId,
  //     appVersion: globals.appVersion,
  //     availableVersion: globals.availableVersion,
  //     missingExtensions: state.editor.missingExtensions,
  //     zoom: zoom,
  //     zoomFit: state.stage.zoomFit,
  //     hasUndoItem: state.project.diff.prev.length !== 0,
  //     hasRedoItem: state.project.diff.next.length !== 0,
  //     stageTool: state.stage.stageTool.tool,
  //   };
};

const mapDispatchToProps = {
  //   increaseStageZoom: increaseStageZoom,
  //   decreaseStageZoom: decreaseStageZoom,
  //   setZoomFit: setZoomFit,
  //   doUndo: () => doUndo(),
  //   doRedo: () => doRedo(),
  //   _setStageTool: (tool: StageTools) => setStageTool(tool),
  //   _addNewObject: (
  //     layerId: string,
  //     type: ObjectType | string,
  //     objectProps: Partial<IObject>,
  //     values?: { [key: string]: any }
  //   ) => addNewObject(layerId, type, objectProps, values),
};

export default connect(mapStateToProps, mapDispatchToProps)(ToolbarPanel);
