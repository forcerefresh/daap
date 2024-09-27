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
} from "../../store/actions/actions";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { connect } from "react-redux";

import { IClipboard } from "../../store/reducers/i-clipboard";
import css from "./AIContextMenu.module.scss";

export interface MoreMenuProps extends Props {
  shouldDismissPopover?: boolean;
}

type IContextMenu = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps>;

const AIContextMenu: React.FC<IContextMenu> = (props: IContextMenu) => {
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
  } = props;

  return (
    <Menu className={css.contextMenu}>
      <MenuItem icon="spell-check" text="Fix grammar" onClick={() => {}} />
      <MenuItem icon="edit" text="Rewrite" />

      <MenuDivider />

      <MenuItem icon="shorten-text" text="Shorten" />
      <MenuItem icon="lengthen-text" text="Longer" />

      <MenuItem icon="emoji" text="Informal" />

      <MenuItem icon="paragraph" text="Formal" />

      <MenuDivider />

      <MenuItem
        text="Make a slogan"
        icon="app-header"
        onClick={() => {
          //   _groupObjects(selectedObjectIds);
        }}
      />

      <MenuDivider />

      <MenuItem
        text="Custom request"
        icon="list"
        onClick={() => {
          //   _groupObjects(selectedObjectIds);
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
};

export default connect(mapStateToProps, mapDispatchToProps)(AIContextMenu);
