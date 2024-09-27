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
  Popover,
  PopoverInteractionKind,
  Position,
} from "@blueprintjs/core";
import {
  addNewObject,
  deleteObjects,
  groupObjects,
  ungroupObject,
} from "../../store/actions/actions";
import { IObject, ObjectType } from "webslider-sdk/lib/objects/i-object";
import { isObjectGroup } from "../../store/actions/actions-utils";

import { ReactComponent as PropertiesIcon } from "../../panels/properties-sections-panel/icons/properties.svg";
import { ReactComponent as TransformIcon } from "../../panels/properties-sections-panel/icons/transform.svg";
import MediaLibraryPanel, { Panels } from "../media-library/MediaLibraryPanel";
import { cloneDeep } from "lodash-es";
import useOnClickOutside from "../../utils/hooks/on-click-outside";

const PANEL_ICON_SIZE = 22;

type IToolbarPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const ToolbarPanel: React.FC<IToolbarPanel> = (props: IToolbarPanel) => {
  const {
    selectedObjectIds,
    activeObject,
    _addNewObject,
    activeLayerId,
    _groupObjects,
    _ungroupObject,
    objectById,
    _deleteObjects,
  } = props;
  const {
    toolConfig,
    setToolConfig,
    activeTool,
    // deleteCurrentObject,
    // applyCurrentObject,
    updateObject,
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
    toolBarComponent = getObjectToolDefinitions(activeTool);
    mode = ToolbarMode.Edit;
  } else if (
    selectedObjectIds.length === 1 &&
    activeObject?.id === selectedObjectIds[0]
  ) {
    toolBarComponent = getObjectToolDefinitions(activeObject.type);
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
          {/* <Button
            className={cx(css.button, css.squareButton)}
            minimal
            onClick={() => {
              setIsMaskOpen(true);
            }}
            // disabled={selectedObjectIds.length !== 1}
            icon={"mask"}
          ></Button> */}

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
                  onSelect={(item) => {
                    debugger;
                    if (activeObject && item?.initialValues?.svg) {
                      const newObject = cloneDeep(activeObject);
                      newObject.mask = {
                        type: "svg",
                        svg: item.initialValues.svg,
                      };
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
            ></Button>
          </Popover>
        </div>

        <div>
          <Button
            className={cx(css.button, css.squareButton)}
            minimal
            onClick={() => {
              _deleteObjects(selectedObjectIds);
            }}
            disabled={selectedObjectIds.length < 1}
            icon={"trash"}
          ></Button>
        </div>
        <Divider />
        <div>
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
        </div>

        <div>
          <Button
            active={true}
            className={cx(css.button, css.squareButton)}
            minimal
            onClick={() => {}}
            disabled={selectedObjectIds.length < 1}
            icon={"list"}
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
  const { objects, selection } = state.project;

  const { activeObjectId, activeLayerId } = selection;

  const activeObject = activeObjectId
    ? objects.objectById[activeObjectId]
    : null;

  return {
    activeLayerId,
    activeObject,
    objectById: objects.objectById,
    selectedObjectIds: selection.selectedObjectIds,
  };
};

const mapDispatchToProps = {
  _addNewObject: (
    layerId: string,
    type: ObjectType | string,
    objectProps: Partial<IObject>,
    values?: { [key: string]: any }
  ) => addNewObject(layerId, type, objectProps, values),
  _groupObjects: (objectIds: string[]) => groupObjects(objectIds),

  _ungroupObject: (groupId: string) => ungroupObject(groupId),
  _deleteObjects: (objectIds: string[]) => deleteObjects(objectIds),
};

export default connect(mapStateToProps, mapDispatchToProps)(ToolbarPanel);
