import React, { useEffect, useState } from "react";

import css from "./ViewportSize.module.scss";
import { Button, HTMLSelect, Slider } from "@blueprintjs/core";
import { ReactComponent as RepeatIcon } from "../../assets/icons/repeat.svg";
import { IStore } from "../../store/store";
import { IPreviewState } from "../../store/reducers/stage";
import { setStagePreview } from "../../store/actions/actions";
import { connect } from "react-redux";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";
import cx from "classnames";
import { getResponsiveIcon } from "../../utils/icons/responsive-icons-factory";
import { getIconSize, getIconStyle } from "../action-panel/ActionPanel";
import { getIconByType } from "../../store/reducers/settings";
import { BreakpointConfiguration } from "../../store/reducers/i-settings";
import classnames from "classnames";
import useDeepCompareEffect from "use-deep-compare-effect";

type IViewportSizeProps = typeof mapDispatchToProps &
  ReturnType<typeof mapStateToProps> & {
    onChange: (size: { width: number }) => void;
  };

const ViewportSize: React.FC<IViewportSizeProps> = (props) => {
  const { onChange, breakpointsConfiguration, breakpointConfig } = props;

  const initialWidth = 1000;

  const minWidth = 240;
  const maxWidth = 1920;
  const [currentWidth, setCurrentWidth] = useState(1280);

  //const [progress, setProgress] = useState<number>(0);

  const lineRef = React.useRef(null);

  const [sliderValue, setSliderValue] = useState(
    breakpointConfig?.normal.breakpoint.width.to
  );

  useEffect(() => {
    setSliderValue(breakpointConfig?.normal.breakpoint.width.to);
  }, [breakpointConfig?.normal.breakpoint.width.to]);

  /* useEffect(() => {
    tl.eventCallback("onUpdate", () => {
      setProgress(tl.progress());
    });
    return () => {
      // TODO: do we need to cleanup;
    };
  }, [tl]);*/

  //const thumbStyle = {
  //  left: ((lineRef?.current as any)?.offsetWidth || 0) * progress + "px",
  //};

  const left =
    ((lineRef?.current as any)?.offsetWidth || 0) * (currentWidth / maxWidth);
  const position = { x: left, y: 0 };

  const handleDragChange = (x: number) => {
    const multiplier = x / (lineRef?.current as any)?.offsetWidth;
    const newW = Math.round(maxWidth * multiplier);
    setCurrentWidth(newW);
    onChange({ width: newW });
    //tl.progress(multiplier, true);
  };

  const renderDeviceIcons = () => {
    return breakpointsConfiguration.breakpointsConfiguration.map((bpConfig) => {
      const iconName = getIconByType(bpConfig.type);
      const size = getIconSize(iconName);

      const iconStyle = getIconStyle(iconName);

      //
      const maxWidth = 2000;
      //const minWidth = 300;
      // const rangeWidth = maxWidth - minWidth;
      let leftPos =
        (bpConfig.normal.maxSliderSize.width / maxWidth) *
        (lineRef?.current as any)?.offsetWidth;

      leftPos += 10;

      const icon = getResponsiveIcon(
        iconName,
        size.w,
        size.h,
        "lightgray",
        bpConfig.portrait,
        { verticalAlign: "text-bottom", ...iconStyle }
      );

      return (
        <div style={{ left: leftPos }} className={css.iconHolder}>
          {icon}
        </div>
      );
    });
  };

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
            max={breakpointConfig?.normal.breakpoint.width.to}
            labelStepSize={range}
            onChange={(value) => {
              setSliderValue(value);
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
  const { stage, project } = state;

  const breakpointConfig: BreakpointConfiguration | undefined =
    project.settings.breakpoints.breakpointsConfiguration.find(
      (breakpointConfig: any) =>
        breakpointConfig.type === state.stage.selectedDevice
    );

  return {
    breakpointConfig,
    previewState: stage.previewState,
    breakpointsConfiguration: state.project.settings.breakpoints,
  };
};

const mapDispatchToProps = {
  _setStagePreview: (preview: Partial<IPreviewState>) =>
    setStagePreview(preview),
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewportSize);
