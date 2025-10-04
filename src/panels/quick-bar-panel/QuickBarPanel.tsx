import React, { useContext, useRef, useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import {
  IToolDefinition,
  getObjectToolDefinitions,
} from "../../objects/objectToolFactory";
import { ToolsContext } from "../../utils/tools/ToolsProvider";
import { ToolbarMode } from "../../utils/tools/types";
import css from "./QuickBarPanel.module.scss";
import {
  Button,
  Divider,
  Icon,
  Label,
  Popover,
  PopoverInteractionKind,
  Position,
} from "@blueprintjs/core";
import {
  addNewObject,
  deleteObjects,
  groupObjects,
  showSimplifiedLayers,
  showSimplifiedPages,
  ungroupObject,
} from "../../store/actions/actions";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { isObjectGroup } from "../../store/actions/actions-utils";

import PropertiesIcon from "../../panels/properties-sections-panel/icons/properties.svg?react";
import TransformIcon from "../../panels/properties-sections-panel/icons/transform.svg?react";

import OpacityIcon from "../../assets/icons/opacity2.svg?react";
import ColorPaletteIcon from "./assets/color-palette.svg?react";

import MediaLibraryPanel, { Panels } from "../media-library/MediaLibraryPanel";
import { cloneDeep } from "lodash-es";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import { object } from "yup";
import { getSelectSlider } from "../../inputs/input-utils";
import AlignPanel from "../align-panel/AlignPanel";
import LayoutToTemplatePanel from "../layout-to-template-panel/LayoutToTemplatePanel";

const PANEL_ICON_SIZE = 22;

type IQuickBarPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const QuickBarPanel: React.FC<IQuickBarPanel> = (props: IQuickBarPanel) => {
  const {
    selectedObjectIds,
    activeObject,
    _addNewObject,
    activeLayerId,
    _groupObjects,
    _ungroupObject,
    objectById,
    _deleteObjects,
    _showSimplifiedLayers,
    showSimplifiedLayers,
    _showSimplifiedPages,
    showSimplifiedPagesPanel,
    layout2TemplateEnabled,
  } = props;
  const {
    toolConfig,
    setToolConfig,
    activeTool,
    // deleteCurrentObject,
    // applyCurrentObject,
    updateObject,
    updateObjectForPreview,
    deleteObject,
  } = useContext(ToolsContext);

  const [isMaskOpen, setIsMaskOpen] = useState(false);

  // logic for handling click outside
  const sharedRef = useRef(null);
  const handleClickOutside = () => {
    setIsMaskOpen(false);
  };
  useOnClickOutside(sharedRef, handleClickOutside, [
    "image-preview-popover",
    "color-picker-holder",
    "bp5-overlay-scroll-container", // alert
  ]);

  //   const mSelectionType: MultiSelectionType =
  //   !selectedObjectIds || selectedObjectIds.length === 0
  //     ? MultiSelectionType.None
  //     : selectedObjectIds.length === 1
  //     ? MultiSelectionType.Single
  //     : MultiSelectionType.Multiple;

  // const activeObject = objectById[selectedObjectIds[0]];

  let toolBarComponent: IToolDefinition | null = null;
  let mode: ToolbarMode | undefined;

  if (activeTool) {
    toolBarComponent = getObjectToolDefinitions(
      activeTool.tool,
      activeTool.version
    );
    mode = ToolbarMode.Edit;
  } else if (
    selectedObjectIds.length === 1 &&
    activeObject?.id === selectedObjectIds[0]
  ) {
    toolBarComponent = getObjectToolDefinitions(
      activeObject.type,
      "latest"
      // activeObject.version
    );
    mode = ToolbarMode.Selection;
  } else {
    mode = undefined;
  }

  const parentId = objectById[selectedObjectIds?.[0]]?.parentId;

  // >> ----
  const groupingDisabled =
    selectedObjectIds.length < 2 || isObjectGroup(objectById[parentId!]);
  const ungroupDisabled = !(
    selectedObjectIds.length === 1 &&
    objectById[selectedObjectIds[0]]?.type === "group"
  );
  // const firstSelectedObject = objectById[selectedObjectIds[0]];
  // const isFirstSelectedGroup = !!(
  //   firstSelectedObject?.objectIds && firstSelectedObject?.objectIds?.length > 0
  // );
  // groupingDisabled =
  //   groupingDisabled ||
  //   (selectedObjectIds.length === 1 && isFirstSelectedGroup);
  // << ---

  return (
    <div className={cx(css.quickBar, "no-custom-cursor")}>
      <div className={css.leftHolder}>
        {toolBarComponent?.toolBar ? (
          <toolBarComponent.toolBar
            mode={mode}
            object={activeObject}
            addObject={() => {}}
            updateObject={updateObject}
            updateObjectForPreview={updateObjectForPreview}
            deleteObject={deleteObject}
            setToolConfig={setToolConfig}
            toolConfig={toolConfig}
          />
        ) : null}
      </div>
      <div className={css.rightHolder}>
        {!groupingDisabled && (
          <div>
            <Button
              style={{ float: "right" }}
              minimal
              onClick={() => {
                _groupObjects(selectedObjectIds);
              }}
              icon={"group-objects"}
              className={cx(css.button)}
              disabled={groupingDisabled}
            >
              Group
            </Button>
          </div>
        )}

        {!ungroupDisabled && (
          <div>
            <Button
              style={{ float: "right" }}
              minimal
              onClick={() => {
                _ungroupObject(selectedObjectIds[0]);
              }}
              icon={"ungroup-objects"}
              className={css.button}
              disabled={ungroupDisabled}
            >
              Ungroup
            </Button>
          </div>
        )}

        {/* <div className={css.toolButtonHolder}>
          <Popover
            interactionKind={PopoverInteractionKind.CLICK}
            position={Position.BOTTOM}
            modifiers={{ preventOverflow: { enabled: true } }}
            usePortal={true}
            minimal
            // isOpen={isMaskOpen}
            content={<AlignPanel />}
          >
            <Button
              icon={
                <ColorPaletteIcon
                  style={{
                    width: "36px",
                    height: PANEL_ICON_SIZE + "px",
                    fill: "gray",
                  }}
                />
              }
              minimal
              className={cx(css.button, css.squareButton)}
              disabled={selectedObjectIds.length === 0}
            ></Button>
          </Popover>
        </div> */}

        {layout2TemplateEnabled ? (
          <>
            <div>
              <Button
                style={{ color: "rgb(110 240 239)" }}
                icon={
                  <Icon icon={"clean"} style={{ color: "rgb(110 240 239)" }} />
                }
                minimal
                className={cx(css.button)}
                onClick={() => {
                  const event = new CustomEvent("OPEN_LAYOUT2TEMPLATE");
                  window.dispatchEvent(event);
                }}
              >
                Generate
              </Button>
            </div>

            <div>
              <Button
                style={{ color: "rgb(110 240 239)" }}
                icon={
                  <Icon icon={"clean"} style={{ color: "rgb(110 240 239)" }} />
                }
                minimal
                className={cx(css.button)}
                onClick={() => {
                  const event = new CustomEvent("OPEN_LAYOUT2TEMPLATE_OLD");
                  window.dispatchEvent(event);
                }}
              >
                Generate OLD
              </Button>
            </div>
          </>
        ) : null}

        <div>
          <Popover
            interactionKind={PopoverInteractionKind.CLICK}
            position={Position.BOTTOM}
            modifiers={{ preventOverflow: { enabled: true } }}
            usePortal={true}
            minimal
            // isOpen={isMaskOpen}
            content={<AlignPanel />}
          >
            <Button
              icon={"alignment-left"}
              minimal
              className={cx(css.button, css.squareButton)}
              disabled={selectedObjectIds.length === 0}
            ></Button>
          </Popover>
        </div>

        <div>
          <Popover
            interactionKind={PopoverInteractionKind.CLICK}
            position={Position.BOTTOM}
            modifiers={{ preventOverflow: { enabled: true } }}
            usePortal={true}
            minimal
            // isOpen={isMaskOpen}
            content={
              <div className={css.sliderHolder}>
                <div>
                  <Label>Opacity</Label>
                  {getSelectSlider(
                    "",
                    activeObject?.style?.opacity ?? 100,
                    {
                      min: 0,
                      max: 100,
                      suffix: "",
                      stepSize: 1,
                      labelStepSize: 1,
                      trackFill: false,
                    },
                    (opacity: string) => {
                      if (!activeObject) return;
                      const retObj = cloneDeep(activeObject);
                      if (!retObj.style) retObj.style = {};
                      retObj.style.opacity = parseInt(opacity);
                      updateObject(retObj);
                    },
                    (opacity: string) => {
                      if (!activeObject) return;
                      const retObj = cloneDeep(activeObject);
                      if (!retObj.style) retObj.style = {};
                      retObj.style.opacity = parseInt(opacity);
                      updateObjectForPreview(retObj);
                    }
                  )}
                </div>
              </div>
            }
          >
            <Button
              icon={
                <>
                  <OpacityIcon style={{ transform: "rotate(180deg)" }} />
                  {
                    <span
                      style={{
                        position: "absolute",
                        opacity: 0.8,
                        // marginLeft: "9px",
                        color: "#fff",
                        textShadow: "1px 1px 2px black",
                        background: "#33333357",
                        lineHeight: "13px",
                      }}
                    >
                      {activeObject?.style?.opacity !== 100 &&
                        activeObject?.style?.opacity}
                    </span>
                  }
                </>
              }
              minimal
              className={cx(css.button, css.squareButton)}
              disabled={selectedObjectIds.length !== 1}
            ></Button>
          </Popover>
        </div>

        {/* <div>
          <Popover
            interactionKind={PopoverInteractionKind.CLICK}
            position={Position.BOTTOM}
            modifiers={{ preventOverflow: { enabled: true } }}
            usePortal={true}
            minimal
            popoverClassName={css.mediaLibraryPanelPopup}
            isOpen={isMaskOpen}
            content={
              <div ref={sharedRef}>
                <MediaLibraryPanel
                  onRequestClose={() => {
                    setIsMaskOpen(false);
                  }}
                  className={css.mediaLibraryPanel}
                  addObject={false}
                  instaSelect={true}
                  showRemoveItem={!!activeObject?.mask}
                  onSelect={(item) => {
                    if (activeObject) {
                      const newObject = cloneDeep(activeObject);
                      debugger;
                      if (item?.initialValues?.svg) {
                        newObject.mask = {
                          type: "svg",
                          svg: item.initialValues.svg,
                        };
                      } else {
                        newObject.mask = null;
                      }

                      updateObject(newObject);
                    }
                    // onInput({
                    //   ...localValue,
                    //   source: (item.initialValues as any).svg,
                    // });
                    // setLibraryOpen(false);
                  }}
                  panelsToShow={[Panels.MyVectors]}
                />
              </div>
            }
          >
            <Button
              minimal
              className={cx(css.button, css.squareButton)}
              icon={"clip"}
              onClick={() => {
                setIsMaskOpen(!isMaskOpen);
              }}
              disabled={selectedObjectIds.length !== 1}
            ></Button>
          </Popover>
        </div> */}

        {/* <div>
          <Button
            className={cx(css.button, css.squareButton)}
            minimal
            onClick={() => {
              _deleteObjects(selectedObjectIds);
            }}
            disabled={selectedObjectIds.length < 1}
            icon={"trash"}
          ></Button>
        </div> */}

        <Divider />

        {/* <div>
          <Button
            className={cx(css.button, css.squareButton)}
            minimal
            onClick={() => {}}
            disabled={selectedObjectIds.length < 1}
            icon={"link"}
          ></Button>
        </div>

        <div>
          <Button
            className={cx(css.button, css.squareButton)}
            minimal
            onClick={() => {}}
            disabled={selectedObjectIds.length < 1}
            icon={"properties"}
          ></Button>
        </div> */}

        <div>
          <Button
            active={showSimplifiedLayers}
            className={cx(css.button, css.squareButton)}
            minimal
            onClick={() => {
              _showSimplifiedLayers(!showSimplifiedLayers);
            }}
            //disabled={selectedObjectIds.length < 1}
            icon={"list"}
          ></Button>
        </div>

        <div>
          <Button
            active={showSimplifiedPagesPanel}
            className={cx(css.button, css.squareButton)}
            minimal
            onClick={() => {
              _showSimplifiedPages(!showSimplifiedPagesPanel);
            }}
            //disabled={selectedObjectIds.length < 1}
            icon={"applications"}
          ></Button>
        </div>

        {/* <div className={css.panelButtons}>
          <Button
            minimal
            active={true}
            onClick={() => {
              // setActiveSection(PropertiesPanelSection.Properties);
            }}
          >
            <PropertiesIcon
              style={{
                width: "36px",
                height: PANEL_ICON_SIZE + "px",
                fill: "gray",
              }}
            />
            <div>Properties</div>
          </Button>
        </div>

        <div className={css.panelButtons}>
          <Button
            minimal
            active={false}
            onClick={() => {
              // setActiveSection(PropertiesPanelSection.Transform);
            }}
          >
            <TransformIcon
              style={{
                width: "36px",
                height: PANEL_ICON_SIZE + "px",
                fill: "gray",
              }}
            />
            <div>Transform</div>
          </Button>
        </div> */}
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { globals } = state;
  const { objects, selection } = state.project;

  const { activeObjectId, activeLayerId } = selection;

  const activeObject = activeObjectId
    ? objects.objectById[activeObjectId]
    : null;

  return {
    layout2TemplateEnabled: globals.publishSettings?.enabled,
    activeLayerId,
    activeObject,
    objectById: objects.objectById,
    selectedObjectIds: selection.selectedObjectIds,
    showSimplifiedLayers: state.stage.showSimplifiedLayerPanel,
    showSimplifiedPagesPanel: state.stage.showSimplifiedPagesPanel,
  };
};

const mapDispatchToProps = {
  _addNewObject: (
    layerId: string,
    type: string,
    objectProps: Partial<IObject>,
    values?: { [key: string]: any }
  ) => addNewObject(layerId, type, objectProps, values),
  _groupObjects: (objectIds: string[]) => groupObjects(objectIds),

  _ungroupObject: (groupId: string) => ungroupObject(groupId),
  _deleteObjects: (objectIds: string[]) => deleteObjects(objectIds),
  _showSimplifiedLayers: (show: boolean) => showSimplifiedLayers(show),
  _showSimplifiedPages: (show: boolean) => showSimplifiedPages(show),
};

export default connect(mapStateToProps, mapDispatchToProps)(QuickBarPanel);
