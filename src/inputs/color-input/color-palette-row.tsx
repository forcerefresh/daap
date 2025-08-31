import { noop } from "lodash-es";
import { hexToRGB } from "../../utils/utils";
import { ColorButtonWithTooltip } from "./color-button-with-tooltip";
import css from "./color-input.module.scss";
import BackgroundSVG from "./transparent-bg.svg?react";
import cx from "classnames";

type RGBAType = { r: number; g: number; b: number; a: number };

export interface ColorPaletteProps {
  colors: string[];
  onColorClick?: (color: RGBAType) => void;
  onClick?: () => void;
  selected?: boolean;
}

export const ColorPaletteRow = (props: ColorPaletteProps) => {
  const { colors, onColorClick, onClick, selected } = props;

  const colorsRgb = colors.map((c) => hexToRGB(c));

  return (
    <div
      className={cx(css.sectionColorRow, {
        [css.sectionColorRowSelected]: selected,
      })}
      onClick={onClick}
    >
      {colorsRgb.map((color, index) => {
        if (!color) return null;
        return (
          <ColorButtonWithTooltip
            color={color}
            onClick={onColorClick ?? noop}
            // onAddToBrand={() => {}}
          />
        );
      })}
    </div>
  );
};
