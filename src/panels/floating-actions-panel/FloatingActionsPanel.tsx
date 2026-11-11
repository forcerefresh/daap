import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import {
  deleteObjects,
  duplicateObjects,
  groupObjects,
  normalizeObjectGroups,
  ungroupObject,
} from "../../store/actions/actions";
import {
  Button,
  ButtonGroup,
  Popover,
} from "@blueprintjs/core";

import {
  getFloatingRect,
  setFloatingActionPanelVisibility,
} from "./utils";
import ContextMenu from "../context-menu/ContextMenu";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import css from "./FloatingActionsPanel.module.scss";
import { getObjectToolDefinitions } from "../../objects/objectToolFactory";
import { ToolbarMode } from "../../utils/tools/types";
import { ToolsContext } from "../../utils/tools/ToolsProvider";

enum MultiSelectionType {
  None = "None",
  Single = "Single",
  Multiple = "Multiple",
}

type IFloatingActionPanel = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const FloatingActionPanel: React.FC<IFloatingActionPanel> = (
  props: IFloatingActionPanel,
) => {
  const {
    selectedObjectIds,
    objectById,
    _groupObjects,
    _ungroupObject,
    _duplicateObjects,
    _deleteObjects,
    zoom,
    pan,
    appZoom,
  } = props;
  const mainRef = useRef<HTMLDivElement>(null);

  const {
    toolConfig,
    setToolConfig,
    updateObject,
    updateObjectForPreview,
    deleteObject,
  } = useContext(ToolsContext);

  const activeObject = objectById[selectedObjectIds[0]];

  const mSelectionType: MultiSelectionType =
    !selectedObjectIds || selectedObjectIds.length === 0 || !activeObject
      ? MultiSelectionType.None
      : selectedObjectIds.length === 1
        ? MultiSelectionType.Single
        : MultiSelectionType.Multiple;

  const FloatingBarComponent =
    mSelectionType === MultiSelectionType.Single &&
    getObjectToolDefinitions(activeObject?.type, activeObject.version)
      ?.floatingBar;

  const [opacity] = useState(1);

  const groupingDisabled = selectedObjectIds.length < 2;
  const ungroupDisabled = !(
    selectedObjectIds.length === 1 &&
    objectById[selectedObjectIds[0]]?.type === "group"
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (mainRef.current) {
        const stageEl = document.getElementsByClassName(
          "layout-center-area",
        )[0] as HTMLElement;

        const rect = getFloatingRect(selectedObjectIds);

        let top = Math.max(10, rect.top - 85 * appZoom);
        let left = Math.max(10, rect.left);

        if (stageEl) {
          const stageWidth = stageEl.getBoundingClientRect().width;
          const width = mainRef.current.getBoundingClientRect().width;
          let maxLeft = stageWidth - width - 10;

          const layersSimplifiedEl = document.getElementsByClassName(
            "layers-simplified-panel",
          )[0] as HTMLElement;

          if (layersSimplifiedEl) {
            maxLeft -= layersSimplifiedEl.getBoundingClientRect().width + 10;
          }
          left = Math.min(left, maxLeft);
        }

        mainRef.current.style.top = top / appZoom + "px";
        mainRef.current.style.left = left / appZoom + "px";

        setFloatingActionPanelVisibility(true);
      }
    }, 1);

    return () => {
      clearTimeout(timeout);
    };
  }, [selectedObjectIds, objectById, zoom, pan]);

  return (
    <>
      {mSelectionType !== MultiSelectionType.None && (
        <>
          <div
            className={cx(css.floatingActions, "floating-action-panel")}
            ref={mainRef}
            style={{ opacity: opacity, position: "absolute", top: "-100px" }}
          >
            {activeObject?.isLocked && (
              <Button
                intent={"danger"}
                icon="lock"
                minimal
                onClick={(event: any) => {
                  event.stopPropagation();
                  updateObject({
                    ...activeObject,
                    isLocked: !activeObject.isLocked,
                  });
                }}
              ></Button>
            )}

            <div className={cx(css.floatingActionInner)}>
              {FloatingBarComponent ? (
                <FloatingBarComponent
                  mode={ToolbarMode.Edit}
                  object={activeObject}
                  addObject={() => {}}
                  updateObject={updateObject}
                  updateObjectForPreview={updateObjectForPreview}
                  deleteObject={deleteObject}
                  setToolConfig={setToolConfig}
                  toolConfig={toolConfig}
                />
              ) : null}
              <ButtonGroup minimal={true}>
                {!groupingDisabled && (
                  <Button
                    icon="group-objects"
                    onClick={() => {
                      _groupObjects(selectedObjectIds);
                    }}
                  >
                    Group
                  </Button>
                )}

                {!ungroupDisabled && (
                  <Button
                    icon="ungroup-objects"
                    onClick={() => {
                      _ungroupObject(selectedObjectIds[0]);
                    }}
                  >
                    Ungroup
                  </Button>
                )}

                <Button
                  icon="duplicate"
                  onClick={() => [_duplicateObjects(selectedObjectIds)]}
                ></Button>
                <Button
                  icon="trash"
                  onClick={() => [_deleteObjects(selectedObjectIds)]}
                ></Button>

                <Popover
                  hasBackdrop={true}
                  content={<ContextMenu />}
                  placement="bottom-end"
                  renderTarget={({ isOpen, ...p }) => (
                    <Button {...p} active={isOpen} icon={"more"} />
                  )}
                />
              </ButtonGroup>
            </div>
          </div>
        </>
      )}
    </>
  );
};

const mapStateToProps = (state: IStore) => {
  const { objects, selection } = state.project;

  return {
    appZoom: state.globals.appZoom,
    groupNesting: state.globals.groupNesting,
    objectById: objects.objectById,
    selectedObjectIds: selection.selectedObjectIds,
    zoom: state.stage.zoom,
    pan: state.stage.pan,
  };
};

const mapDispatchToProps = {
  _groupObjects: (objectIds: string[]) => groupObjects(objectIds),
  _ungroupObject: (groupId: string) => ungroupObject(groupId),
  _duplicateObjects: (ids: string[]): any => duplicateObjects(ids),
  _deleteObjects: (ids: string[]): any => deleteObjects(ids),

  _normalizeObjectGroups: (objects: IObject[]): any =>
    normalizeObjectGroups(objects),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(FloatingActionPanel);
