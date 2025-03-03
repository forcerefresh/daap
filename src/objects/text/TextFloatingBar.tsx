import React, { useState } from "react";
import { getUnitNumericFiled } from "../../inputs/input-utils";
import { cloneDeep } from "lodash-es";
import { Button, Icon, Popover, Spinner } from "@blueprintjs/core";
import { IToolbarProps } from "../../utils/tools/types";
import { TEXT, TextValues } from "./text";

import css from "./TextFloatingBar.module.scss";
import colorInputCss from "../../inputs/color-input/color-input.module.scss";
import {
  IBorderColorValue,
  IBorderValue,
  IBoxValue,
  IClipMaskValue,
  ICornerRadiusValue,
  ICoverPlacementValue,
  IFontSelectInputValue,
  IGridLayoutInputValue,
  IInsetLayoutInputValue,
  ILayoutChildrenValue,
  INumericTimelineValue,
  IParallaxInputValue,
  IRelativePositionValue,
  IRelativeRotationValue,
  ITextStartPositionValue,
  ITimelinesValue,
  InputType,
} from "webslider-sdk/lib/inputs/i-inputs";
import ColorInputForm from "../../inputs/color-input/color-input";
import { RGBColor } from "webslider-sdk/lib/utils/i-rgb-color";
import ContextMenu from "../../panels/context-menu/ContextMenu";
import AIContextMenu from "./AIContextMenu";
import { connect } from "react-redux";
import { IStore } from "../../store/store";

const ICON_HEIGHT = 36;

type IToolbarMergedProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> &
  IToolbarProps;

function TextFloatingToolbar(
  props: IToolbarMergedProps
): React.ReactElement | null {
  const {
    mode,
    object,
    updateObject,
    updateObjectForPreview,
    deleteObject,
    aiLoading,
    aiEnabled,
  } = props;

  const values = object?.properties as TextValues | undefined;

  console.log(values);

  const isAILoading = aiLoading?.[object?.id];
  const isAIEnabled = aiEnabled?.[TEXT];

  return object && values ? (
    <div className={css.inputsHolder}>
      {/* {getFontFamilyField(
        "",
        values.font,
        (v: IFontSelectInputValue) => {
          const newObject = cloneDeep(object);
          newObject.definition.values.font = v;
          updateObject(newObject);
        },
        { minimal: true }
      )} */}

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
        {/* <input
          type="color"
          id="head"
          name="head"
          value={convertRGBColor2RGBAString(values.color)}
          onChange={(evt) => {
            const newObject = cloneDeep(object);
            newObject.definition.values.color = hexToRGB(
              evt.currentTarget.value
            );
            updateObject(newObject);
          }}
          style={{ width: "30px", height: "30px", margin: "0px" }}
        /> */}
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
