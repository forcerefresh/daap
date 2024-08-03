import React, { useContext } from "react";
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
import { Button } from "@blueprintjs/core";
import {
  addNewObject,
  groupObjects,
  ungroupObject,
} from "../../store/actions/actions";
import { IObject, ObjectType } from "webslider-sdk/lib/objects/i-object";
import { isObjectGroup } from "../../store/actions/actions-utils";

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
  // const firstSelectedObject = objectById[selectedObjectIds[0]];
  // const isFirstSelectedGroup = !!(
  //   firstSelectedObject?.objectIds && firstSelectedObject?.objectIds?.length > 0
  // );
  // groupingDisabled =
  //   groupingDisabled ||
  //   (selectedObjectIds.length === 1 && isFirstSelectedGroup);
  // << ---

  return (
    <div className={cx(css.quickBar)}>
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
        {
          <div>
            <Button
              style={{ float: "right" }}
              minimal
              onClick={() => {
                _groupObjects(selectedObjectIds);
              }}
              icon={"group-objects"}
              className={css.button}
              disabled={groupingDisabled}
            >
              Group
            </Button>
          </div>
        }
        {
          <div>
            <Button
              style={{ float: "right" }}
              minimal
              onClick={() => {
                _ungroupObject(selectedObjectIds[0]);
              }}
              icon={"ungroup-objects"}
              className={css.button}
              disabled={
                !(
                  selectedObjectIds.length === 1 &&
                  objectById[selectedObjectIds[0]].type === "group"
                )
              }
            >
              Ungroup
            </Button>
          </div>
        }
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
};

export default connect(mapStateToProps, mapDispatchToProps)(ToolbarPanel);
