import { RGBColor } from "webslider-sdk/lib/utils/i-rgb-color";
import css from "../ColorPanel.module.scss";
import { ColorButtonWithTooltip } from "../../../inputs/color-input/color-button-with-tooltip";
import { Text } from "@blueprintjs/core";

interface IColorPanelSectionProps {
  title: string;
  info?: string;
  colors: RGBColor[][];
  onColorSelect: (color: RGBColor) => void;
  onAddToBrand: (color: RGBColor) => void;
}

export const ColorPanelSection = (props: IColorPanelSectionProps) => {
  const { colors, title, onColorSelect, onAddToBrand, info } = props;

  if (!colors || colors.length === 0 || !colors[0] || colors[0].length === 0) {
    return null;
  }

  return (
    <section className={css.section}>
      <div className={css.sectionHeader}>
        <div>{title}</div>
        <div style={{ fontWeight: "normal" }} className="bp5-text-small">
          {info}
        </div>
      </div>

      <div className={css.sectionContent}>
        {colors.map((row, rowIndex) => (
          <div key={rowIndex} className={css.sectionColorRow}>
            {[...row].map((color, index) => {
              return (
                <ColorButtonWithTooltip
                  color={color}
                  onClick={() => onColorSelect(color)}
                  onAddToBrand={() => onAddToBrand(color)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
};
