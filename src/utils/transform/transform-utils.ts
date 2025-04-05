import { SnapBounds } from "../../webslider-sdk/object/i-tool-class";
import { IObject } from "../App";

export interface Point {
  x: number;
  y: number;
}

export function getObjectCSSTransform_New(object: {
  scale?: number;
  rotation?: number;
}): string {
  return (
    "rotate(" +
    (object.rotation ?? 0) +
    "deg) scale(" +
    (object.scale ?? 1) +
    ")"
  );
}

export const stagePointToObjectSpace_New = (
  objectArr2: IObject[],
  p: Point,
  stageZoom: number
  // ignoreTranslate: boolean = false
  // includeTranslate = true
) => {
  // const isGroup = objectArr2.length > 1;

  const objectArr = [...objectArr2];

  // NOTE: remove object we are moving from calculation

  objectArr.pop();

  // if (isGroup) {
  //   objectArr[0].left = 0;
  //   objectArr[0].top = 0;
  //   if (objectArr[1]) {
  //     objectArr[1].left = 0;
  //     objectArr[1].top = 0;
  //   }
  // }

  const doomMatrifArr = populateDOMMatrixArr_New(objectArr, true);

  const objTransform = multiplyDOMMatrixArrRec_New(doomMatrifArr);

  const finalTransform = new DOMMatrix("scale(" + stageZoom + ")").multiply(
    objTransform
  );

  const pointMatrix = new DOMMatrix(
    `translateX(${p.x}px) translateY(${p.y}px)`
  );

  // return objTransform.transformPoint(p);

  // const finalTransform = finalTransform2.inverse().multiplySelf( pointMatrix);

  finalTransform.invertSelf().multiplySelf(pointMatrix);

  const translateX = finalTransform.e;
  const translateY = finalTransform.f;

  console.log(p);

  console.log({ x: translateX, y: translateY });

  return { x: translateX, y: translateY };

  return p;
};

export const objectPointToStageSpace_New = (
  objectArr: IObject[],
  p: Point,
  stageZoom: number
  // includeTranslate = true
) => {
  const doomMatrifArr = populateDOMMatrixArr_New(objectArr);

  const objTransform = multiplyDOMMatrixArrRec_New(doomMatrifArr);

  const finalTransform = new DOMMatrix("scale(" + stageZoom + ")").multiply(
    objTransform
  );

  console.log("scale(" + stageZoom + ")");
  const pointMatrix = new DOMMatrix(
    `translateX(${p.x}px) translateY(${p.y}px)`
  );

  // return objTransform.transformPoint(p);

  finalTransform.multiplySelf(pointMatrix);
  const translateX = finalTransform.e;
  const translateY = finalTransform.f;

  return { x: translateX, y: translateY };
};

function populateDOMMatrixArr_New(
  objectArr: IObject[],
  ignoreTranslate: boolean = false
): DOMMatrix[] {
  return objectArr.map((object) => {
    const rotationSign = "";
    const translate = ignoreTranslate
      ? ""
      : `translateX(${object.left}px) translateY(${object.top}px) `;
    const transformStr = `${translate}rotate(${rotationSign}${
      object.rotation ?? 0
    }deg) scale(${object.scale ?? 1})`;

    return new DOMMatrix(transformStr);
  });
}

function multiplyDOMMatrixArrRec_New(domMatrixArr: DOMMatrix[]): DOMMatrix {
  if (domMatrixArr.length === 0) return new DOMMatrix();
  const domMatrix = domMatrixArr.pop();
  return multiplyDOMMatrixArrRec_New(domMatrixArr).multiply(domMatrix);
}

export function getObjectBounds(objectPathArr: IObject[]): SnapBounds {
  const object = objectPathArr[objectPathArr.length - 1];

  const lt = objectPointToStageSpace_New(
    objectPathArr,
    {
      x: 0,
      y: 0,
    },
    1
  );

  const lb = objectPointToStageSpace_New(
    objectPathArr,
    {
      x: 0,
      y: object.height!,
    },
    1
  );

  const rt = objectPointToStageSpace_New(
    objectPathArr,
    {
      x: object.width!,
      y: 0,
    },
    1
  );

  const rb = objectPointToStageSpace_New(
    objectPathArr,
    {
      x: object.width!,
      y: object.height!,
    },
    1
  );

  const bounds = {
    top: Math.min(lt.y, lb.y, rt.y, rb.y),
    left: Math.min(lt.x, lb.x, rt.x, rb.x),
    bottom: Math.max(lt.y, lb.y, rt.y, rb.y),
    right: Math.max(lt.x, lb.x, rt.x, rb.x),
  };

  return {
    ...bounds,
    vcenter: bounds.left + (bounds.right - bounds.left) / 2,
    hcenter: bounds.top + (bounds.bottom - bounds.top) / 2,
  };
}
