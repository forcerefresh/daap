import React, { useContext, useEffect } from "react";
import { v4 as uuid } from "uuid";
import cx from "classnames";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import { Button, Card, Elevation } from "@blueprintjs/core";
import { IntegrationContext } from "../../integration";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import css from "./DevelopmentPanel.module.scss";
import { forceRefresh } from "../../store/actions/actions";
import { getSelectField, getTextField } from "../../inputs/input-utils";
import { DevelopmentItem } from "./i-development-types";
import { String } from "aws-sdk/clients/apigateway";
import { unregisterObject } from "../../webslider-sdk/src/objects/objects-register";
import { DevelopmentContext } from "../../utils/development/DevelopmentProvider";

interface IDevelopmentPanelProps {
  onRequestClose: () => void;
}

export type IDevelopmentMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IDevelopmentPanelProps;

const DevelopmentPanel: React.FC<IDevelopmentMergedProps> = (props) => {
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
    value: string | any
  ) => {
    let itemToUpdate = items.find((item) => item.id === id);
    if (itemToUpdate) {
      itemToUpdate = {
        ...itemToUpdate,
        [propertyName]: value,
        monitoringEnabled: false,
        status: "",
        statusMessage: "",
      };
      await updateDevelopmentItem(itemToUpdate);
    }
  };

  const addItem = async (componentType: string) => {
    await addDevelopmentItem({
      id: uuid(),
      componentType,
      type: "",
      playerDevUrl: "",
      appDevUrl: "",
      monitoringEnabled: false,
      status: "",
      statusMessage: "",
    });

    //const newItems = await getAll();
    //setItems(newItems);
  };

  const onDeleteItem = async (id: string) => {
    const delItem = items.find((itm) => itm.id === id);

    if (delItem) {
      await deleteDevelopmentItem(id);

      //const newItems = await getAll();
      //setItems(newItems);

      AppToaster.show({
        message: "Item '" + delItem.type + "' has been deleted successfully",
        intent: "success",
      });

      // unregister item
      unregisterObject(delItem.type);
    }
  };

  return (
    <div className={css.extensionsPanel}>
      <div className={css.headerSection}>
        <div>
          Register component you are working on to get instant preview directly
          in Web Slider app.
        </div>
      </div>
      {items.map((item, idx) => {
        return (
          <Card
            interactive={false}
            elevation={Elevation.TWO}
            className={cx(css.sectionCard)}
          >
            <div className={"input600"}>
              <p>
                <strong>Object 1</strong>
              </p>
              {getSelectField(
                "Type",
                item.componentType,
                [
                  { label: "Object", value: "object" },
                  { label: "Animation", value: "animation" },
                ],
                (val) => updateItem(item.id, "componentType", val),
                { disabled: item.monitoringEnabled }
              )}
              {getTextField(
                "Player URL",
                item.playerDevUrl,
                (val: string) => updateItem(item.id, "playerDevUrl", val),
                "URL for Player component",
                { disabled: item.monitoringEnabled }
              )}
              {getTextField(
                "App URL",
                item.appDevUrl,
                (val: string) => updateItem(item.id, "appDevUrl", val),
                "URL for App component",
                { disabled: item.monitoringEnabled }
              )}
              {getTextField(
                "UID",
                item.type,
                (val: string) => updateItem(item.id, "type", val),
                "",
                { disabled: item.monitoringEnabled }
              )}
              <div className={css.buttonsHolder}>
                <Button
                  disabled={item.monitoringEnabled}
                  onClick={async () => {
                    if (
                      !items?.[idx].appDevUrl ||
                      !items?.[idx].playerDevUrl ||
                      !items?.[idx].type
                    ) {
                      AppToaster.show({
                        message: "All fields are mandatory.",
                        intent: "warning",
                      });
                      return;
                    } else {
                      const obj: DevelopmentItem = {
                        ...item,
                        monitoringEnabled: true,
                      };
                      await updateDevelopmentItem(obj);
                      //const newItems = await getAll();
                      //setItems(newItems);

                      AppToaster.show({
                        message:
                          "Item '" +
                          item.type +
                          "' monitoring has been started.",
                        intent: "success",
                      });
                    }
                  }}
                >
                  Start monitoring changes
                </Button>
                <Button
                  disabled={!item.monitoringEnabled}
                  onClick={async () => {
                    const obj: DevelopmentItem = {
                      ...item,
                      monitoringEnabled: false,
                    };
                    await updateDevelopmentItem(obj);
                    //const newItems = await getAll();
                    //setItems(newItems);

                    unregisterObject(obj.type);

                    AppToaster.show({
                      message:
                        "Item '" + item.type + "' monitoring has been stopped.",
                      intent: "success",
                    });
                  }}
                >
                  Stop monitoring changes
                </Button>
                <Button
                  intent="danger"
                  icon="trash"
                  className={css.delete}
                  minimal
                  onClick={() => onDeleteItem(item.id)}
                ></Button>
              </div>
              {item.monitoringEnabled && (
                <>
                  <p>
                    Monitoring status:{" "}
                    <strong
                      className={cx({
                        [css.error]: item.status === "ERROR",
                        [css.ok]: item.status === "OK",
                      })}
                    >
                      {item.status ? item.status : "Waiting for status...."}{" "}
                    </strong>
                  </p>
                  {item.statusMessage && (
                    <p>Error response: {item.statusMessage}</p>
                  )}
                </>
              )}
            </div>
          </Card>
        );
      })}

      <div className={css.actionHolder}>
        <Button
          intent="primary"
          icon={"plus"}
          onClick={() => addItem("object")}
        >
          Add Component
        </Button>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => ({});

const mapDispatchToProps = {
  _forceRefresh: () => forceRefresh(),
};

export default connect(mapStateToProps, mapDispatchToProps)(DevelopmentPanel);
