import React from "react";
import cx from "classnames";
import {
  Button,
  Card,
  Checkbox,
  Elevation,
  FormGroup,
  Radio,
  RadioGroup,
  Tab,
  Tabs,
  Text,
} from "@blueprintjs/core";
import css from "./Breakpoint.module.scss";

import { getNumericFiled, getSelectField } from "../../../inputs/input-utils";
import { getResponsiveIcon } from "../../../utils/icons/responsive-icons-factory";
import { BreakpointConfiguration } from "../../../store/reducers/settings";
import { BreakpointPreview } from "../breakpoint-preview/BreakpointPreview";
import { set } from "lodash-es";

export interface IBreakpointSettingsProps {
  breakpointConfiguration: BreakpointConfiguration;
  pixelMultiplier: number;
  onChange: (breakpointSettings: BreakpointConfiguration) => void;
}

export const Breakpoint: React.FC<IBreakpointSettingsProps> = (props) => {
  const { breakpointConfiguration, pixelMultiplier, onChange } = props;

  const responsiveIcon = getResponsiveIcon(breakpointConfiguration.icon);

  return (
    <div className={css.breakpointSettings}>
      <div className={cx(css.breakpointForm)}>
        <div>
          {responsiveIcon}
          <h3>{breakpointConfiguration.name}</h3>
        </div>
        <div>
          <div className={css.inlineRow}>
            <Text className={css.inlineRowLabel}>Horizontal fit</Text>
            <div>
              {getSelectField(
                "",
                breakpointConfiguration.normal.horizontalFitTo as any,
                [
                  { label: "Viewport", value: "viewport" },
                  { label: "Slider", value: "slider" },
                  { label: "Fit to parent", value: "fitToParent" },
                  { label: "Custom", value: "custom" },
                ],
                (value: number) => {
                  set(breakpointConfiguration, "normal.horizontalFitTo", value);
                  onChange({ ...breakpointConfiguration });
                }
              )}
            </div>
          </div>

          <div className={css.inlineRow}>
            <Text className={css.inlineRowLabel}>Vertical fit</Text>
            <div>
              {getSelectField(
                "",
                breakpointConfiguration.normal.verticalFitTo as any,
                [
                  { label: "Viewport", value: "viewport" },
                  { label: "Keep aspect ratio", value: "keepAspectRation" },
                  { label: "Fit to parent", value: "fitToParent" },
                  { label: "Custom", value: "custom" },
                ],
                (value: number) => {
                  set(breakpointConfiguration, "normal.horizontalFitTo", value);
                  onChange({ ...breakpointConfiguration });
                }
              )}
            </div>
          </div>

          <div className={css.inlineRow}>
            <Text className={css.inlineRowLabel}>Page</Text>
            <div className="input60 labelOneLetter">
              {getNumericFiled(
                "W",
                breakpointConfiguration.normal.page.width,
                (value: number) => {
                  set(breakpointConfiguration, "normal.page.width", value);
                  onChange({ ...breakpointConfiguration });
                }
              )}
            </div>
          </div>
          <div className={css.inlineRow}>
            <Text className={css.inlineRowLabel}>Slider size</Text>
            <div className="input60 labelOneLetter">
              {getNumericFiled(
                "W",
                breakpointConfiguration.normal.slide.width,
                (value: number) => {
                  set(breakpointConfiguration, "normal.slide.width", value);
                  onChange({ ...breakpointConfiguration });
                }
              )}
            </div>
            <div className="input60 labelOneLetter">
              {getNumericFiled(
                "H",
                breakpointConfiguration.normal.slide.height,
                (value: number) => {
                  set(breakpointConfiguration, "normal.slide.height", value);
                  onChange({ ...breakpointConfiguration });
                }
              )}
            </div>
          </div>

          <div className={css.inlineRow}>
            <Text className={css.inlineRowLabel}>Guidelines padding</Text>
            <div className="input60 labelOneLetter">
              {getNumericFiled(
                "T",
                breakpointConfiguration.normal.guidelinesPadding.top,
                (value: number) => {
                  set(
                    breakpointConfiguration,
                    "normal.guidelinesPadding.top",
                    value
                  );
                  onChange({ ...breakpointConfiguration });
                }
              )}
            </div>
            <div className="input60 labelOneLetter">
              {getNumericFiled(
                "B",
                breakpointConfiguration.normal.guidelinesPadding.bottom,
                (value: number) => {
                  set(
                    breakpointConfiguration,
                    "normal.guidelinesPadding.bottom",
                    value
                  );
                  onChange({ ...breakpointConfiguration });
                }
              )}
            </div>

            <div className="input60 labelOneLetter">
              {getNumericFiled(
                "L",
                breakpointConfiguration.normal.guidelinesPadding.left,
                (value: number) => {
                  set(
                    breakpointConfiguration,
                    "normal.guidelinesPadding.left",
                    value
                  );
                  onChange({ ...breakpointConfiguration });
                }
              )}
            </div>
            <div className="input60 labelOneLetter">
              {getNumericFiled(
                "R",
                breakpointConfiguration.normal.guidelinesPadding.right,
                (value: number) => {
                  set(
                    breakpointConfiguration,
                    "normal.guidelinesPadding.right",
                    value
                  );
                  onChange({ ...breakpointConfiguration });
                }
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={css.breakpointPreview}>
        <BreakpointPreview
          breakpointConfiguration={breakpointConfiguration}
          pixelMultiplier={pixelMultiplier}
        />
      </div>
    </div>
  );
};
