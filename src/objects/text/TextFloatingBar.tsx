import React from "react";
import { getUnitNumericFiled } from "../../inputs/input-utils";
import { cloneDeep } from "lodash-es";
import { Button, Icon, Popover, Spinner } from "@blueprintjs/core";
import { IToolbarProps } from "../../utils/tools/types";
import { TEXT, TextValues } from "./text";

import css from "./TextFloatingBar.module.scss";
import colorInputCss from "../../inputs/color-input/color-input.module.scss";
import { InputType } from "webslider-sdk/lib/inputs/i-inputs";
import ColorInputForm from "../../inputs/color-input/color-input";
import AIContextMenu from "./AIContextMenu";
import { connect } from "react-redux";
import { IStore } from "../../store/store";

type IToolbarMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IToolbarProps;

function TextFloatingToolbar(
  props: IToolbarMergedProps
): React.ReactElement | null {
  const {
    object,
    updateObject,
    updateObjectForPreview,
    aiLoading,
    aiEnabled,
  } = props;

  const values = object?.properties as TextValues | undefined;

  const isAILoading = object?.id ? aiLoading?.[object.id] : undefined;
  const isAIEnabled = aiEnabled?.[TEXT];

  return object && values ? (
    <div className={css.inputsHolder}>
      {isAIEnabled && (
        <Popover
          content={<AIContextMenu object={object} />}
          placement="bottom-end"
          // tslint:disable-next-line jsx-no-lambda
          renderTarget={({ isOpen, ...p }) => (
            <Button
              {...p}
              minimal
              style={{ marginLeft: "0px", color: "rgb(110 240 239)" }}
            >
              {isAILoading ? (
                <Spinner
                  size={18}
                  className={css.inlineSpinner}
                  style={{
                    marginLeft: "0px",
                    marginRight: "15px",
                    color: "rgb(110 240 239)",
                  }}
                />
              ) : (
                <Icon
                  icon={"clean"}
                  style={{ marginRight: "5px", color: "rgb(110 240 239)" }}
                />
              )}
              Assist
            </Button>
          )}
        />
      )}

      {getUnitNumericFiled(
        "",
        values.fontSize + "px",
        (v: string) => {
          const newObject = cloneDeep(object);
          newObject.properties.fontSize = v;
          updateObject(newObject);
        },
        "",
        {
          className: css.fontSizeInput,
          showIncDec: true,
        },
        ["px", "em"]
      )}

      <div>
        <ColorInputForm
          inputType={InputType.COLOR}
          displayName={""}
          propertyName={""}
          value={values.color}
          defaultValue={null}
          onChange={(value: any) => {
            const newObject = cloneDeep(object);
            newObject.properties.color = value;
            updateObject(newObject);
          }}
          onPreview={(value: any) => {
            const newObject = cloneDeep(object);
            newObject.properties.color = value;
            updateObjectForPreview(newObject);
          }}
          inputProps={{
            swatchClassName: colorInputCss.squareSwatch,
            className: colorInputCss.squareColorInput,
          }}
        />
      </div>
    </div>
  ) : null;
}

const mapStateToProps = (state: IStore) => {
  const { aiLoading, aiEnabled } = state.ai;

  return { aiLoading, aiEnabled };
};

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TextFloatingToolbar);
