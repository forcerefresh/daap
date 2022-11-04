import React from "react";
import cx from "classnames";
import {
  Button,
  Card,
  Checkbox,
  Elevation,
  FormGroup,
  Icon,
  Radio,
  RadioGroup,
  Tab,
  Tabs,
  Text,
  Tooltip,
} from "@blueprintjs/core";
import css from "./Breakpoint.module.scss";

import {
  getCheckboxField,
  getNumericFiled,
  getSelectField,
} from "../../../inputs/input-utils";
import { getResponsiveIcon } from "../../../utils/icons/responsive-icons-factory";
import { getIconByType } from "../../../store/reducers/settings";
import { BreakpointPreview } from "../breakpoint-preview/BreakpointPreview";
import { set } from "lodash-es";
import { BreakpointConfiguration } from "webslider-sdk2/lib/common/i-breakpoint-configuration";
import {
  Popover2,
  Popover2InteractionKind,
  Tooltip2,
} from "@blueprintjs/popover2";

export interface IBreakpointSettingsProps {
  breakpointConfiguration: BreakpointConfiguration;
  pixelMultiplier: number;
  onChange: (breakpointSettings: BreakpointConfiguration) => void;
}

export const Breakpoint: React.FC<IBreakpointSettingsProps> = (props) => {
  const { breakpointConfiguration, pixelMultiplier, onChange } = props;

  const responsiveIcon = getResponsiveIcon(
    getIconByType(breakpointConfiguration.type)
  );

  return (
    <div className={css.breakpointSettings}>
      <div className={cx(css.breakpointForm)}>
        <div>
          {responsiveIcon}
          <h3>{breakpointConfiguration.name}</h3>
        </div>
        <div>
          {/*<div className={css.inlineRow}>
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
          </div>*/}

          {/*<div className={css.inlineRow}>
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
          </div>*/}

          <div className={css.inlineRow}>
            <Text className={css.inlineRowLabel}>Breakpoint width</Text>
            <div className="input60">
              {getNumericFiled(
                "From",
                breakpointConfiguration.normal.breakpoint.width.from,
                (value: number) => {
                  set(
                    breakpointConfiguration,
                    "normal.breakpoint.width.from",
                    value
                  );
                  onChange({ ...breakpointConfiguration });
                }
              )}
              {getCheckboxField(
                "Ext. to Min",
                !!breakpointConfiguration.normal.breakpoint.width.fromMin,
                (value: boolean) => {
                  set(
                    breakpointConfiguration,
                    "normal.breakpoint.width.fromMin",
                    value
                  );
                  onChange({ ...breakpointConfiguration });
                }
              )}
            </div>
            <div className="input60">
              {getNumericFiled(
                "To",
                breakpointConfiguration.normal.breakpoint.width.to,
                (value: number) => {
                  set(
                    breakpointConfiguration,
                    "normal.breakpoint.width.to",
                    value
                  );
                  onChange({ ...breakpointConfiguration });
                }
              )}
              {getCheckboxField(
                "Ext. to Max",
                !!breakpointConfiguration.normal.breakpoint.width.toMax,
                (value: boolean) => {
                  set(
                    breakpointConfiguration,
                    "normal.breakpoint.width.toMax",
                    value
                  );
                  onChange({ ...breakpointConfiguration });
                }
              )}
            </div>
            <Tooltip2
              popoverClassName={css.tooltip}
              content={`Breakpoints width is range from minimum to maximum width in pixels. Configuration related to device is used when device/browser vieport width is in this range.`}
            >
              <Icon icon="info-sign" style={{ marginTop: "7px" }}></Icon>
            </Tooltip2>
          </div>

          <div className={css.inlineRow}>
            <Text className={css.inlineRowLabel}>Page size</Text>
            <div className="input60 labelOneLetter">
              {getNumericFiled(
                "W",
                breakpointConfiguration.normal.page.width,
                (value: number) => {
                  set(breakpointConfiguration, "normal.page.width", value);
                  onChange({ ...breakpointConfiguration });
                },
                "",
                { disabled: true }
              )}
            </div>
            <div className="input60 labelOneLetter">
              {getNumericFiled(
                "H",
                breakpointConfiguration.normal.page.height,
                (value: number) => {
                  set(breakpointConfiguration, "normal.page.height", value);
                  onChange({ ...breakpointConfiguration });
                }
              )}
            </div>
            <Tooltip2
              popoverClassName={css.tooltip}
              content={`Page size is a size during editing. Width is not editable, it's inherited form Breakpoint width and represents absolute maximal width.`}
            >
              <Icon icon="info-sign" style={{ marginTop: "7px" }}></Icon>
            </Tooltip2>
          </div>
          <div className={css.inlineRow}>
            <Text className={css.inlineRowLabel}>Max slider size</Text>
            <div className="input60">
              {getNumericFiled(
                "W",
                breakpointConfiguration.normal.maxSliderSize.width,
                (value: number) => {
                  set(
                    breakpointConfiguration,
                    "normal.maxSliderSize.width",
                    value
                  );
                  onChange({ ...breakpointConfiguration });
                }
              )}
            </div>
            <div className="input60">
              {getNumericFiled(
                "H",
                breakpointConfiguration.normal.maxSliderSize.height,
                (value: number) => {
                  set(
                    breakpointConfiguration,
                    "normal.maxSliderSize.height",
                    value
                  );
                  onChange({ ...breakpointConfiguration });
                }
              )}
            </div>
          </div>

          <div className={css.inlineRow}>
            <Text className={css.inlineRowLabel}>Slider Width</Text>
            <div className="input60">
              {getSelectField(
                "",
                breakpointConfiguration.normal.widthBehavior?.type as any,
                [
                  {
                    value: "useMaxWidth",
                    label: `Default (Max width: ${breakpointConfiguration.normal.maxSliderSize.width}px)`,
                  },
                  { value: "fullwidth", label: "Full width (100%)" },
                ],
                (value: any) => {
                  set(
                    breakpointConfiguration,
                    "normal.widthBehavior.type",
                    value
                  );
                  onChange({ ...breakpointConfiguration });
                }
              )}
            </div>
          </div>

          <div className={css.inlineRow}>
            <Text className={css.inlineRowLabel}>Slider Height</Text>
            <div className="input60">
              {getSelectField(
                "",
                breakpointConfiguration.normal.heightBehavior?.type as any,
                [
                  { value: "keepAspectRatio", label: "Keep aspect ratio" },
                  {
                    value: "keepAspectRatioBelowMaxSliderSize",
                    label: "Keep aspect ratio (below Max slider width)",
                  },
                  {
                    value: "fixed",
                    label: `Fixed (${breakpointConfiguration.normal.maxSliderSize.height})`,
                  },
                  { value: "fullheight", label: "Full height (100%)" },
                ],
                (value: any) => {
                  set(
                    breakpointConfiguration,
                    "normal.heightBehavior.type",
                    value
                  );
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

          <div className={css.inlineRow}>
            <Text className={css.inlineRowLabel}>Grid</Text>
            <div className="input60 labelOneLetter">
              {getNumericFiled(
                "V",
                breakpointConfiguration.normal.grid.vertical,
                (value: number) => {
                  set(breakpointConfiguration, "normal.grid.vertical", value);
                  onChange({ ...breakpointConfiguration });
                }
              )}
            </div>
            <div className="input60 labelOneLetter">
              {getNumericFiled(
                "H",
                breakpointConfiguration.normal.grid.horizontal,
                (value: number) => {
                  set(breakpointConfiguration, "normal.grid.horizontal", value);
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
