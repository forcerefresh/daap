import React from "react";
import {
  getFontFamilyField,
  getUnitNumericFiled,
} from "../../inputs/input-utils";
import { cloneDeep } from "lodash-es";
import { Button, Icon, Popover, Spinner } from "@blueprintjs/core";
import { IToolbarProps } from "../../utils/tools/types";
import { TextValues } from "./text";
import css from "./TextToolbar.module.scss";
import {
  IFontSelectInputValue,
  InputType,
} from "webslider-sdk/lib/inputs/i-inputs";
import cx from "classnames";
import colorInputCss from "../../inputs/color-input/color-input.module.scss";
import ColorInputForm from "../../inputs/color-input/color-input";
import AIContextMenu from "./AIContextMenu";
import { connect } from "react-redux";
import { IStore } from "../../store/store";
import { useContext } from "react";
import { IntegrationContext } from "../../integration";

const alignArr = ["left", "center", "right", "justify"];

type IToolbarMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IToolbarProps;

function TextToolbar(props: IToolbarMergedProps): React.ReactElement {
  const {
    object,
    updateObject,
    updateObjectForPreview,
    aiLoading,
  } = props;

  const { platform } = useContext(IntegrationContext);
  const values = object?.properties as TextValues | undefined;
  const isAILoading = object?.id ? aiLoading?.[object.id] : undefined;

  return (
    <>
      {object && values && (
        <div className={css.inputsHolder}>
          {platform.hasAiTextAssistant && (
            <Popover
              content={
                React.createElement(AIContextMenu as any, { onLoading: () => undefined, object })
              }
              placement="bottom-end"
              // tslint:disable-next-line jsx-no-lambda
              renderTarget={({ isOpen, ...p }) => (
                <Button
                  {...p}
                  minimal
                  style={{ color: "rgb(110 240 239)" }}
                  className={cx(css.button, css.squareButton)}
                  icon={
                    isAILoading ? (
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
                        style={{
                          marginRight: "5px",
                          color: "rgb(110 240 239)",
                        }}
                      />
                    )
                  }
                ></Button>
              )}
            />
          )}

          {getFontFamilyField(
            "",
            values.font,
            (v: IFontSelectInputValue) => {
              const newObject = cloneDeep(object);
              newObject.properties.font = v;
              updateObject(newObject);
            },
            { minimal: true }
          )}

          {getUnitNumericFiled(
            "",
            values.fontSize,
            (v: string) => {
              const newObject = cloneDeep(object);
              newObject.properties.fontSize = v;
              updateObject(newObject);
            },
            "",
            {
              className: css.strokeInput,
              showIncDec: true,
            },
            ["px", "em"]
          )}

          <div className={css.colorInputHolder}>
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
          <Button
            className={cx(css.button, css.squareButton)}
            minimal
            active={values.bold}
            onClick={(_e: React.MouseEvent) => {
              const newObject = cloneDeep(object);
              newObject.properties.bold = !values.bold;
              updateObject(newObject);
            }}
            icon={"bold"}
          ></Button>
          <Button
            className={cx(css.button, css.squareButton)}
            minimal
            active={values.italic}
            onClick={(_e: React.MouseEvent) => {
              const newObject = cloneDeep(object);
              newObject.properties.italic = !newObject.properties.italic;
              updateObject(newObject);
            }}
            icon={"italic"}
          ></Button>
          <Button
            className={cx(css.button, css.squareButton)}
            minimal
            active={values.underline}
            onClick={(_e: React.MouseEvent) => {
              const newObject = cloneDeep(object);
              newObject.properties.underline = !newObject.properties.underline;
              updateObject(newObject);
            }}
            icon={"underline"}
          ></Button>

          <Button
            className={cx(css.button, css.squareButton)}
            minimal
            onClick={(_e: React.MouseEvent) => {
              const newObject = cloneDeep(object);

              let nextIndex = alignArr.indexOf(values.textAlign) + 1;
              nextIndex = nextIndex >= alignArr.length ? 0 : nextIndex;

              newObject.properties.textAlign = alignArr[nextIndex];
              updateObject(newObject);
            }}
            icon={`align-${values.textAlign}` as any}
          ></Button>
          <div className={css.rightHolder}></div>
        </div>
      )}
    </>
  );
}

const mapStateToProps = (state: IStore) => {
  const { aiLoading } = state.ai;

  return { aiLoading };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(TextToolbar);
