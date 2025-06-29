import { RGBColor } from "webslider-sdk/lib/utils/i-rgb-color";
import BackgroundSVG from "./transparent-bg.svg?react";
import {
  Button,
  Icon,
  Popover,
  PopoverInteractionKind,
  Position,
} from "@blueprintjs/core";
import cx from "classnames";

import css from "./color-split-button.module.scss";
import classNames from "classnames";
import { ColorButtonWithTooltip } from "./color-button-with-tooltip";
import { AppToaster } from "../../utils/components/app-toaster/AppToaster";
import { rgbaToHex } from "./color-utils";
import { omit } from "lodash-es";
import copyToClipboard from "copy-to-clipboard";
import iro from "@jaames/iro";
import { useEffect, useRef, useState } from "react";
import { hexToRGB } from "../../utils/utils";

export interface ColorSplitButtonWithTooltipProps {
  color: RGBColor;
  onColorChange: (color: RGBColor) => void;
  onColorPreview: (color: RGBColor) => void;
  onAddToBrand: () => void;
  className?: string;
}

export const ColorSplitButtonWithTooltip: React.FC<
  ColorSplitButtonWithTooltipProps
> = (props) => {
  const { color, onColorChange, onAddToBrand, className, onColorPreview } =
    props;

  let background = "transparent";

  if (typeof color?.a === "number") {
    background = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
  } else if (color) {
    background = `rgb(${color.r}, ${color.g}, ${color.b})`;
  }

  const commonStyle = {
    margin: "-2%",
    width: "104%",
    height: "104%",
  };

  const [refresh, setRefresh] = useState(1);

  const colorPickerHolderRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (colorPickerHolderRef.current) {
      const colorPicker = new (iro.ColorPicker as any)(
        colorPickerHolderRef.current,
        {
          width: 200,
          color: rgbaToHex(omit(color, "a")),
        }
      );

      const colorPreviewHandler = (newColor: any) => {
        onColorPreview(hexToRGB(newColor.hexString)!);
      };

      const colorChangeHandler = (newColor: any) => {
        onColorChange(hexToRGB(newColor.hexString)!);
      };

      colorPicker.on("color:change", colorPreviewHandler);
      colorPicker.on("input:end", colorChangeHandler);

      return () => {
        colorPicker.off("color:change", colorChangeHandler);
        colorPicker.off("input:end", colorChangeHandler);

        if (colorPickerHolderRef.current)
          colorPickerHolderRef.current.innerHTML = "";
      };
    }
  }, [refresh]);

  return (
    <Popover
      interactionKind={PopoverInteractionKind.CLICK}
      position={Position.BOTTOM_LEFT}
      hoverOpenDelay={0}
      className={css.popover2}
      onOpening={() => setRefresh(refresh + 1)}
      content={
        <div style={{ cursor: "pointer" }}>
          <div style={{ display: "flex" }}>
            <div style={{ padding: "10px", width: "80px" }}>
              {rgbaToHex(omit(color, "a"))}
            </div>
            <Button
              minimal
              icon="duplicate"
              onClick={() => {
                const hexColor = rgbaToHex(omit(color, "a"))!;
                copyToClipboard(hexColor);
                AppToaster.show({
                  intent: "success",
                  message: `Color ${hexColor} has been copied to clipboard`,
                });
              }}
            ></Button>

            {onAddToBrand && (
              <Button minimal icon="add" onClick={onAddToBrand}>
                Add to brand
              </Button>
            )}
          </div>
          <div style={{ padding: "20px" }}>
            <div ref={colorPickerHolderRef}></div>
          </div>
        </div>
      }
    >
      <div className={css.splitHolder} style={{ cursor: "pointer" }}>
        {/* <ColorButtonWithTooltip
        color={color}
        onClick={onClick}
        className={cx(css.colorButton, className)}
      /> */}

        <div
          id="color-input"
          className={cx(css.colorButton, className)}
          onClick={() => onColorChange(color)}
          // tabIndex={1}
        >
          {color ? (
            <>
              <BackgroundSVG
                style={{
                  position: "absolute",
                  transform: "scale(1.1)",
                  transformOrigin: "top left",
                }}
              />
              <div
                className={css.color}
                style={{ background, ...commonStyle }}
              />
            </>
          ) : (
            <Icon
              size={18}
              icon="disable"
              intent="danger"
              className={css.noColor}
            />
          )}
        </div>
        <Icon icon="caret-down"></Icon>
      </div>
    </Popover>
  );
};
