import React, { useContext, useEffect } from "react";
import { v4 as uuid } from "uuid";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import { Button } from "@blueprintjs/core";
import { IntegrationContext } from "../../integration";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import css from "./DevelopmentPanel.module.scss";
import { unregisterObject } from "webslider-sdk/lib/objects/objects-register";
import { DevelopmentContext } from "../../utils/development/DevelopmentProvider";
import DevelopmentItemComp from "./DevelopmentItem";
import { DevelopmentItem } from "./i-development-types";

interface IDevelopmentPanelProps {
  onRequestClose: () => void;
}

export type IDevelopmentMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IDevelopmentPanelProps;

const DevelopmentPanel: React.FC<IDevelopmentMergedProps> = (_props) => {
  const globalContext = useContext(IntegrationContext);
  const {
    getAll,
    addDevelopmentItem,
    deleteDevelopmentItem,
    updateDevelopmentItem,
  } = globalContext.useDevelopmentHook();

  const { developmentItems: items } = useContext(DevelopmentContext);

  useEffect(() => {
    getAll().then(() => {});
  }, []);

  const updateItem = async (
    id: String,
    propertyName: keyof DevelopmentItem,
    value: string | any,
    overrideMultiple: Partial<DevelopmentItem> = {}
  ) => {
    let itemToUpdate = items.find((item) => item.id === id);
    if (itemToUpdate) {
      itemToUpdate = {
        ...itemToUpdate,
        [propertyName]: value,
        monitoringEnabled: false,
        status: "",
        statusMessage: "",
        ...overrideMultiple,
      };
      await updateDevelopmentItem(itemToUpdate);
    }
  };

  const addItem = async (extensionType: string) => {
    await addDevelopmentItem({
      id: uuid(),
      token: "",
      extensionType,
      type: "",
      playerDevUrl: "",
      appDevUrl: "",
      monitoringEnabled: false,
      status: "",
      statusMessage: "",
    } as any);

  };

  const onDeleteItem = async (id: string) => {
    const delItem = items.find((itm) => itm.id === id);

    if (delItem) {
      await deleteDevelopmentItem(id);

      AppToaster.show({
        message: "Item '" + delItem.type + "' has been deleted successfully",
        intent: "success",
      });

      // unregister item
      unregisterObject(delItem.type, delItem.version || "");
    }
  };

  return (
    <div className={css.extensionsPanel}>
      <div className={css.headerSection}>
        <div>
          Register component you are working on to get instant preview directly
          in Web Slider app.
        </div>
        <div>
          Extension added here can be used only in Web Slider app. <br />
          For production you have to build and upload extension to Local
          Extensions.
        </div>
      </div>

      {items.map((item, _idx) => {
        return (
          <DevelopmentItemComp
            key={item.id}
            onDeleteItem={onDeleteItem}
            updateItem={updateItem}
            item={item}
          />
        );
      })}

      <div className={css.actionHolder}>
        <Button
          intent="primary"
          icon={"plus"}
          onClick={() => addItem("object")}
        >
          Add Extension
        </Button>
        <Button
          intent="primary"
          icon={"plus"}
          onClick={() => addItem("plugin")}
        >
          Add Plugin
        </Button>
      </div>
    </div>
  );
};

const mapStateToProps = (_state: IStore) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(DevelopmentPanel);
