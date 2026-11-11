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
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";

import OpacityIcon from "../../assets/icons/opacity2.svg?react";
import MaskIcon from "../../panels/layers-simplified/assets/mask-icon.svg?react";

import MediaLibraryPanel, {
  includeMediaRequiredProps,
  Panels,
} from "../media-library/MediaLibraryPanel";
import { cloneDeep } from "lodash-es";
import useOnClickOutside from "../../utils/hooks/on-click-outside";
import { getSelectSlider } from "../../inputs/input-utils";
import AlignPanel from "../align-panel/AlignPanel";
import { SVG_MASK } from "../../objects/svg-mask/svg-mask";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import { getNewMediaObjectBounds } from "../../panels/media-library/add-object-utils";

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
    _showSimplifiedLayers,
    showSimplifiedLayers,
    _showSimplifiedPages,
    showSimplifiedPagesPanel,
    breakpointConfig,
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
    "media-modal", // WP media library dialog
  ]);

  let toolBarComponent: IToolDefinition | null = null;
  let mode: ToolbarMode | undefined;

  if (activeTool) {
    toolBarComponent = getObjectToolDefinitions(
      activeTool.tool,
      activeTool.version,
    );
    mode = ToolbarMode.Edit;
  } else if (
    selectedObjectIds.length === 1 &&
    activeObject?.id === selectedObjectIds[0]
  ) {
    toolBarComponent = getObjectToolDefinitions(
      activeObject.type,
      "latest",
    );
    mode = ToolbarMode.Selection;
  } else {
    mode = undefined;
  }

  const groupingDisabled = selectedObjectIds.length < 2;
  const ungroupDisabled = !(
    selectedObjectIds.length === 1 &&
    objectById[selectedObjectIds[0]]?.type === "group"
  );
  const firstSelectedObject = objectById[selectedObjectIds[0]];

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

        <div>
          <Popover
            interactionKind={PopoverInteractionKind.CLICK}
            position={Position.BOTTOM}
            modifiers={{ preventOverflow: { enabled: true } }}
            usePortal={true}
            minimal
            content={<AlignPanel onRequestClose={() => {}} />}
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
                    },
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

        <div>
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
                  onSelect={async (mediaItem) => {
                    const sizeRect = getNewMediaObjectBounds({
                      media: mediaItem.media,
                      breakpointConfig,
                    });

                    if (activeLayerId) {
                      _addNewObject(
                        activeLayerId,
                        SVG_MASK,
                        { ...sizeRect },
                        {
                          mask: includeMediaRequiredProps(mediaItem.media),
                        },
                        firstSelectedObject?.id,
                      );
                    } else {
                      AppToaster.show({
                        intent: "warning",
                        message: `No layer selected. Please choose a layer first.`,
                      });
                    }
                  }}
                  panelsToShow={[Panels.MySvgMask, Panels.SvgMask]}
                />
              </div>
            }
          >
            <Button
              minimal
              className={cx(css.button, css.squareButton)}
              icon={<MaskIcon />}
              onClick={() => {
                setIsMaskOpen(!isMaskOpen);
              }}
              disabled={
                selectedObjectIds.length !== 1 ||
                firstSelectedObject?.type === SVG_MASK
              }
            ></Button>
          </Popover>
        </div>

        <Divider />

        <div>
          <Button
            active={showSimplifiedLayers}
            className={cx(css.button, css.squareButton)}
            minimal
            onClick={() => {
              _showSimplifiedLayers(!showSimplifiedLayers);
            }}
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
            icon={"applications"}
          ></Button>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { objects, selection, settings } = state.project;

  const { activeObjectId, activeLayerId } = selection;

  const activeObject = activeObjectId
    ? objects.objectById[activeObjectId]
    : null;

  const breakpointConfig: BreakpointConfiguration | undefined =
    settings.breakpoints.breakpointsConfiguration.find(
      (breakpointConfig: any) =>
        breakpointConfig.type === state.stage.selectedDevice,
    );

  return {
    breakpointConfig,
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
    values?: { [key: string]: any },
    afterObjectId?: string,
  ) => addNewObject(layerId, type, objectProps, values, afterObjectId),
  _groupObjects: (objectIds: string[]) => groupObjects(objectIds),

  _ungroupObject: (groupId: string) => ungroupObject(groupId),
  _deleteObjects: (objectIds: string[]) => deleteObjects(objectIds),
  _showSimplifiedLayers: (show: boolean) => showSimplifiedLayers(show),
  _showSimplifiedPages: (show: boolean) => showSimplifiedPages(show),
};

export default connect(mapStateToProps, mapDispatchToProps)(QuickBarPanel as any);

export async function fetchSVG(url: string): Promise<string> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const svgText = await response.text();
    return svgText;
  } catch (error) {
    throw error;
  }
}
