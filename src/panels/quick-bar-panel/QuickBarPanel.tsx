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
import { addNewObject, groupObjects } from "../../store/actions/actions";
import { IObject, ObjectType } from "webslider-sdk/lib/objects/i-object";

type IToolbarPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const ToolbarPanel: React.FC<IToolbarPanel> = (props: IToolbarPanel) => {
  const {
    selectedObjectIds,
    activeObject,
    _addNewObject,
    activeLayerId,
    _groupObjects,
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

  return (
    <div className={cx(css.quickBar)}>
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
      {activeLayerId && (
        <div>
          <Button
            style={{ float: "right" }}
            minimal
            onClick={() => {
              _addNewObject(activeLayerId, "group", {});
            }}
          >
            AddGroup
          </Button>
        </div>
      )}
      {selectedObjectIds.length > 1 && (
        <div>
          <Button
            style={{ float: "right" }}
            minimal
            onClick={() => {
              _groupObjects(selectedObjectIds);
            }}
          >
            Group objects
          </Button>
        </div>
      )}
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
};

export default connect(mapStateToProps, mapDispatchToProps)(ToolbarPanel);
