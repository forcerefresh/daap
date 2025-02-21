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
  setAIRequestLoading,
  ungroupObject,
  updateObject,
} from "../../store/actions/actions";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { connect } from "react-redux";

import { IClipboard } from "../../store/reducers/i-clipboard";
import css from "./AIContextMenu.module.scss";
import axios, { AxiosResponse } from "axios";
import { cloneDeep } from "lodash-es";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";

export interface MoreMenuProps extends Props {
  shouldDismissPopover?: boolean;
}

type IContextMenu = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    object: IObject;
  };

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
    object,
    _updateObject,
    _setAIRequestLoading,
  } = props;

  const queryAI = async ({ template }: { template: string }) => {
    _setAIRequestLoading({ objectId: object.id, loading: true });

    let response: AxiosResponse<any, any>;
    try {
      response = await axios.post("api/v1/ai", {
        query: object.properties?.text,
        template,
      });
    } catch (ex: any) {
      AppToaster.show({
        intent: "danger",
        message: ex?.response?.data?.error
          ? "AI provider response: " + ex?.response?.data?.error
          : "Something went wrong. AI request is not executed.",
      });

      _setAIRequestLoading({ objectId: object.id, loading: false });

      return;
    }

    const objectClone = cloneDeep(object);
    objectClone.properties.text = response.data.output;
    _updateObject(objectClone);

    _setAIRequestLoading({ objectId: object.id, loading: false });
  };

  return (
    <Menu className={css.contextMenu}>
      <MenuItem
        icon="spell-check"
        text="Fix grammar"
        onClick={async () => {
          queryAI({ template: "promptFixGrammar" });
        }}
      />
      {/* <MenuItem icon="edit" text="Rewrite" /> */}

      <MenuDivider />

      <MenuItem
        icon="shorten-text"
        text="Shorten"
        onClick={async () => {
          queryAI({ template: "promptShorten" });
        }}
      />
      <MenuItem
        icon="lengthen-text"
        text="Longer"
        onClick={async () => {
          queryAI({ template: "promptLonger" });
        }}
      />

      <MenuItem
        icon="emoji"
        text="Informal"
        onClick={async () => {
          queryAI({ template: "promptInformal" });
        }}
      />

      <MenuItem
        icon="paragraph"
        text="Formal"
        onClick={async () => {
          queryAI({ template: "promptFormal" });
        }}
      />

      {/* <MenuDivider />

      <MenuItem
        text="Make a slogan"
        icon="app-header"
        onClick={() => {
          //   _groupObjects(selectedObjectIds);
        }}
      /> */}

      {/* <MenuDivider />

      <MenuItem
        text="Custom request"
        icon="list"
        onClick={() => {
          //   _groupObjects(selectedObjectIds);
        }}
      /> */}
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
  _deleteObjects: (objectIds: string[]) => {
    deleteObjects(objectIds);
  },
  _updateObject: (object: IObject) => updateObject(object),
  _setAIRequestLoading: (payload: { objectId: string; loading: boolean }) =>
    setAIRequestLoading(payload),
};

export default connect(mapStateToProps, mapDispatchToProps)(AIContextMenu);
