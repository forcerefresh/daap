import React, { useEffect, useState } from "react";

import css from "./ViewportSize.module.scss";
import { Slider } from "@blueprintjs/core";
import { IStore } from "../../store/store";
import { connect } from "react-redux";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import classnames from "classnames";

type IViewportSizeProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    onChange: (size: { width: number }) => void;
  };

const ViewportSize: React.FC<IViewportSizeProps> = (props) => {
  const { onChange, breakpointConfig } = props;

  const [sliderValue, setSliderValue] = useState(
    breakpointConfig?.normal.breakpoint.width.to
  );

  useEffect(() => {
    setSliderValue(breakpointConfig?.normal.breakpoint.width.to);
  }, [breakpointConfig?.normal.breakpoint.width.to]);

  const range =
    breakpointConfig!.normal.breakpoint.width.to -
    breakpointConfig!.normal.breakpoint.width.from;

  const renderLabel = (val: number) => {
    return `${Math.round(val)}px`;
  };

  if (range <= 0) return null;

  return (
    <div className={css.vieportSize}>
      <div className={css.vieportSizeInner}>
        <div className={css.sliderHolder}>
          <Slider
            className={classnames(css.slider)}
            min={breakpointConfig?.normal.breakpoint.width.from}
            max={breakpointConfig?.normal.page.width}
            labelStepSize={range}
            onChange={(value) => {
              setSliderValue(value);
              onChange({ width: value });
            }}
            labelRenderer={renderLabel}
            showTrackFill={false}
            value={sliderValue}
          />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: IStore) => {
  const { project } = state;

  const breakpointConfig: BreakpointConfiguration | undefined =
    project.settings.breakpoints.breakpointsConfiguration.find(
      (breakpointConfig: any) =>
        breakpointConfig.type === state.stage.selectedDevice
    );

  return {
    breakpointConfig,
  };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ViewportSize);
