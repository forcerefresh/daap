import { IObject } from "webslider-sdk/lib/objects/i-object";
import { Rect } from "../../webslider-sdk/object/i-tool-class";
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

// export function getObjectBoundingBox(object: IObject): Rect {
//   const rotationDeg = object.rotation;
//   const rotation = (rotationDeg * Math.PI) / 180;
//   const scale = object.scale;

//   // TODO: getObject size
//   let oX = parseFloat(object.absoluteLayout!.common.left);
//   let oY = parseFloat(object.absoluteLayout!.common.top);
//   let oH = parseFloat(object.absoluteLayout!.common.height);
//   let oW = parseFloat(object.absoluteLayout!.common.width);

//   oX = oX - (oW * (scale - 1)) / 2;
//   oY = oY - (oH * (scale - 1)) / 2;
//   oW = oW * scale;
//   oH = oH * scale;

//   const rXCenter = oX + oW / 2;
//   const rYCenter = oY + oH / 2;

//   const height =
//     oW * Math.abs(Math.sin(rotation)) + oH * Math.abs(Math.cos(rotation));
//   const width =
//     oW * Math.abs(Math.cos(rotation)) + oH * Math.abs(Math.sin(rotation));

//   const x = rXCenter - width / 2;
//   const y = rYCenter - height / 2;

//   return { x, y, width, height };

//   //   return {
//   //     x: x - (x * (scale - 1)) / 2,
//   //     y: y - (y * (scale - 1)) / 2,
//   //     width: width * scale,
//   //     height: height * scale,
//   //   };
// }

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
