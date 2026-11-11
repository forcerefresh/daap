import { useEffect, useRef } from "react";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { getInitialStageTransform } from "../../../store/helpers/calculateZoom";
import { Point } from "webslider-sdk/lib/objects/i-objects-register";
import { TransformType } from "../zoom-pan/useZoomPan";

interface UseZoomFitParams {
  viewPortSize: { w: number; h: number };
  breakpointConfig: BreakpointConfiguration | undefined;
  showSimplifiedLayerPanel: boolean;
  showSimplifiedPagesPanel: boolean;
  appZoom: number;
  zoomFit: boolean;
  stageZoom: number;
  canvasTransform: TransformType;
  setTransform: (transform: Partial<TransformType>) => void;
  handleScaleChange: (scale: number) => void;
  _setStageZoom: (zoom: number) => void;
  _setStagePan: (p: Point) => void;
  _setZoomFit: (fit: boolean) => void;
}

export function useZoomFit({
  viewPortSize,
  breakpointConfig,
  showSimplifiedLayerPanel,
  showSimplifiedPagesPanel,
  appZoom,
  zoomFit,
  stageZoom,
  canvasTransform,
  setTransform,
  handleScaleChange,
  _setStageZoom,
  _setStagePan,
  _setZoomFit,
}: UseZoomFitParams) {
  const disableZoomUpdateRef = useRef<boolean>(false);

  // Initial zoom-to-fit on mount, then disabled after 2s
  useEffect(() => {
    if (disableZoomUpdateRef.current) return;

    const newTransform = getInitialStageTransform(
      viewPortSize,
      breakpointConfig,
      showSimplifiedLayerPanel,
      showSimplifiedPagesPanel,
      appZoom,
    );

    if (newTransform.scale > 0) {
      setTransform(newTransform);
      _setZoomFit(false);
    }

    setTimeout(() => {
      disableZoomUpdateRef.current = true;
    }, 2000);
  }, [appZoom, breakpointConfig, viewPortSize]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync canvasTransform → Redux
  useEffect(() => {
    if (stageZoom !== canvasTransform.scale && canvasTransform.scale > 0) {
      _setStageZoom(canvasTransform.scale);
      _setZoomFit(false);
    }

    _setStagePan({
      x: canvasTransform.translateX,
      y: canvasTransform.translateY,
    });
  }, [canvasTransform]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync Redux stageZoom → canvas (external zoom changes, e.g. zoom toolbar)
  useEffect(() => {
    if (stageZoom !== canvasTransform.scale) {
      handleScaleChange(stageZoom);
    }
  }, [stageZoom]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply zoom-fit when requested via Redux flag
  useEffect(() => {
    if (zoomFit) {
      setTransform(
        getInitialStageTransform(
          viewPortSize,
          breakpointConfig,
          showSimplifiedLayerPanel,
          showSimplifiedPagesPanel,
          appZoom,
        ),
      );
      _setZoomFit(false);
    }
  }, [zoomFit, appZoom, viewPortSize, breakpointConfig]); // eslint-disable-line react-hooks/exhaustive-deps
}
