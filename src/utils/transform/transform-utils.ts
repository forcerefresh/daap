import { SnapBounds } from "webslider-sdk/lib/objects/i-objects-register";
import { IObject } from "webslider-sdk/lib/objects/i-object";

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
  stageZoom: number,
) => {
  const objectArr = [...objectArr2];

  // NOTE: remove object we are moving from calculation
  objectArr.pop();

  const doomMatrifArr = populateDOMMatrixArr_New(objectArr, true);
  const objTransform = multiplyDOMMatrixArrRec_New(doomMatrifArr);

  const finalTransform = new DOMMatrix("scale(" + stageZoom + ")").multiply(
    objTransform
  );

  const pointMatrix = new DOMMatrix(
    `translateX(${p.x}px) translateY(${p.y}px)`
  );

  finalTransform.invertSelf().multiplySelf(pointMatrix);

  return { x: finalTransform.e, y: finalTransform.f };
};

export const objectPointToStageSpace_New = (
  objectArr: IObject[],
  p: Point,
  stageZoom: number,
) => {
  const doomMatrifArr = populateDOMMatrixArr_New(objectArr);
  const objTransform = multiplyDOMMatrixArrRec_New(doomMatrifArr);

  const finalTransform = new DOMMatrix("scale(" + stageZoom + ")").multiply(
    objTransform
  );

  const pointMatrix = new DOMMatrix(
    `translateX(${p.x}px) translateY(${p.y}px)`
  );

  finalTransform.multiplySelf(pointMatrix);

  return { x: finalTransform.e, y: finalTransform.f };
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
