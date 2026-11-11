import { IObject } from "webslider-sdk/lib/objects/i-object";
import { Rect } from "webslider-sdk/lib/objects/i-objects-register";
import { decomposeMatrix2DW3 } from "../../panels/stage-panel-new/stage-panel-utils";

export function getObjectBoundingBox(object: IObject): Rect {
  // NOTE: LAYOUT CHANGE
  const oX = object.left;
  const oY = object.top;
  const oW = object.width;
  const oH = object.height;

  const getBasePointMatrix = (object: IObject) => {
    const pm = new DOMMatrix();
    pm.translateSelf(oX, oY);
    pm.rotateSelf(object.rotation);
    pm.scaleSelf(object.scale);
    return pm;
  };

  const retObj = {
    x: 1000000,
    y: 1000000,
    width: -1000000,
    height: -1000000,
  };

  const mTL = getBasePointMatrix(object);
  mTL.translateSelf(0, 0);

  const mTR = getBasePointMatrix(object);
  mTR.translateSelf(oW, 0);

  const mBL = getBasePointMatrix(object);
  mBL.translateSelf(0, oH);

  const mBR = getBasePointMatrix(object);
  mBR.translateSelf(oW, oH);

  [mTL, mTR, mBL, mBR].forEach((m: DOMMatrix) => {
    const dp = decomposeMatrix2DW3(m);
    retObj.x = Math.min(retObj.x, dp.translateX);
    retObj.y = Math.min(retObj.y, dp.translateY);
    retObj.width = Math.max(retObj.width, dp.translateX);
    retObj.height = Math.max(retObj.height, dp.translateY);
  });

  return {
    ...retObj,
    width: retObj.width - Math.abs(retObj.x),
    height: retObj.height - Math.abs(retObj.y),
  };
}

export function boundsUnion(b1: Rect, b2: Rect): Rect {
  const minX = Math.min(b1.x, b2.x);
  const minY = Math.min(b1.y, b2.y);
  return {
    x: minX,
    y: minY,
    width: Math.max(b1.x + b1.width, b2.x + b2.width) - minX,
    height: Math.max(b1.y + b1.height, b2.y + b2.height) - minY,
  };
}

export function rect2DOMRect(rect: Rect): DOMRect {
  return new DOMRect(rect.x, rect.y, rect.width, rect.height);
}
