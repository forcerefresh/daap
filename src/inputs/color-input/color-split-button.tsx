import { RGBColor } from "webslider-sdk/lib/utils/i-rgb-color";
import BackgroundSVG from "./transparent-bg.svg?react";
import { Icon } from "@blueprintjs/core";
import cx from "classnames";

import css from "./color-split-button.module.scss";

export interface ColorButtonProps {
  color: RGBColor;
  onClick: () => void;
  className?: string;
}

export const ColorSplitButton: React.FC<ColorButtonProps> = (props) => {
  const { color, onClick, className } = props;

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
  return (
    <div className={css.splitHolder}>
      <div
        id="color-input"
        className={cx(css.colorButton, className)}
        onClick={onClick}
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
            <div className={css.color} style={{ background, ...commonStyle }} />
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
  );
};
