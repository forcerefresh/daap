import { hexToRGB } from "../../utils/utils";
import css from "./color-input.module.scss";
import BackgroundSVG from "./transparent-bg.svg?react";
import cx from "classnames";

type RGBAType = { r: number; g: number; b: number; a: number };

export interface ColorPaletteProps {
  colors: string[];
  onSelect: (color: RGBAType) => void;
}

export const ColorPaletteRow = (props: ColorPaletteProps) => {
  const { colors, onSelect } = props;

  const colorsRgb = colors.map(hexToRGB);

  return (
    <div className={css.sectionColorRow}>
      {colorsRgb.map((color, idx) => {
        const colorStyle = {
          backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`,
        };
        return (
          <div
            id="color-input"
            className={cx({
              [css.swatch]: true,
            })}
            onClick={() => onSelect(color)}
            tabIndex={1}
          >
            <BackgroundSVG style={{ position: "absolute" }} />
            <div key={idx} className={css.color} style={colorStyle} />
          </div>
        );
      })}
    </div>
  );
};
