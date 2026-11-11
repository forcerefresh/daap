import { useContext } from "react";
import cx from "classnames";
import { Button, Card, Elevation } from "@blueprintjs/core";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import css from "./DevelopmentPanel.module.scss";
import { getTextField } from "../../inputs/input-utils";
import { DevelopmentItem } from "./i-development-types";
import { unregisterObject } from "webslider-sdk/lib/objects/objects-register";
import { IntegrationContext } from "../../integration";

export interface IDevelopmentItemProps {
  item: DevelopmentItem;
  updateItem: (
    id: string,
    propertyName: keyof DevelopmentItem,
    value: string | any,
    multipleUpdates: Partial<DevelopmentItem>
  ) => Promise<void>;
  onDeleteItem: (id: string) => void;
}

const DevelopmentItemComp = (props: IDevelopmentItemProps) => {
  const { item, updateItem, onDeleteItem } = props;
  const globalContext = useContext(IntegrationContext);
  const { updateDevelopmentItem } = globalContext.useDevelopmentHook();

  return (
    <Card
      key={item.id}
      interactive={false}
      elevation={Elevation.TWO}
      className={cx(css.sectionCard)}
    >
      <div className={"input600"}>
        <p>
          <strong>Extension 1</strong>
        </p>
        {getTextField(
          "Token",
          item.token,
          (val: string) => {
            const p: string[] = val.split(":");

            const itemPartial: Partial<DevelopmentItem> = {
              extensionType: p[3],
              type: p[4],
              version: p[5],
              appDevUrl:
                p[0] + "://" + p[1] + ":" + p[2] + "/" + p[4] + "-app.js",
              playerDevUrl:
                p[0] + "://" + p[1] + ":" + p[2] + "/" + p[4] + "-player.js",
            };

            updateItem(item.id, "token", val, itemPartial);
          },
          "",
          { disabled: item.monitoringEnabled }
        )}

        {item.token && (
          <table style={{ marginBottom: "20px" }}>
            <tr>
              <td>Extension: </td>{" "}
              <td>
                <strong>{item.extensionType}</strong>
              </td>
            </tr>
            <tr>
              <td>Type: </td>{" "}
              <td>
                <strong>{item.type}</strong>
              </td>
            </tr>
            <tr>
              <td>Version: </td>{" "}
              <td>
                <strong>{item.version}</strong>
              </td>
            </tr>
            <tr>
              <td> Player runtime: </td>{" "}
              <td>
                <strong>{item.playerDevUrl}</strong>
              </td>
            </tr>
            <tr>
              <td> App runtime: </td>{" "}
              <td>
                <strong>{item.appDevUrl}</strong>
              </td>
            </tr>
          </table>
        )}
        <div className={css.buttonsHolder}>
          <Button
            disabled={item.monitoringEnabled}
            onClick={async () => {
              if (!item.token) {
                AppToaster.show({
                  message: "Token is mandatory.",
                  intent: "warning",
                });
                return;
              } else if (!item.appDevUrl || (item.extensionType !== "plugin" && !item.playerDevUrl) || !item.type) {
                AppToaster.show({
                  message: "Token is not valid.",
                  intent: "warning",
                });
                return;
              } else {
                const obj: DevelopmentItem = {
                  ...item,
                  monitoringEnabled: true,
                };

                await updateDevelopmentItem(obj);

                AppToaster.show({
                  message:
                    "Item '" + item.type + "' monitoring has been started.",
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

              unregisterObject(obj.type, obj.version || "");

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
            {item.statusMessage && <p>Error response: {item.statusMessage}</p>}
          </>
        )}
      </div>
    </Card>
  );
};

export default DevelopmentItemComp;
