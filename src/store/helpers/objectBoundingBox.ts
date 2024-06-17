import { IObject } from "webslider-sdk/lib/objects/i-object";
import { Rect } from "../../webslider-sdk/object/i-tool-class";

export function getObjectBoundingBox(object: IObject): Rect {
  const rotationDeg = object.rotation;
  const rotation = (rotationDeg * Math.PI) / 180;
  const scale = object.scale;

  // TODO: getObject size
  let oX = parseInt(object.absoluteLayout!.common.left);
  let oY = parseInt(object.absoluteLayout!.common.top);
  let oH = parseInt(object.absoluteLayout!.common.height);
  let oW = parseInt(object.absoluteLayout!.common.width);

  oX = oX - (oW * (scale - 1)) / 2;
  oY = oY - (oH * (scale - 1)) / 2;
  oW = oW * scale;
  oH = oH * scale;

  const rXCenter = oX + oW / 2;
  const rYCenter = oY + oH / 2;

  const height =
    oW * Math.abs(Math.sin(rotation)) + oH * Math.abs(Math.cos(rotation));
  const width =
    oW * Math.abs(Math.cos(rotation)) + oH * Math.abs(Math.sin(rotation));

  const x = rXCenter - width / 2;
  const y = rYCenter - height / 2;

  return { x, y, width, height };

  //   return {
  //     x: x - (x * (scale - 1)) / 2,
  //     y: y - (y * (scale - 1)) / 2,
  //     width: width * scale,
  //     height: height * scale,
  //   };
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
