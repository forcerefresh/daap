import React from "react";
import { cloneDeep } from "lodash-es";
import { IObject } from "webslider-sdk/lib/objects/i-object";
import { BreakpointConfiguration } from "webslider-sdk/lib/common/i-breakpoint-configuration";
import { Rect } from "webslider-sdk/lib/objects/i-objects-register";
import { StageToolRotateEventData } from "../../../utils/selection-manager/events/StageToolEvent";
import { decomposeMatrix2DW3 } from "../stage-panel-utils";
import { getObjectRotation, getObjectScale } from "../../../objects/object-utils";
import { computeGroupChildrenBounds } from "../../../store/actions/actions-utils";

function getRotationPivot(
  object: IObject,
  objectById: { [key: string]: IObject },
): { pivotX: number; pivotY: number } {
  if (object.type === "group") {
    const bounds = computeGroupChildrenBounds(object.id, objectById);
    if (bounds) {
      return { pivotX: bounds.x + bounds.w / 2, pivotY: bounds.y + bounds.h / 2 };
    }
  }
  return { pivotX: (object.width ?? 0) / 2, pivotY: (object.height ?? 0) / 2 };
}

function buildRotationMatrix(
  objectSize: Rect,
  currentRotation: number,
  scale: number,
  pivotX: number,
  pivotY: number,
  angle: number,
): DOMMatrix {
  const m = new DOMMatrix();
  m.translateSelf(objectSize.x, objectSize.y);
  m.rotateSelf(currentRotation);
  m.translateSelf(pivotX * scale, pivotY * scale);
  m.rotateSelf(angle);
  m.scaleSelf(scale);
  m.translateSelf(-pivotX, -pivotY);
  return m;
}

export function processRotateStartEvent(
  _eData: StageToolRotateEventData,
  _objectById: any,
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

  const { pivotX, pivotY } = getRotationPivot(object, objectById);
  const m = buildRotationMatrix(
    objectSize,
    getObjectRotation(object),
    getObjectScale(object),
    pivotX,
    pivotY,
    angle,
  );

  const d = decomposeMatrix2DW3(m);
  const transform = "rotate(" + d.rotateZ + "deg) scale(" + d.scaleX + ")";

  const objectHolder = document.getElementsByClassName(
    `object-holder-${objectId}`,
  )[0] as HTMLDivElement;

  if (objectHolder) {
    objectHolder.style.left = d.translateX + "px";
    objectHolder.style.top = d.translateY + "px";
    objectHolder.style.transform = transform;
  }
}

export function processRotateStopEvent(
  eData: StageToolRotateEventData,
  objectById: { [key: string]: IObject },
  _storeProps: {
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

  const { pivotX, pivotY } = getRotationPivot(object, objectById);
  const m = buildRotationMatrix(
    objectSize,
    getObjectRotation(object),
    getObjectScale(object) ?? 1,
    pivotX,
    pivotY,
    angle,
  );

  const d = decomposeMatrix2DW3(m);

  const newObject = cloneDeep(object);
  newObject.rotation = d.rotateZ;
  newObject.left = d.translateX;
  newObject.top = d.translateY;

  _updateObject(newObject);
}
