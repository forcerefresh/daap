import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
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
  AnchorButton,
  Button,
  ButtonGroup,
  KeyComboTag,
  Popover,
  useHotkeys,
} from "@blueprintjs/core";

import { getObjectBoundingBox } from "../../store/helpers/objectBoundingBox";
import { getObjectBBoxRelativeToParent } from "../stage-panel-new/stage-panel-utils";
import {
  getFloatingRect,
  isGroupingPossible,
  isUngroupingPossible,
  setFloatingActionPanelVisibility,
} from "./utils";
import ContextMenu from "../context-menu/ContextMenu";
import { isObjectGroup } from "../../store/actions/actions-utils";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import css from "./FloatingActionsPanel.module.scss";
import { getObjectToolDefinitions } from "../../objects/objectToolFactory";
import { object } from "yup";
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
  props: IFloatingActionPanel
) => {
  const {
    selectedObjectIds,
    objectById,
    _groupObjects,
    _ungroupObject,
    _duplicateObjects,
    _normalizeObjectGroups,
    _deleteObjects,
    zoom,
    pan,
  } = props;
  const mainRef = useRef<HTMLDivElement>(null);
  // const tmpRef = useRef<HTMLDivElement>(null);

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

  const mSelectionType: MultiSelectionType =
    !selectedObjectIds || selectedObjectIds.length === 0
      ? MultiSelectionType.None
      : selectedObjectIds.length === 1
      ? MultiSelectionType.Single
      : MultiSelectionType.Multiple;

  const activeObject = objectById[selectedObjectIds[0]];
  const FloatingBarComponent =
    mSelectionType === MultiSelectionType.Single &&
    getObjectToolDefinitions(activeObject?.type)?.floatingBar;

  // const [isVisible, setIsVisible] = useState(false);
  const [opacity, setOpacity] = useState(1);

  const parentId = objectById[selectedObjectIds?.[0]]?.parentId;
  const groupingAllowed = isGroupingPossible(objectById, selectedObjectIds);
  const ungroupingAllowed = isUngroupingPossible(objectById, selectedObjectIds);

  // useEffect(() => {
  //   setIsVisible(selectedObjectIds.length === 1);
  //   //setOpacity(0);
  // }, [selectedObjectIds]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      // if (selectedObjectIds.length === 0) {
      //   setIsVisible(false);
      //   return;
      // }

      // tmpRef.current &&
      if (mainRef.current) {
        const stageEl = document.getElementsByClassName(
          "layout-center-area"
        )[0] as HTMLElement;

        const rect = getFloatingRect(selectedObjectIds);

        // tmpRef.current.style.position = "absolute";
        // tmpRef.current.style.left = rect?.left + "px";
        // tmpRef.current.style.top = rect?.top + "px";
        // tmpRef.current.style.width = rect?.width + "px";
        // tmpRef.current.style.height = rect?.height + "px";
        // tmpRef.current.style.border = "1px solid red";
        // tmpRef.current.style.pointerEvents = "none";

        let top = Math.max(10, rect.top - 85);
        let left = Math.max(10, rect.left);

        if (stageEl) {
          const stageWidth = stageEl.getBoundingClientRect().width;
          const width = mainRef.current.getBoundingClientRect().width;
          let maxLeft = stageWidth - width - 10;

          const layersSimplifiedEl = document.getElementsByClassName(
            "layers-simplified-panel"
          )[0] as HTMLElement;

          if (layersSimplifiedEl) {
            maxLeft -= layersSimplifiedEl.getBoundingClientRect().width + 10;
          }
          left = Math.min(left, maxLeft);
        }

        mainRef.current.style.top = top + "px";
        mainRef.current.style.left = left + "px";

        //mainRef.current.style.width = rect.width + "px";
        setFloatingActionPanelVisibility(true);
        // setOpacity(1);
      }

      // setIsVisible(true);
    }, 1);

    return () => {
      clearTimeout(timeout);
    };
  }, [selectedObjectIds, objectById, zoom, pan]);

  return (
    <>
      {mSelectionType !== MultiSelectionType.None && (
        <>
          {/* <div ref={tmpRef}></div> */}
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
                {groupingAllowed && (
                  <Button
                    icon="group-objects"
                    onClick={() => {
                      _groupObjects(selectedObjectIds);
                    }}
                  >
                    Group
                  </Button>
                )}

                {ungroupingAllowed && (
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
                  content={<ContextMenu />}
                  placement="bottom-end"
                  // tslint:disable-next-line jsx-no-lambda
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
  mapDispatchToProps
)(FloatingActionPanel);
