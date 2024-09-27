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
  cutToClipboard,
  deleteObjects,
  duplicateObjects,
  groupObjects,
  normalizeObjectGroups,
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
    _groupObjects,
    _ungroupObject,
    _duplicateObjects,
    _normalizeObjectGroups,
    _cutToClipboard,
    _deleteObjects,
    _updateObject,
  } = props;

  const groupingAllowed = isGroupingPossible(objectById, selectedObjectIds);
  const ungroupingAllowed = isUngroupingPossible(objectById, selectedObjectIds);

  const object = objectById[selectedObjectIds[0]];

  return (
    <Menu className={css.contextMenu}>
      <MenuItem
        icon="cut"
        text="Cut"
        label="⌘X"
        onClick={() => {
          _cutToClipboard({
            entityIds: selectedObjectIds,
            entityType: "object",
          });
        }}
      />
      <MenuItem icon="duplicate" text="Copy" label="⌘C" />
      <MenuItem
        icon="clipboard"
        text="Paste"
        label="⌘V"
        disabled={!hasClipboard}
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
          text="Flatten"
          icon="square"
          //label={"⌘G"}
          onClick={() => {
            _normalizeObjectGroups([objectById[selectedObjectIds[0]]]);
          }}
        />
      )}

      {(ungroupingAllowed || groupingAllowed) && <MenuDivider />}

      <MenuItem
        text={object.isLocked ? "Unlock" : "Lock"}
        icon={object.isLocked ? "lock" : "unlock"}
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
  _deleteObjects: (objectIds: string[]) => deleteObjects(objectIds),
  _updateObject: (object: IObject) => updateObject(object),
};

export default connect(mapStateToProps, mapDispatchToProps)(ContextMenu);
