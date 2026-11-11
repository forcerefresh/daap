import * as React from "react";

import {
  Menu,
  MenuDivider,
  MenuItem,
} from "@blueprintjs/core";
import { IStore } from "../../store/store";
import {
  setAIRequestLoading,
  updateObject,
} from "../../store/actions/actions";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { connect } from "react-redux";

import css from "./AIContextMenu.module.scss";
import { cloneDeep } from "lodash-es";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import { IntegrationContext } from "../../integration";

type IContextMenu = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    object: IObject;
  };

const AIContextMenu: React.FC<IContextMenu> = (props: IContextMenu) => {
  const {
    object,
    _updateObject,
    _setAIRequestLoading,
  } = props;

  const { useAIHook } = React.useContext(IntegrationContext);
  const { textQuery } = useAIHook();

  const queryAI = async ({ template }: { template: string }) => {
    _setAIRequestLoading({ objectId: object.id, loading: true });

    let response: { output?: string; error?: string };
    try {
      response = await textQuery({
        query: object.properties?.text,
        template,
      });
    } catch (ex: any) {
      AppToaster.show({
        intent: "danger",
        message: ex?.response?.error
          ? "AI provider response: " + ex?.response?.data?.error
          : "Something went wrong. AI request is not executed.",
      });

      _setAIRequestLoading({ objectId: object.id, loading: false });

      return;
    }

    const objectClone = cloneDeep(object);
    objectClone.properties.text = response.output;
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
    </Menu>
  );
};

const mapStateToProps = (_state: IStore) => ({});

const mapDispatchToProps = {
  _updateObject: (object: IObject) => updateObject(object),
  _setAIRequestLoading: (payload: { objectId: string; loading: boolean }) =>
    setAIRequestLoading(payload),
};

export default connect(mapStateToProps, mapDispatchToProps)(AIContextMenu);
