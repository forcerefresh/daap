import React from "react";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { StageToolPanEventData } from "../../../utils/selection-manager/events/StageToolEvent";

export function processPanChangeEvent(
  eData: StageToolPanEventData,
  objectById: { [key: string]: IObject },
  storeProps: {
    selectedObjectIdsRef: React.MutableRefObject<string[]>;
    zoom: number;
  },
  storeActions: {
    _setStagePan: any;
  },
) {
  const { zoom } = storeProps;
  const { _setStagePan } = storeActions;

  const x = eData.x!;
  const y = eData.y!;

  _setStagePan({ currentX: x, currentY: y });
}

export function processPanStopEvent(
  eData: StageToolPanEventData,
  objectById: { [key: string]: IObject },
  storeProps: {
    selectedObjectIdsRef: React.MutableRefObject<string[]>;
    zoom: number;
    stagePan: any;
  },
  storeActions: {
    _setStagePan: any;
  },
) {
  const { zoom, stagePan } = storeProps;
  const { _setStagePan } = storeActions;

  const x = eData.x!;
  const y = eData.y!;

  _setStagePan({
    x: stagePan.x + x,
    y: stagePan.y + y,
    currentX: 0,
    currentY: 0,
  });
}
