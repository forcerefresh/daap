import React from "react";
import { cloneDeep } from "lodash-es";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { Rect } from "../../../webslider-sdk/object/i-tool-class";
import { StageToolRotateEventData } from "../../../utils/selection-manager/events/StageToolEvent";
import { decomposeMatrix2DW3 } from "../stage-panel-utils";
import { getObjectRotation, getObjectScale } from "../../../objects/object-utils";

export function processRotateStartEvent(
  eData: StageToolRotateEventData,
  objectById: any,
  _updateObject: any,
) {
  // do nothing
}

export function processRotateChangeEvent(
  eData: StageToolRotateEventData,
  objectById: any,
  _updateObject: any,
) {
  const objectId = eData.objectId;
  const object = objectById[objectId];
  const angle = eData.angle;

  const objectSize: Rect = {
    x: object.left!,
    y: object.top!,
    width: object.width!,
    height: object.height!,
  };

  let left = objectSize.x;
  let top = objectSize.y;

  const m = new DOMMatrix();

  m.translateSelf(objectSize.x, objectSize.y);
  m.rotateSelf(getObjectRotation(object));
  m.translateSelf(
    (objectSize.width / 2) * getObjectScale(object),
    (objectSize.height / 2) * getObjectScale(object),
  );
  m.rotateSelf(angle);
  m.scaleSelf(getObjectScale(object));
  m.translateSelf(-(objectSize.width / 2), -(objectSize.height / 2));

  const d = decomposeMatrix2DW3(m);

  left = d.translateX;
  top = d.translateY;
  const transform = "rotate(" + d.rotateZ + "deg) scale(" + d.scaleX + ")";

  const objectHolder = document.getElementsByClassName(
    `object-holder-${objectId}`,
  )[0] as HTMLDivElement;

  if (objectHolder) {
    objectHolder.style.left = left + "px";
    objectHolder.style.top = top + "px";
    objectHolder.style.transform = transform;
  }
}

export function processRotateStopEvent(
  eData: StageToolRotateEventData,
  objectById: { [key: string]: IObject },
  storeProps: {
    selectedObjectIdsRef: React.MutableRefObject<string[]>;
    zoom: number;
    breakpointConfig?: BreakpointConfiguration;
  },
  storeActions: {
    _updateObject: any;
    _activateObject: any;
    _selectObjects: any;
  },
) {
  const { breakpointConfig } = storeProps;
  const { _updateObject } = storeActions;

  const objectId = eData.objectId;
  const object = objectById[objectId];
  const angle = eData.angle;

  const objectSize: Rect = {
    x: object.left!,
    y: object.top!,
    width: object.width!,
    height: object.height!,
  };

  let left = objectSize.x;
  let top = objectSize.y;

  const m = new DOMMatrix();

  m.translateSelf(objectSize.x, objectSize.y);
  m.rotateSelf(getObjectRotation(object));
  m.translateSelf(
    (objectSize.width / 2) * (getObjectScale(object) ?? 1),
    (objectSize.height / 2) * (getObjectScale(object) ?? 1),
  );
  m.rotateSelf(angle);
  m.scaleSelf(getObjectScale(object));
  m.translateSelf(-(objectSize.width / 2), -(objectSize.height / 2));

  const d = decomposeMatrix2DW3(m);

  left = d.translateX;
  top = d.translateY;
  const transform = "rotate(" + d.rotateZ + "deg) scale(" + d.scaleX + ")";

  const newObject = cloneDeep(object);

  newObject.rotation = d.rotateZ;
  newObject.left = left;
  newObject.top = top;

  _updateObject(newObject);
}
