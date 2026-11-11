import { Button } from "@blueprintjs/core";
import ColorPicker from "react-pick-color";
import css from "./color-input.module.scss";
import BackgroundSVG from "./transparent-bg.svg?react";
import cx from "classnames";

type RGBAType = { r: number; g: number; b: number; a: number };

export interface CustomColorPickerProps {
  initialColor?: RGBAType;
  color?: RGBAType;
  onChange: (color: RGBAType) => void;
  onApply: () => void;
  onCancel: () => void;
}

export const CustomColorPicker = (props: CustomColorPickerProps) => {
  const {
    color = { r: 255, b: 255, g: 255, a: 1 },
    initialColor = { r: 255, b: 255, g: 255, a: 1 },
    onApply,
    onCancel,
    onChange,
  } = props;

  const styleCurrent = {
    background: color
      ? `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
      : "transparent",
  };

  const styleCancel = {
    background: initialColor
      ? `rgba(${initialColor.r}, ${initialColor.g}, ${initialColor.b}, ${initialColor.a})`
      : "transparent",
  };

  return (
    <>
      <div>
        <ColorPicker
          theme={{ width: "320px" }}
          color={color}
          onChange={(color) => onChange(color.rgb)}
        />
      </div>
      <div className={css.actionHolder}>
        <div className={css.buttonHolder}>
          <Button
            className={cx(css.colorButton)}
            onClick={onApply}
            icon={
              <div
                id="color-input"
                className={cx(css.swatch, css.squareSwatch)}
                tabIndex={1}
              >
                <BackgroundSVG style={{ position: "absolute" }} />
                <div className={css.color} style={styleCurrent} />
              </div>
            }
          >
            Apply
          </Button>
          <Button
            icon={
              <div
                id="color-input"
                className={cx(css.swatch, css.squareSwatch)}
                tabIndex={1}
              >
                <BackgroundSVG style={{ position: "absolute" }} />
                <div className={css.color} style={styleCancel} />
              </div>
            }
            className={css.colorButton}
            onClick={onCancel}
            intent="none"
            minimal
          >
            Cancel
          </Button>
        </div>
      </div>
    </>
  );
};
