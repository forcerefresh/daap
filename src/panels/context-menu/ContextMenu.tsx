import * as React from "react";

import {
  Icon,
  Menu,
  MenuDivider,
  MenuItem,
  type Props,
} from "@blueprintjs/core";
import { IStore } from "../../store/store";
import {
  copyToClipboard,
  cutToClipboard,
  deleteObjects,
  duplicateObjects,
  groupObjects,
  normalizeObjectGroups,
  pasteObjectsFromClipboard,
  ungroupObject,
  updateObject,
} from "../../store/actions/actions";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { connect } from "react-redux";
import {
  isGroupingPossible,
  isUngroupingPossible,
} from "../floating-actions-panel/utils";
import { IClipboard } from "../../store/reducers/i-clipboard";
import css from "./ContextMenu.module.scss";

export interface MoreMenuProps extends Props {
  shouldDismissPopover?: boolean;
}

type IContextMenu = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const ContextMenu: React.FC<IContextMenu> = (props: IContextMenu) => {
  const {
    hasClipboard,
    selectedObjectIds,
    objectById,
    activeLayerId,
    _groupObjects,
    _ungroupObject,
    _duplicateObjects,
    _normalizeObjectGroups,
    _cutToClipboard,
    _copyToClipboard,
    _pasteObjectsFromClipboard,
    _deleteObjects,
    _updateObject,
  } = props;

  const groupingAllowed = isGroupingPossible(objectById, selectedObjectIds);
  const ungroupingAllowed = isUngroupingPossible(objectById, selectedObjectIds);

  const object = objectById[selectedObjectIds[0]];

  // if (!object) {
  //   return (
  //     <Menu className={css.contextMenu}>
  //       <MenuItem text="No object selected." disabled={true} />
  //     </Menu>
  //   );
  // }

  return (
    <Menu className={css.contextMenu}>
      <MenuItem
        icon="cut"
        text="Cut"
        label="⌘X"
        disabled={!object}
        onClick={() => {
          _cutToClipboard({
            entityIds: selectedObjectIds,
            entityType: "object",
          });
        }}
      />
      <MenuItem
        icon="duplicate"
        text="Copy"
        label="⌘C"
        disabled={!object}
        onClick={() => {
          _copyToClipboard({
            entityIds: selectedObjectIds,
            entityType: "object",
          });
        }}
      />
      <MenuItem
        icon="clipboard"
        text="Paste"
        label="⌘V"
        disabled={!hasClipboard && !!activeLayerId}
        onClick={() => {
          if (activeLayerId) {
            _pasteObjectsFromClipboard(activeLayerId);
          }
        }}
      />
      <MenuDivider />

      {groupingAllowed && (
        <MenuItem
          text="Group"
          icon="group-objects"
          label={"⌘G"}
          onClick={() => {
            _groupObjects(selectedObjectIds);
          }}
        />
      )}

      {ungroupingAllowed && (
        <MenuItem
          text="Ungroup"
          icon="ungroup-objects"
          label={"⌘G"}
          onClick={() => {
            _ungroupObject(selectedObjectIds[0]);
          }}
        />
      )}

      {ungroupingAllowed && (
        <MenuItem
          text="Reset"
          icon="square"
          //label={"⌘G"}
          onClick={() => {
            _normalizeObjectGroups([objectById[selectedObjectIds[0]]]);
          }}
        />
      )}

      {(ungroupingAllowed || groupingAllowed) && <MenuDivider />}

      {!!object?.mask && (
        <>
          <MenuItem
            text={"Remove mask"}
            icon={"clip"}
            // label={(<Icon icon="key-backspace" />) as unknown as string}
            onClick={(event: any) => {
              event.stopPropagation();
              _updateObject({
                ...object,
                mask: null,
              });
            }}
          />
          <MenuDivider />
        </>
      )}

      <MenuItem
        text={object?.isLocked ? "Unlock" : "Lock"}
        icon={object?.isLocked ? "lock" : "unlock"}
        disabled={!object}
        // label={(<Icon icon="key-backspace" />) as unknown as string}
        onClick={(event: any) => {
          event.stopPropagation();
          _updateObject({
            ...object,
            isLocked: !object.isLocked,
          });
        }}
      />
      <MenuDivider />

      <MenuItem
        text="Delete"
        disabled={!object}
        icon="delete"
        label={(<Icon icon="key-backspace" />) as unknown as string}
        onClick={() => {
          _deleteObjects(selectedObjectIds);
        }}
      />
    </Menu>
  );
};

const mapStateToProps = (state: IStore) => {
  const { objects, selection, clipboard } = state.project;

  return {
    hasClipboard: !!clipboard.entityType,
    objectById: objects.objectById,
    selectedObjectIds: selection.selectedObjectIds,
    activeLayerId: selection.activeLayerId,
  };
};

const mapDispatchToProps = {
  _groupObjects: (objectIds: string[]) => groupObjects(objectIds),
  _ungroupObject: (groupId: string) => ungroupObject(groupId),
  _duplicateObjects: (ids: string[]): any => duplicateObjects(ids),
  _normalizeObjectGroups: (objects: IObject[]): any =>
    normalizeObjectGroups(objects),

  _cutToClipboard: (
    payload: Pick<IClipboard, "entityType" | "entityIds">
  ): any => cutToClipboard(payload),
  _copyToClipboard: (
    payload: Pick<IClipboard, "entityType" | "entityIds">
  ): any => copyToClipboard(payload),
  _pasteObjectsFromClipboard: (toLayerId: string): any =>
    pasteObjectsFromClipboard(toLayerId),
  // _cutToClipboard: (
  //   payload: Pick<IClipboard, "entityType" | "entityIds">
  // ): any => cutToClipboard(payload),

  _deleteObjects: (objectIds: string[]) => deleteObjects(objectIds),
  _updateObject: (object: IObject) => updateObject(object),
};

export default connect(mapStateToProps, mapDispatchToProps)(ContextMenu);
